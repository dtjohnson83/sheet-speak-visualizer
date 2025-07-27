
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Try multiple possible environment variable names for the API key
const xaiApiKey = Deno.env.get('XAI_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

// Enhanced security headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userRequests.count >= maxRequests) {
    return false;
  }

  userRequests.count++;
  return true;
}

function sanitizeError(error: any): string {
  const message = error?.message || error?.toString() || 'Unknown error';
  return message.replace(/key|token|secret|password|api/gi, '[REDACTED]').substring(0, 200);
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DataContext {
  columns: Array<{
    name: string;
    type: string;
    values: any[];
    description?: string;
    businessMeaning?: string;
    unit?: string;
    isKPI?: boolean;
    expectedRange?: string;
  }>;
  sampleData: any[];
  totalRows: number;
  fileName?: string;
  enhancedContext?: {
    businessDomain: string;
    businessPurpose: string;
    timePeriod: string;
    objectives: string[];
    industry: string;
    primaryDateColumn: string;
    keyMetrics: string[];
    dimensions: string[];
    measures: string[];
    dataQuality: {
      completeness: number;
      consistency: number;
      validity: number;
    };
    businessRules: string[];
    commonPatterns: string[];
  };
}

interface RequestBody {
  messages: ChatMessage[];
  dataContext: DataContext;
  toneId?: string;
}

// Query complexity classification
interface QueryClassification {
  type: 'simple' | 'complex' | 'strategic' | 'technical';
  maxTokens: number;
  responseStructure: string;
}

function classifyQuery(userQuery: string): QueryClassification {
  const query = userQuery.toLowerCase();
  
  // Simple queries - basic stats, single metrics
  if (query.includes('how many') || query.includes('what is the') || query.includes('show me') || 
      query.includes('average') || query.includes('total') || query.includes('count') ||
      query.includes('maximum') || query.includes('minimum') || query.includes('median')) {
    return {
      type: 'simple',
      maxTokens: 400,
      responseStructure: 'ANSWER_ONLY'
    };
  }
  
  // Strategic queries - recommendations, insights, business impact
  if (query.includes('recommend') || query.includes('strategy') || query.includes('should i') ||
      query.includes('business impact') || query.includes('opportunity') || query.includes('risk') ||
      query.includes('improve') || query.includes('optimize') || query.includes('next steps')) {
    return {
      type: 'strategic',
      maxTokens: 800,
      responseStructure: 'EXECUTIVE_SUMMARY'
    };
  }
  
  // Technical queries - methodology, calculations, technical details
  if (query.includes('how did you') || query.includes('methodology') || query.includes('calculate') ||
      query.includes('algorithm') || query.includes('technical') || query.includes('explain the process')) {
    return {
      type: 'technical',
      maxTokens: 600,
      responseStructure: 'TECHNICAL_DETAILED'
    };
  }
  
  // Complex queries - analysis, correlations, trends
  return {
    type: 'complex',
    maxTokens: 600,
    responseStructure: 'STRUCTURED_ANALYSIS'
  };
}

// Business-focused tone definitions
const TONE_MODIFIERS: Record<string, string> = {
  'direct-efficient': `
COMMUNICATION STYLE: Direct & Business-Focused
- Lead with the key finding or answer
- Use specific data values and percentages
- Focus on business impact over statistical methods
- Keep responses concise and actionable`,
  
  'professional-formal': `
COMMUNICATION STYLE: Executive Professional
- Present findings in executive summary format
- Use business-appropriate language
- Reference key metrics and performance indicators
- Provide clear recommendations`,
  
  'conversational-friendly': `
COMMUNICATION STYLE: Accessible Business Insights
- Explain findings in plain business language
- Use analogies and examples from the data
- Make complex patterns understandable
- Focus on practical implications`,
  
  'consultative-expert': `
COMMUNICATION STYLE: Strategic Consultant
- Provide strategic insights based on data evidence
- Reference industry benchmarks when relevant
- Offer actionable business recommendations
- Consider broader business context and implications`,
  
  'supportive-educational': `
COMMUNICATION STYLE: Business Coach
- Guide users through data insights step-by-step
- Explain what the findings mean for their business
- Provide educational context when helpful
- Focus on learning and understanding`,
  
  'urgent-alert': `
COMMUNICATION STYLE: Critical Business Alert
- Highlight urgent findings immediately at the top
- Focus on immediate business actions required
- Use clear, direct language about risks/opportunities
- Prioritize time-sensitive insights`,
  
  'analytical-neutral': `
COMMUNICATION STYLE: Data-Driven Analyst
- Present objective findings without bias
- Use precise business metrics and KPIs
- Focus on factual patterns in the data
- Maintain professional analytical tone`
};

// Create optimized data context for AI analysis
function createOptimizedDataContext(dataContext: DataContext): string {
  const { columns, sampleData, totalRows, fileName, enhancedContext } = dataContext;
  
  // Create column summaries with actual statistics
  const columnSummaries = columns.map(col => {
    const values = col.values || [];
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const completeness = values.length > 0 ? Math.round((nonNullValues.length / values.length) * 100) : 0;
    
    let summary = `${col.name} (${col.type})`;
    
    if (col.businessMeaning) {
      summary += ` - ${col.businessMeaning}`;
    }
    
    if (col.type === 'numeric' && nonNullValues.length > 0) {
      const nums = nonNullValues.map(v => Number(v)).filter(v => !isNaN(v));
      if (nums.length > 0) {
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const median = nums.sort((a, b) => a - b)[Math.floor(nums.length / 2)];
        summary += ` [Range: ${min.toFixed(2)}-${max.toFixed(2)}, Avg: ${avg.toFixed(2)}, Median: ${median.toFixed(2)}]`;
      }
    } else if (col.type === 'categorical' && nonNullValues.length > 0) {
      const uniqueValues = [...new Set(nonNullValues)];
      const topValues = uniqueValues.slice(0, 5);
      summary += ` [${uniqueValues.length} unique values: ${topValues.join(', ')}${uniqueValues.length > 5 ? '...' : ''}]`;
    }
    
    if (completeness < 100) {
      summary += ` [${completeness}% complete]`;
    }
    
    return summary;
  });

  // Create sample data representation
  const sampleDataString = sampleData.length > 0 
    ? JSON.stringify(sampleData.slice(0, 3), null, 2)
    : 'No sample data available';

  // Build context string
  let contextString = `DATASET: ${fileName || 'Unknown'} (${totalRows.toLocaleString()} rows total, analyzing ${sampleData.length} sample rows)

COLUMNS & STATISTICS:
${columnSummaries.join('\n')}

SAMPLE DATA:
${sampleDataString}`;

  // Add enhanced context if available
  if (enhancedContext) {
    contextString += `

BUSINESS CONTEXT:
- Domain: ${enhancedContext.businessDomain}
- Purpose: ${enhancedContext.businessPurpose}
- Industry: ${enhancedContext.industry}
- Time Period: ${enhancedContext.timePeriod}
- Key Objectives: ${enhancedContext.objectives.join(', ')}
- Primary Date Column: ${enhancedContext.primaryDateColumn}
- Key Metrics/KPIs: ${enhancedContext.keyMetrics.join(', ')}
- Dimensions: ${enhancedContext.dimensions.join(', ')}
- Measures: ${enhancedContext.measures.join(', ')}
- Data Quality: ${enhancedContext.dataQuality.completeness}% complete, ${enhancedContext.dataQuality.consistency}% consistent
- Business Rules: ${enhancedContext.businessRules.join('; ')}`;
  }

  return contextString;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, dataContext, toneId = 'direct-efficient' }: RequestBody = await req.json();

    // Validate required fields
    if (!messages || !dataContext || !dataContext.columns || !dataContext.sampleData) {
      throw new Error('Missing required fields: messages, dataContext with columns and sampleData');
    }

    // Determine which API to use based on available keys
    let apiUrl = '';
    let apiKey = '';
    let model = '';
    let provider = '';

    if (xaiApiKey) {
      apiUrl = 'https://api.x.ai/v1/chat/completions';
      apiKey = xaiApiKey;
      model = 'grok-3';
      provider = 'xAI';
    } else if (openaiApiKey) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = openaiApiKey;
      model = 'gpt-4o-mini';
      provider = 'OpenAI';
    } else {
      throw new Error('API key not configured. Please add XAI_API_KEY or OPENAI_API_KEY to your Supabase secrets.');
    }

    console.log(`Using ${provider} API with model ${model} for chat`);

    // Create optimized data context
    const optimizedContext = createOptimizedDataContext(dataContext);
    
    // Get tone modifier
    const toneModifier = TONE_MODIFIERS[toneId] || TONE_MODIFIERS['direct-efficient'];
    
    // Classify the user's query to determine response approach
    const userQuery = messages[messages.length - 1]?.content || '';
    const queryClass = classifyQuery(userQuery);
    
    // Create response structure template based on query type
    const responseStructures: Record<string, string> = {
      'ANSWER_ONLY': `
RESPONSE FORMAT:
🎯 ANSWER: [Direct answer with specific data values]
📊 KEY DATA: [2-3 supporting data points]
💡 INSIGHT: [Brief business implication]`,

      'EXECUTIVE_SUMMARY': `
RESPONSE FORMAT:
🎯 KEY FINDING: [Main insight in 1 sentence]
📊 SUPPORTING DATA: [2-3 key metrics with exact values]
💼 BUSINESS IMPACT: [What this means for business decisions]
🚀 RECOMMENDED ACTION: [Specific next step]`,

      'STRUCTURED_ANALYSIS': `
RESPONSE FORMAT:
🎯 SUMMARY: [Key finding in 1 sentence]
📊 DATA ANALYSIS: [Supporting evidence with specific values]
💡 PATTERNS: [Notable trends or relationships]
🚀 RECOMMENDATIONS: [Actionable next steps]`,

      'TECHNICAL_DETAILED': `
RESPONSE FORMAT:
🎯 SUMMARY: [Brief answer]
🔍 METHODOLOGY: [How the analysis was performed]
📊 TECHNICAL DETAILS: [Specific calculations or processes]
⚠️ LIMITATIONS: [Data or methodological constraints]`
    };

    // Create focused system prompt with response structure
    const systemPrompt = `You are a business data analyst providing accurate, actionable insights. Ground all responses in the actual data provided.

${optimizedContext}

${toneModifier}

${responseStructures[queryClass.responseStructure]}

CRITICAL RESPONSE RULES:
1. START with the direct answer or key finding
2. Use SPECIFIC data values, percentages, and metrics from the dataset
3. Focus on BUSINESS IMPACT over statistical methodology
4. NO lengthy methodology explanations unless specifically requested
5. NO contradictory statements about data availability
6. If using sample data, be clear about completeness: "Based on the ${dataContext.sampleData.length} sample rows from ${dataContext.totalRows.toLocaleString()} total rows..."
7. Keep responses concise and scannable
8. Use the provided format structure for consistency

DATA ACCURACY REQUIREMENTS:
- Only reference data that exists in the provided dataset
- Use exact numbers and calculations from the sample
- When extrapolating to full dataset, clearly state assumptions
- If data is insufficient for a claim, explicitly state the limitation

BUSINESS COMMUNICATION:
- Lead with conclusions, not process
- Focus on actionable insights
- Use executive-appropriate language
- Minimize technical jargon unless requested`;

    console.log(`Making request to ${provider} API...`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: queryClass.maxTokens,
        temperature: 0.3, // Lower temperature for more consistent, factual responses
        stream: false
      }),
    });

    console.log(`${provider} API response status:`, response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error(`${provider} API error response:`, error);
      throw new Error(`${provider} API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log(`${provider} API response received successfully`);
    
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const sanitizedError = sanitizeError(error);
    console.error('Error in ai-data-chat function:', sanitizedError);
    return new Response(JSON.stringify({ 
      error: sanitizedError,
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

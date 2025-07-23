
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

// Tone definitions - All emphasize data accuracy and specificity
const TONE_MODIFIERS: Record<string, string> = {
  'direct-efficient': `
Tone: Direct & Data-Focused
- Provide specific, data-driven answers
- Reference actual data values and patterns
- Use exact numbers and percentages from the dataset
- Be concise but thorough in analysis`,
  
  'professional-formal': `
Tone: Professional & Analytical
- Use precise statistical language
- Reference specific data points and trends
- Maintain formal analytical tone
- Focus on factual observations from the data`,
  
  'conversational-friendly': `
Tone: Conversational & Accessible
- Explain data insights in simple terms
- Use examples from the actual dataset
- Make complex patterns easy to understand
- Stay grounded in the provided data`,
  
  'consultative-expert': `
Tone: Expert Data Consultant
- Provide strategic insights based on data evidence
- Reference specific metrics and KPIs
- Offer actionable recommendations backed by data
- Use business intelligence terminology appropriately`,
  
  'supportive-educational': `
Tone: Educational & Explanatory
- Explain data concepts clearly
- Use specific examples from the dataset
- Help users understand what the data shows
- Guide through analytical thinking process`,
  
  'urgent-alert': `
Tone: Alert & Action-Oriented
- Highlight critical data findings immediately
- Use specific thresholds and values
- Focus on actionable data insights
- Prioritize urgent patterns in the data`,
  
  'analytical-neutral': `
Tone: Objective & Statistical
- Present data facts without interpretation
- Use precise statistical measures
- Reference exact values and distributions
- Maintain scientific objectivity`
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
    
    // Create focused system prompt
    const systemPrompt = `You are an expert data analyst providing accurate, data-driven insights. Always ground your responses in the actual data provided.

${optimizedContext}

${toneModifier}

ANALYSIS GUIDELINES:
1. ALWAYS reference specific data values, patterns, and statistics from the provided dataset
2. Use exact numbers, percentages, and metrics from the actual data
3. Identify concrete trends and patterns visible in the sample data
4. Provide actionable insights based on what the data actually shows
5. When suggesting visualizations, specify exact columns and chart types based on the data structure
6. If asked about data not present in the sample, clearly state the limitation
7. Focus on factual observations rather than assumptions
8. Use the business context to provide relevant interpretations

RESPONSE STRUCTURE:
- Lead with key data findings
- Support all claims with specific data points
- Provide context about data limitations (sample size, completeness)
- Suggest specific next steps based on the data

Remember: Your credibility depends on accuracy. Only make claims you can support with the provided data.`;

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
        max_tokens: 1000,
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

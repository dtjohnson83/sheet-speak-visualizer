
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
    businessMeaning?: string;
    unit?: string;
    isKPI?: boolean;
    statistics?: any;
    sampleSize?: number;
    totalSize?: number;
    priority?: 'high' | 'medium' | 'low';
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
  domainContext?: any;
  preComputedStats?: any;
  aggregations?: Record<string, any>;
  dataQuality?: {
    completeness: number;
    warnings: string[];
  };
  domainAnalysis?: {
    framework: string;
    keyMetricsFocus: string[];
    riskFactors: string[];
    opportunityIndicators: string[];
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
      maxTokens: 250,
      responseStructure: 'ANSWER_ONLY'
    };
  }
  
  // Strategic queries - recommendations, insights, business impact
  if (query.includes('recommend') || query.includes('strategy') || query.includes('should i') ||
      query.includes('business impact') || query.includes('opportunity') || query.includes('risk') ||
      query.includes('improve') || query.includes('optimize') || query.includes('next steps')) {
    return {
      type: 'strategic',
      maxTokens: 500,
      responseStructure: 'EXECUTIVE_SUMMARY'
    };
  }
  
  // Technical queries - methodology, calculations, technical details
  if (query.includes('how did you') || query.includes('methodology') || query.includes('calculate') ||
      query.includes('algorithm') || query.includes('technical') || query.includes('explain the process')) {
    return {
      type: 'technical',
      maxTokens: 350,
      responseStructure: 'TECHNICAL_DETAILED'
    };
  }
  
  // Complex queries - analysis, correlations, trends
  return {
    type: 'complex',
    maxTokens: 400,
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

// Enhanced data context processing with validation and domain awareness
function createOptimizedDataContext(dataContext: DataContext): string {
  let contextString = '';
  
  // Dataset overview with accuracy metadata
  contextString += `DATASET OVERVIEW:\n`;
  contextString += `Total rows: ${dataContext.totalRows.toLocaleString()}\n`;
  contextString += `Columns analyzed: ${dataContext.columns.length}\n`;
  if (dataContext.fileName) {
    contextString += `Source: ${dataContext.fileName}\n`;
  }
  
  // Add data quality assessment
  if (dataContext.dataQuality) {
    contextString += `Data completeness: ${Math.round(dataContext.dataQuality.completeness * 100)}%\n`;
    if (dataContext.dataQuality.warnings.length > 0) {
      contextString += `Quality notes: ${dataContext.dataQuality.warnings.slice(0, 2).join('; ')}\n`;
    }
  }
  contextString += '\n';

  // Pre-computed statistical summaries for fact-checking
  if (dataContext.preComputedStats) {
    contextString += `PRE-COMPUTED ANALYSIS:\n`;
    contextString += `Overall trend: ${dataContext.preComputedStats.overallTrend?.direction || 'stable'}\n`;
    contextString += `Confidence level: ${Math.round((dataContext.preComputedStats.confidenceLevel || 0) * 100)}%\n`;
    
    // Include critical business metrics
    if (dataContext.preComputedStats.businessHealth) {
      contextString += `Business health score: ${Math.round((dataContext.preComputedStats.businessHealth.score || 0) * 100)}%\n`;
      if (dataContext.preComputedStats.businessHealth.criticalIssues.length > 0) {
        contextString += `Critical issues: ${dataContext.preComputedStats.businessHealth.criticalIssues.slice(0, 2).join('; ')}\n`;
      }
    }
    contextString += '\n';
  }

  // Enhanced column analysis with business context
  contextString += `COLUMN ANALYSIS:\n`;
  dataContext.columns.forEach(col => {
    contextString += `${col.name} (${col.type})`;
    if (col.isKPI) contextString += ` [KEY METRIC]`;
    if (col.priority) contextString += ` [${col.priority.toUpperCase()} PRIORITY]`;
    contextString += `:\n`;
    
    if (col.businessMeaning) {
      contextString += `  Business meaning: ${col.businessMeaning}\n`;
    }
    
    // Include pre-computed statistics
    if (col.statistics) {
      if (col.type === 'numeric' && col.statistics.average !== undefined) {
        contextString += `  Average: ${col.statistics.average.toLocaleString()}\n`;
        contextString += `  Range: ${col.statistics.min.toLocaleString()} to ${col.statistics.max.toLocaleString()}\n`;
        contextString += `  Total: ${col.statistics.total.toLocaleString()}\n`;
      } else if (col.statistics.uniqueCount !== undefined) {
        contextString += `  Unique values: ${col.statistics.uniqueCount}\n`;
        if (col.statistics.mostCommon) {
          contextString += `  Most common: ${col.statistics.mostCommon}\n`;
        }
      }
    }
    
    // Sample values for context
    if (col.values && col.values.length > 0) {
      const sampleValues = col.values.slice(0, 3);
      contextString += `  Sample: ${sampleValues.join(', ')}\n`;
    }
    
    contextString += '\n';
  });

  // Regional aggregations if available
  if (dataContext.aggregations?.regional) {
    contextString += `REGIONAL ANALYSIS:\n`;
    const regionalData = dataContext.aggregations.regional.slice(0, 5);
    regionalData.forEach((region: any) => {
      contextString += `${region.region}: ${region.count} records, trend: ${region.trend}\n`;
    });
    contextString += '\n';
  }

  // Domain-specific analysis framework
  if (dataContext.domainAnalysis) {
    contextString += `DOMAIN-SPECIFIC ANALYSIS FRAMEWORK:\n`;
    contextString += dataContext.domainAnalysis.framework;
    contextString += `\nKey metrics focus: ${dataContext.domainAnalysis.keyMetricsFocus.join(', ')}\n`;
    contextString += `Risk factors to monitor: ${dataContext.domainAnalysis.riskFactors.join(', ')}\n`;
    contextString += `Opportunity indicators: ${dataContext.domainAnalysis.opportunityIndicators.join(', ')}\n`;
    contextString += '\n';
  }

  // Enhanced business context
  if (dataContext.enhancedContext) {
    contextString += `BUSINESS CONTEXT:\n`;
    contextString += `Domain: ${dataContext.enhancedContext.businessDomain}\n`;
    contextString += `Industry: ${dataContext.enhancedContext.industry}\n`;
    contextString += `Purpose: ${dataContext.enhancedContext.businessPurpose}\n`;
    
    if (dataContext.enhancedContext.objectives.length > 0) {
      contextString += `Business objectives: ${dataContext.enhancedContext.objectives.join(', ')}\n`;
    }
    
    if (dataContext.enhancedContext.keyMetrics.length > 0) {
      contextString += `KPIs to monitor: ${dataContext.enhancedContext.keyMetrics.join(', ')}\n`;
    }
    contextString += '\n';
  }

  // Sample data (reduced to avoid token bloat)
  if (dataContext.sampleData && dataContext.sampleData.length > 0) {
    contextString += `SAMPLE DATA (${Math.min(dataContext.sampleData.length, 3)} rows for context):\n`;
    const sampleRows = dataContext.sampleData.slice(0, 3);
    const keyColumns = dataContext.columns
      .filter(col => col.isKPI || col.priority === 'high')
      .slice(0, 5)
      .map(col => col.name);
    
    if (keyColumns.length === 0) {
      keyColumns.push(...dataContext.columns.slice(0, 5).map(col => col.name));
    }
    
    contextString += keyColumns.join(' | ') + '\n';
    sampleRows.forEach(row => {
      const rowValues = keyColumns.map(header => {
        const value = row[header];
        return value !== null && value !== undefined ? String(value) : 'null';
      });
      contextString += rowValues.join(' | ') + '\n';
    });
    contextString += '\n';
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

    // Build comprehensive system prompt with domain awareness
    const domainContext = optimizedContext.includes('DOMAIN-SPECIFIC') ? 
      'Use the provided domain-specific analysis framework and focus on industry-relevant insights.' : 
      'Provide general business analysis focused on actionable insights.';

    const systemPrompt = `You are an expert data analyst providing ${queryClass.responseStructure} analysis. ${domainContext}

${toneModifier}

DATA CONTEXT:
${optimizedContext}

CRITICAL ANALYSIS REQUIREMENTS:
- ALL numerical claims MUST be verifiable against the provided pre-computed statistics
- Use ONLY the data and statistics explicitly provided in the context above
- If regional data is provided, reference actual regions and their computed metrics
- Base all conclusions on the pre-computed analysis results shown above
- Never fabricate statistics or make claims not supported by the provided data

${responseStructures[queryClass.responseStructure]}

RESPONSE GUIDELINES:
- Lead with conclusions, not methodology
- Use business language appropriate for executives
- Reference specific data points from the pre-computed analysis
- Focus on business impact and actionable insights
- Maximum ${queryClass.maxTokens} tokens total
- When suggesting visualizations, specify exact chart types and column mappings

ACCURACY REQUIREMENT: Every numerical claim must be traceable to the provided pre-computed statistics. Do not extrapolate beyond the given data.`;

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

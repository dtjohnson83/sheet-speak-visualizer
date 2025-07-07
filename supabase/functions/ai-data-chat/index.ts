

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
  }>;
  sampleData: any[];
  totalRows: number;
}

interface RequestBody {
  messages: ChatMessage[];
  dataContext: DataContext;
  toneId?: string;
}

// Tone definitions - All emphasize brevity and structure
const TONE_MODIFIERS: Record<string, string> = {
  'direct-efficient': `
Tone: Direct & Efficient
- Be extremely concise - maximum 2 sentences per section
- Use bullet points and short phrases
- Skip all pleasantries and filler words
- Focus only on essential insights and actions`,
  
  'professional-formal': `
Tone: Professional & Formal (Concise)
- Use formal but brief language
- Avoid contractions but keep sentences short
- Structure with clear, minimal formatting
- Focus on precision over elaboration`,
  
  'conversational-friendly': `
Tone: Conversational & Friendly (Brief)
- Use warm but concise language
- Keep explanations simple and short
- Use contractions for brevity
- Be engaging without being verbose`,
  
  'consultative-expert': `
Tone: Consultative & Expert (Strategic)
- Provide strategic insights in 1-2 sentences
- Use business terminology efficiently
- Focus on key implications only
- Frame recommendations concisely`,
  
  'supportive-educational': `
Tone: Supportive & Educational (Clear)
- Explain key concepts briefly
- Use simple examples when needed
- Keep encouragement minimal
- Focus on learning essentials only`,
  
  'urgent-alert': `
Tone: Urgent & Alert-Focused (Immediate)
- Prioritize critical information first
- Use direct, action-oriented language
- Highlight key risks briefly
- Focus on immediate next steps only`,
  
  'analytical-neutral': `
Tone: Analytical & Neutral (Data-Focused)
- Present facts concisely
- Use precise, scientific language briefly
- Avoid opinions and interpretations
- Emphasize key statistics only`
};

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
      const sanitizedError = 'API key not configured. Please add XAI_API_KEY or OPENAI_API_KEY to your Supabase secrets.';
      console.error(sanitizedError);
      throw new Error(sanitizedError);
    }

    console.log(`Using ${provider} API with model ${model}`);
    console.log('API key found and configured successfully');

    // Create enhanced system prompt with data context
    const sampleSize = dataContext.sampleData.length;
    const samplePercentage = ((sampleSize / dataContext.totalRows) * 100).toFixed(2);
    
    let systemPrompt = `You are an expert data analyst assistant. Structure ALL responses using exactly these 5 sections with markdown headers:

## **Answer**
Direct response to the user's question (2-3 sentences max)

## **Context** 
Key data insights relevant to the question (2-3 bullet points)

## **Data Limitations**
Sample: ${sampleSize} rows (${samplePercentage}% of ${dataContext.totalRows} total) | Confidence: ${sampleSize < 100 ? 'LOW' : sampleSize < 1000 ? 'MEDIUM' : 'HIGH'}

## **Next Steps**
1-2 actionable recommendations

## **Suggested Visualization** (if applicable)
Chart type and configuration

Dataset Context:
- Columns: ${dataContext.columns.map(col => `${col.name} (${col.type})`).join(', ')}
- Sample: ${JSON.stringify(dataContext.sampleData.slice(0, 2))}`;

    // Add enhanced context if available
    if (dataContext.enhancedContext) {
      const ctx = dataContext.enhancedContext;
      systemPrompt += `

ENHANCED BUSINESS CONTEXT:
- Business Domain: ${ctx.businessDomain}
- Purpose: ${ctx.businessPurpose}
- Industry: ${ctx.industry}
- Time Period: ${ctx.timePeriod}
- Key Objectives: ${ctx.objectives.join(', ')}
- Primary Date Column: ${ctx.primaryDateColumn}
- Key Metrics/KPIs: ${ctx.keyMetrics.join(', ')}
- Business Rules: ${ctx.businessRules.join('; ')}
- Data Quality: ${ctx.dataQuality.completeness}% complete, ${ctx.dataQuality.consistency}% consistent

ANALYSIS GUIDELINES:
- Focus on objectives: ${ctx.objectives.join(', ')}
- Consider business domain patterns for ${ctx.businessDomain}
- Use ${ctx.primaryDateColumn} for time-series analysis
- Prioritize insights about: ${ctx.keyMetrics.join(', ')}
- Apply domain knowledge for ${ctx.industry} industry`;
    }

    // Add tone modifier to system prompt
    const toneModifier = TONE_MODIFIERS[toneId] || TONE_MODIFIERS['direct-efficient'];
    systemPrompt += `

${toneModifier}

Your capabilities:
1. Analyze data patterns and provide business-relevant insights
2. Suggest appropriate chart types for visualizations
3. Help with data filtering and grouping
4. Explain findings in business context
5. Validate insights against business rules

When suggesting visualizations, specify:
- Chart type (bar, line, pie, scatter, etc.)
- X-axis column (prefer ${dataContext.enhancedContext?.primaryDateColumn || 'date columns'} for time series)
- Y-axis column (prioritize KPIs: ${dataContext.enhancedContext?.keyMetrics.join(', ') || 'numeric columns'})
- Any grouping or filtering needed

Be conversational, business-focused, and provide actionable insights relevant to the business context.`;

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
        max_tokens: 750,
        temperature: 0.7,
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


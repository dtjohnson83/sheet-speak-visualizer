

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Try multiple possible environment variable names for the API key
const xaiApiKey = Deno.env.get('XAI_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dataContext }: { messages: ChatMessage[], dataContext: DataContext } = await req.json();

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
      console.error('No API key found. Checked: XAI_API_KEY, OPENAI_API_KEY');
      console.error('Available environment variables:', Object.keys(Deno.env.toObject()).filter(key => key.includes('API')));
      throw new Error('API key not configured. Please add XAI_API_KEY or OPENAI_API_KEY to your Supabase secrets.');
    }

    console.log(`Using ${provider} API with model ${model}`);
    console.log('API key found and configured successfully');

    // Create enhanced system prompt with data context
    const sampleSize = dataContext.sampleData.length;
    const samplePercentage = ((sampleSize / dataContext.totalRows) * 100).toFixed(2);
    
    let systemPrompt = `You are an expert data analyst assistant. You help users analyze their data and create visualizations.

IMPORTANT: Always start your responses by acknowledging the data sampling scope and limitations.

Current Dataset Context:
- Total rows: ${dataContext.totalRows}
- Sample analyzed: ${sampleSize} rows (${samplePercentage}% of dataset)
- Columns: ${dataContext.columns.map(col => {
      let desc = `${col.name} (${col.type})`;
      if (col.description) desc += ` - ${col.description}`;
      if (col.businessMeaning) desc += ` [${col.businessMeaning}]`;
      if (col.unit) desc += ` (${col.unit})`;
      return desc;
    }).join(', ')}
- Sample data: ${JSON.stringify(dataContext.sampleData.slice(0, 3))}

TRANSPARENCY REQUIREMENTS:
- Always mention that analysis is based on ${sampleSize} sample rows from ${dataContext.totalRows} total rows
- Include confidence level: ${sampleSize < 100 ? 'LOW' : sampleSize < 1000 ? 'MEDIUM' : 'HIGH'} confidence
- Acknowledge limitations when sample is small (< 1% of data)
- Suggest when user might need more comprehensive analysis`;

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

    systemPrompt += `

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
        max_tokens: 1024,
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
    console.error('Error in ai-data-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred processing your request',
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


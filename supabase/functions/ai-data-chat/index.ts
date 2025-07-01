
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Try multiple possible environment variable names for the API key
const groqApiKey = Deno.env.get('GROQ_API_KEY') || 
                   Deno.env.get('XAI_API_KEY') || 
                   Deno.env.get('OPENAI_API_KEY');

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

    if (!groqApiKey) {
      console.error('API key not found. Checked: GROQ_API_KEY, XAI_API_KEY, OPENAI_API_KEY');
      throw new Error('API key not configured. Please add GROQ_API_KEY to your Supabase secrets.');
    }

    console.log('Using API key starting with:', groqApiKey.substring(0, 10) + '...');

    // Create system prompt with data context
    const systemPrompt = `You are an expert data analyst assistant. You help users analyze their data and create visualizations.

Current Dataset Context:
- Total rows: ${dataContext.totalRows}
- Columns: ${dataContext.columns.map(col => `${col.name} (${col.type})`).join(', ')}
- Sample data: ${JSON.stringify(dataContext.sampleData.slice(0, 3))}

Your capabilities:
1. Analyze data patterns and provide insights
2. Suggest appropriate chart types for visualizations
3. Help with data filtering and grouping
4. Explain statistical concepts in simple terms

When suggesting visualizations, specify:
- Chart type (bar, line, pie, scatter, etc.)
- X-axis column
- Y-axis column (if applicable)
- Any grouping or filtering needed

Be conversational, helpful, and provide actionable insights about the data.`;

    console.log('Making request to Groq API...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1024,
        temperature: 0.7,
        stream: false
      }),
    });

    console.log('Groq API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error response:', error);
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('Groq API response received successfully');
    
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

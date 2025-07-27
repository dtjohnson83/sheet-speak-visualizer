import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversationHistory = [] } = await req.json();
    
    console.log('Platform chatbot request:', { 
      message, 
      contextKeys: context ? Object.keys(context) : [],
      historyLength: conversationHistory.length 
    });

    // Choose AI provider based on available API keys
    const xaiApiKey = Deno.env.get('XAI_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    let aiProvider = null;
    let apiKey = null;
    let apiUrl = null;
    
    if (xaiApiKey) {
      aiProvider = 'xAI';
      apiKey = xaiApiKey;
      apiUrl = 'https://api.x.ai/v1/chat/completions';
    } else if (openaiApiKey) {
      aiProvider = 'OpenAI';
      apiKey = openaiApiKey;
      apiUrl = 'https://api.openai.com/v1/chat/completions';
    }
    
    if (!aiProvider || !apiKey) {
      console.error('No AI API key found');
      return new Response(
        JSON.stringify({ 
          error: 'AI service unavailable. Please configure XAI_API_KEY or OPENAI_API_KEY in Supabase secrets.',
          response: 'I apologize, but I\'m currently unable to respond due to a configuration issue. Please contact support.'
        }),
        { 
          status: 200, // Return 200 so the UI can handle gracefully
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build context information
    let contextInfo = '';
    if (context) {
      const { route, component, userWorkflow, dataLoaded, chartType } = context;
      contextInfo = `
Current Context:
- Page: ${route || 'Unknown'}
- Component: ${component || 'Unknown'}
- User Workflow: ${userWorkflow || 'General navigation'}
- Data Status: ${dataLoaded ? 'Data is loaded' : 'No data loaded'}
- Chart Type: ${chartType || 'None'}
      `;
    }

    const systemPrompt = `You are a helpful platform assistant for a data analytics application. Your role is to help users navigate the platform, understand features, troubleshoot issues, and get the most out of their data analysis workflow.

Key capabilities you can help with:
- Uploading and connecting data sources (CSV, Excel, databases, APIs)
- Creating charts and visualizations
- Using AI features for data analysis and insights
- Setting up AI agents for automated data quality monitoring
- Dashboard creation and management
- Data export and sharing
- Platform navigation and features

Guidelines:
- Be concise but helpful
- Focus on actionable guidance
- If users ask about specific errors, help them troubleshoot
- Suggest relevant features based on their current context
- Be encouraging and supportive

${contextInfo}

Please provide helpful, context-aware assistance based on the user's current location and needs.`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 5 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-5);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    console.log(`Making request to ${aiProvider} API with ${messages.length} messages...`);
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiProvider === 'xAI' ? 'grok-beta' : 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`${aiProvider} API error:`, aiResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `${aiProvider} API error: ${aiResponse.status}`,
          response: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment.'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    console.log(`Successfully generated response using ${aiProvider}`);

    return new Response(
      JSON.stringify({ 
        response,
        provider: aiProvider,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in platform-chatbot function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        response: 'I apologize, but I encountered an error while processing your request. Please try again.',
        details: error.message 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

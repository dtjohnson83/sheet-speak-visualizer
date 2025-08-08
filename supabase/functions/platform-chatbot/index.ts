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
    
    // Get authorization header to check admin status
    const authHeader = req.headers.get('authorization');
    let isAdmin = false;
    
    if (authHeader) {
      try {
        // Create Supabase client to verify user role
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Verify JWT and get user
        const jwt = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(jwt);
        
        if (user) {
          // Check if user has admin role
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
          
          isAdmin = !!userRole;
        }
      } catch (error) {
        console.log('Could not verify admin status:', error.message);
      }
    }
    
    console.log('Platform chatbot request:', { 
      message, 
      contextKeys: context ? Object.keys(context) : [],
      historyLength: conversationHistory.length 
    });

    // Choose AI provider based on available API keys (prefer xAI for consistency)
    const xaiApiKey = Deno.env.get('XAI_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    let aiProvider = null;
    let apiKey = null;
    let apiUrl = null;
    let model = null;
    
    // Prefer xAI for consistency with other platform features
    if (xaiApiKey) {
      aiProvider = 'xAI';
      apiKey = xaiApiKey;
      apiUrl = 'https://api.x.ai/v1/chat/completions';
      model = 'grok-3';
    } else if (openaiApiKey) {
      aiProvider = 'OpenAI';
      apiKey = openaiApiKey;
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      model = 'gpt-4o-mini';
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
    let suggestions = '';
    let codebaseContext = '';
    
    if (context) {
      const { route, component, userWorkflow, dataLoaded, chartType, chatMode } = context;
      contextInfo = `Current Context: ${route || 'Unknown'} page, ${dataLoaded ? 'data loaded' : 'no data'}, ${chartType || 'no chart'}`;

      // Handle codebase chat mode for admin users
      if (chatMode === 'codebase' && isAdmin) {
        codebaseContext = `
CODEBASE KNOWLEDGE (Admin Access):

ARCHITECTURE:
- React + TypeScript frontend with Tailwind CSS
- Supabase backend (Auth, Database, Edge Functions)
- Component structure: src/components/ organized by feature
- State: React Context + local useState
- Routing: React Router v6 with protected routes
- Security: RLS policies, user roles, secure edge functions

KEY DIRECTORIES:
- src/components/: UI components by feature (charts, dashboard, data, etc.)
- src/hooks/: Custom React hooks for data management
- src/lib/: Utilities (chart processing, ML, security, OAuth)
- supabase/functions/: Edge functions for server logic
- src/types/: TypeScript definitions

API ENDPOINTS:
- ai-data-chat: Natural language data queries
- platform-chatbot: Platform assistance (current function)
- ai-summary-report: AI-generated reports
- business-rule-processor: Automated business rules

DATABASE TABLES:
- user_roles: Role management (admin/user)
- saved_datasets: User data with metadata
- ai_agents: AI agent configurations
- dashboard_tiles: Dashboard layouts
- analysis_sessions: Session tracking

SECURITY FEATURES:
- Row Level Security (RLS) for data isolation
- Role-based access control
- Edge function API key security
- OAuth integration
- Audit logging`;
      } else {
        // Regular contextual suggestions for general mode
        if (route === '/app' && !dataLoaded) {
          suggestions = 'Next: Upload CSV/Excel/JSON file (max 10MB). Demo datasets available.';
        } else if (route === '/app' && dataLoaded) {
          suggestions = 'Next: Create charts or use AI chat to explore data.';
        } else if (route.includes('charts') && chartType) {
          suggestions = 'Next: Customize colors/formatting, save to dashboard.';
        } else if (route.includes('dashboard')) {
          suggestions = 'Next: Add more charts, configure global filters.';
        }
      }
    }

    let systemPrompt = '';
    
    if (context?.chatMode === 'codebase' && isAdmin) {
      systemPrompt = `You are a codebase assistant for a data analytics platform. You have full access to technical details.

${codebaseContext}

As an admin, you can discuss:
- Component architecture and relationships
- File organization and code structure  
- API endpoints and data flow
- Database schema and RLS policies
- Security implementations
- Performance considerations
- Implementation details and best practices

Be technical and detailed. Reference specific files, functions, and architectural patterns.`;
    } else {
      systemPrompt = `You are a platform assistant for a data analytics application.

CAPABILITIES:
- Charts: Bar, line, pie, scatter, heatmap, histogram, treemap
- Data: Upload CSV/Excel/JSON, connect databases/APIs, preview/validate
- AI: Natural language data chat, auto-chart generation, quality monitoring agents
- Dashboard: Drag-drop builder, global filters, real-time updates, export/sharing
- Learning Dashboard: Feedback analytics and job scheduler to improve AI over time
- Auto-Scheduled Agents: Background tasks for monitoring and recurring insights
- Alert Notifications: Email and webhook alerts for anomalies and key events
- Session Monitoring: Track usage and guide users through onboarding

COMMON ISSUES:
- Empty charts: Check column selection, data types, filter empty rows
- Upload fails: Use .xlsx for Excel, check 10MB limit, no password protection
- Slow performance: Use data sampling for large files, apply filters

${contextInfo}
${suggestions}

Be concise and actionable. Focus on their current context and next steps.`;
    }

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
        model,
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

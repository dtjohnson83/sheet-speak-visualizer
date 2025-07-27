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

    // Build comprehensive platform knowledge and context
    let contextInfo = '';
    let contextualSuggestions = '';
    
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

      // Generate contextual suggestions based on current state
      if (route === '/app' && !dataLoaded) {
        contextualSuggestions = `
CONTEXTUAL SUGGESTIONS FOR CURRENT STATE:
- Next Steps: Upload your data file to get started
- Available Options: File upload supports CSV, Excel (.xlsx), and JSON formats
- Helpful Tips: Demo datasets are available if you want to explore first
- File Requirements: Maximum 10MB file size, ensure Excel files are saved as .xlsx
        `;
      } else if (route === '/app' && dataLoaded) {
        contextualSuggestions = `
CONTEXTUAL SUGGESTIONS FOR CURRENT STATE:
- Next Steps: Create your first visualization or use AI chat to explore data
- Available Options: Bar charts, line charts, pie charts, scatter plots, heatmaps
- Helpful Tips: Start with simple bar or line charts, AI can suggest appropriate chart types
- Advanced Features: Multiple series support, data filtering, custom color themes
        `;
      } else if (route.includes('charts') && chartType) {
        contextualSuggestions = `
CONTEXTUAL SUGGESTIONS FOR CURRENT STATE:
- Next Steps: Customize colors and formatting, save chart to dashboard
- Available Options: Multiple series, data labels, axis formatting, color themes
- Helpful Tips: Data labels make charts more readable, use consistent color palettes
- Export Options: Save as PNG, PDF, or add to dashboard for sharing
        `;
      } else if (route.includes('dashboard')) {
        contextualSuggestions = `
CONTEXTUAL SUGGESTIONS FOR CURRENT STATE:
- Next Steps: Add more charts, configure global filters
- Available Options: Drag and resize tiles, global filters affect all charts
- Helpful Tips: Arrange tiles logically, use filters for interactive exploration
- Advanced Features: Export entire dashboard, share with team members
        `;
      }
    }

    const systemPrompt = `You are an expert platform assistant for a comprehensive data analytics platform. You have deep knowledge of all platform features, workflows, and troubleshooting solutions.

PLATFORM CAPABILITIES:

📊 CHART TYPES & VISUALIZATION:
- Bar Charts: Compare categories and values, support stacking and multiple series
- Line Charts: Show trends over time, multiple series support, data labels
- Pie Charts: Display proportions and percentages with custom colors
- Scatter Plots: Reveal correlations between variables, size and color mapping
- Heatmaps: Visualize data density and patterns with custom color scales
- Histograms: Show data distribution and frequency analysis
- Treemaps: Hierarchical data visualization for nested categories

📁 DATA SOURCES & MANAGEMENT:
- File Upload: CSV, Excel (.xlsx), JSON files up to 10MB
- Database Connections: PostgreSQL, MySQL with secure authentication
- API Integrations: REST APIs, Google Sheets, real-time data feeds
- Data Preview: Column type detection, data validation, sampling
- Worksheet Selection: Choose specific sheets from Excel workbooks
- Data Export: Multiple formats with column selection and filtering

🤖 AI-POWERED FEATURES:
- AI Data Chat: Natural language queries to explore and analyze data
- AI Chart Generation: Automatic chart suggestions based on data characteristics
- AI Agents: Automated data quality monitoring, anomaly detection
- Business Rules: Custom validation and quality checks
- Predictive Analytics: Forecasting and trend analysis
- Smart Insights: Automated pattern discovery and recommendations

📋 DASHBOARD & COLLABORATION:
- Drag-and-Drop Builder: Resizable tiles, custom layouts
- Global Filters: Interactive filtering across multiple charts
- Real-time Updates: Live data connections and automatic refresh
- Export Options: PDF reports, PNG images, data exports
- Sharing: Team collaboration and dashboard distribution

COMMON WORKFLOWS:

1. DATA ANALYSIS WORKFLOW:
   Upload Data → Preview & Validate → Create Visualizations → Customize Charts → Save to Dashboard

2. DASHBOARD CREATION:
   Prepare Data → Create Multiple Charts → Arrange in Dashboard → Add Global Filters → Share/Export

3. AI ASSISTANCE:
   Upload Data → Use AI Chat for Exploration → Generate AI-Suggested Charts → Set Up Monitoring Agents

TROUBLESHOOTING GUIDE:

🔧 Chart Issues:
- Empty Charts: Check column selection, verify numeric data types, filter empty rows
- Formatting Problems: Verify data types, try different chart types, check color themes
- Performance: Use data sampling for large datasets (>50k rows), apply filters

🔧 Upload Issues:
- File Errors: Ensure .xlsx format for Excel, check 10MB limit, verify file integrity
- Slow Loading: Large files take time, consider data sampling or file splitting
- Format Support: CSV, Excel (.xlsx), JSON only - no password-protected files

🔧 Performance Issues:
- Slow Response: Close other tabs, use data filtering, consider smaller datasets
- Memory Problems: Apply data sampling, reduce active charts, clear browser cache

FEATURE EXPLANATIONS:
- Multiple Series: Add different metrics to the same chart for comparison
- Data Labels: Show exact values on chart points for precision
- Stacking: Combine bars/areas to show cumulative totals
- Axis Formatting: Custom number formats, scales, and labels
- Color Themes: Consistent palettes across visualizations
- Real-time Data: Automatic updates from live sources
- Responsive Design: Charts adapt to different screen sizes

${contextInfo}
${contextualSuggestions}

RESPONSE GUIDELINES:
- Provide specific, actionable guidance based on the user's current context
- Reference exact feature names and locations when giving instructions
- Suggest relevant next steps and alternative approaches
- Include troubleshooting steps for common issues
- Be encouraging and highlight platform capabilities
- Use the contextual information to provide targeted assistance

Respond with helpful, context-aware assistance that leverages the platform's full capabilities.`;

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

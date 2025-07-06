import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const xaiApiKey = Deno.env.get('XAI_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  context?: {
    route: string;
    component?: string;
    userState?: any;
  };
}

interface PlatformContext {
  route: string;
  component?: string;
  userWorkflow?: string;
  dataLoaded: boolean;
  chartType?: string;
}

interface RequestBody {
  message: string;
  context: PlatformContext;
  conversationHistory: ChatMessage[];
}

// Platform knowledge base
const PLATFORM_KNOWLEDGE = {
  routes: {
    '/': 'Landing page with feature overview and getting started guide',
    '/app': 'Main application dashboard with data upload and visualization tools',
    '/guides': 'Comprehensive documentation and tutorials hub',
    '/about': 'Information about the platform and contact details'
  },
  
  workflows: {
    'data-upload': {
      name: 'Data Upload Process',
      steps: [
        'Click "Upload File" or drag & drop data files',
        'Select worksheet if Excel/CSV has multiple sheets', 
        'Review data preview and column types',
        'Confirm data import to proceed to visualization'
      ],
      supportedFormats: ['CSV', 'Excel (.xlsx)', 'JSON', 'Google Sheets via API']
    },
    
    'visualization': {
      name: 'Creating Visualizations',
      steps: [
        'Select chart type (bar, line, pie, scatter, etc.)',
        'Choose X and Y axis columns from your data',
        'Configure additional series if needed',
        'Customize colors, labels, and formatting',
        'Save to dashboard or export'
      ],
      chartTypes: [
        'Bar Chart - Compare categories',
        'Line Chart - Show trends over time', 
        'Pie Chart - Show proportions',
        'Scatter Plot - Show correlations',
        'Heatmap - Show data density',
        'Histogram - Show data distribution',
        'Area Chart - Show cumulative data',
        'Treemap - Show hierarchical data'
      ]
    },
    
    'dashboard': {
      name: 'Dashboard Management',
      steps: [
        'Create visualizations from your data',
        'Click "Save to Dashboard" on any chart',
        'Arrange tiles by dragging and resizing',
        'Add filters to control multiple charts',
        'Save dashboard with a descriptive name'
      ],
      features: ['Drag & drop arrangement', 'Responsive tiles', 'Global filters', 'Export options']
    },
    
    'ai-features': {
      name: 'AI-Powered Features',
      capabilities: [
        'AI Data Chat - Ask questions about your data in natural language',
        'AI Chart Generation - Describe the chart you want and let AI create it',
        'AI Agents - Automated data quality monitoring and insights',
        'Smart Data Context - AI understands your business domain',
        'Predictive Analytics - Forecast trends and patterns'
      ]
    }
  },

  troubleshooting: {
    'upload-issues': {
      problem: 'Data upload not working',
      solutions: [
        'Check file format is supported (CSV, Excel, JSON)',
        'Ensure file size is under 10MB',
        'Verify file is not password protected',
        'Try refreshing the page and uploading again'
      ]
    },
    
    'chart-not-showing': {
      problem: 'Chart not displaying correctly',
      solutions: [
        'Ensure X and Y columns are selected',
        'Check that data columns contain appropriate data types',
        'Verify data has values (not all empty/null)',
        'Try switching to a different chart type'
      ]
    },
    
    'performance-slow': {
      problem: 'Application running slowly',
      solutions: [
        'Large datasets may take time to process',
        'Try using data filters to reduce displayed data',
        'Close unused browser tabs',
        'Consider using data sampling for very large files'
      ]
    }
  },

  features: {
    'data-sources': {
      name: 'Data Source Connections',
      options: ['File Upload', 'Google Sheets API', 'REST API', 'PostgreSQL', 'Demo Datasets'],
      authentication: 'OAuth for Google Sheets, API keys for other services'
    },
    
    'chart-customization': {
      name: 'Chart Customization',
      options: ['Colors and themes', 'Data labels', 'Axis formatting', 'Multiple series', 'Sorting and filtering']
    },
    
    'export-options': {
      name: 'Export and Sharing',
      formats: ['PNG image', 'PDF report', 'CSV data', 'Dashboard link'],
      features: ['Scheduled reports', 'Email delivery', 'Custom branding']
    }
  }
};

// Security filtering to prevent exposure of internal details
const filterResponse = (response: string): string => {
  // Remove any potential code snippets or technical implementation details
  const codePattern = /```[\s\S]*?```/g;
  const filtered = response.replace(codePattern, '[Code example removed for security]');
  
  // Filter out sensitive technical terms
  const sensitiveTerms = [
    'database schema', 'API keys', 'authentication tokens', 
    'internal functions', 'source code', 'implementation details',
    'supabase', 'edge functions', 'RLS policies'
  ];
  
  let result = filtered;
  sensitiveTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    result = result.replace(regex, '[Technical detail]');
  });
  
  return result;
};

// Generate contextual system prompt
const generateSystemPrompt = (context: PlatformContext): string => {
  const currentWorkflow = context.userWorkflow || 'general';
  const routeInfo = PLATFORM_KNOWLEDGE.routes[context.route as keyof typeof PLATFORM_KNOWLEDGE.routes] || 'Unknown page';
  
  return `You are a helpful platform assistant for a data visualization and analytics platform. 

CURRENT CONTEXT:
- User is on: ${context.route} (${routeInfo})
- Current workflow: ${currentWorkflow}
- Data loaded: ${context.dataLoaded ? 'Yes' : 'No'}
- Active chart type: ${context.chartType || 'None'}

PLATFORM KNOWLEDGE:
${JSON.stringify(PLATFORM_KNOWLEDGE, null, 2)}

RESPONSE FORMAT REQUIREMENTS:
• Use bullet points for lists, features, and options
• Use numbered lists ONLY for sequential steps
• Keep sentences short and action-oriented
• Lead with the most important information first
• Avoid redundant explanations
• Focus on immediate next steps

GUIDELINES:
• Provide helpful, accurate information about platform features
• Give step-by-step instructions when explaining workflows
• Suggest relevant features based on user's current context
• Be concise and scannable - prioritize brevity over thoroughness
• If user seems stuck, offer specific next steps
• Never expose technical implementation details
• Focus on actionable guidance for their current workflow
• Only mention related features if directly relevant to their question

SECURITY:
• Never discuss internal technical architecture
• Keep responses focused on user-facing features only

Be direct, helpful, and concise. Prioritize actionable information over explanatory text.`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversationHistory = [] }: RequestBody = await req.json();

    // Determine which API to use
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
      throw new Error('No API key configured. Please add XAI_API_KEY or OPENAI_API_KEY to your Supabase secrets.');
    }

    console.log(`Platform chatbot using ${provider} API with model ${model}`);

    const systemPrompt = generateSystemPrompt(context);
    
    // Build conversation messages
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.slice(-4), // Last 4 messages for context
      { role: 'user' as const, content: message }
    ];

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 450,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`${provider} API error:`, error);
      throw new Error(`${provider} API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Apply security filtering
    const filteredResponse = filterResponse(aiResponse);

    return new Response(JSON.stringify({ response: filteredResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in platform-chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: 'I apologize, but I encountered an error. Please try rephrasing your question or contact support if the issue persists.',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
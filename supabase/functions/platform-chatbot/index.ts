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
      name: 'Enhanced Data Upload Process',
      steps: [
        'Click "Upload File" or drag & drop data files',
        'Select worksheet if Excel/CSV has multiple sheets', 
        'Review data preview and enhanced column detection',
        'View automatic quality assessment results',
        'Confirm data import with enhanced modeling enabled'
      ],
      supportedFormats: ['CSV', 'Excel (.xlsx)', 'JSON', 'Google Sheets via API'],
      enhancedFeatures: [
        'Automatic semantic type detection',
        'Real-time data quality scoring', 
        'Storage optimization recommendations',
        'Schema versioning and tracking'
      ]
    },
    
    'enhanced-data-modeling': {
      name: 'Enhanced Data Modeling',
      steps: [
        'Upload your dataset to trigger automatic enhancement',
        'Review quality profile scores (completeness, validity, consistency, accuracy)',
        'Examine discovered semantic types and column metadata',
        'Use relationship discovery to find connections between datasets',
        'Optimize storage settings based on access patterns'
      ],
      qualityDimensions: [
        'Completeness - Missing values assessment',
        'Validity - Format and type consistency',
        'Consistency - Internal logical validation',
        'Accuracy - Outlier and anomaly detection'
      ],
      semanticTypes: ['identifier', 'measure', 'dimension', 'temporal', 'geospatial'],
      storageTypes: ['jsonb', 'columnar', 'hybrid'],
      accessPatterns: ['hot', 'warm', 'cold']
    },
    
    'relationship-discovery': {
      name: 'Dataset Relationship Discovery',
      steps: [
        'Load multiple datasets into the platform',
        'Navigate to the Enhanced Data Model dashboard',
        'Click "Discover Relationships" to start analysis',
        'Review suggested relationships with confidence scores',
        'Validate and confirm meaningful relationships'
      ],
      discoveryMethods: [
        'Name similarity analysis - Matches similar column names',
        'Value overlap detection - Finds shared values between columns',
        'Pattern matching - Identifies foreign key patterns',
        'Referential integrity checks - Validates data consistency'
      ],
      relationshipTypes: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many']
    },
    
    'visualization': {
      name: 'Creating Visualizations',
      steps: [
        'Select chart type (bar, line, pie, scatter, etc.)',
        'Choose X and Y axis columns from your enhanced data',
        'Leverage semantic types for smarter chart suggestions',
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
      ],
      enhancedFeatures: [
        'Smart chart type recommendations based on semantic types',
        'Quality-aware data filtering',
        'Cross-dataset visualization using discovered relationships'
      ]
    },
    
    'dashboard': {
      name: 'Dashboard Management',
      steps: [
        'Create visualizations from your enhanced data',
        'Click "Save to Dashboard" on any chart',
        'Arrange tiles by dragging and resizing',
        'Add filters to control multiple charts',
        'Save dashboard with a descriptive name'
      ],
      features: ['Drag & drop arrangement', 'Responsive tiles', 'Global filters', 'Export options'],
      enhancedFeatures: [
        'Cross-dataset dashboard tiles using relationships',
        'Quality monitoring dashboard widgets',
        'Performance-optimized dashboard loading'
      ]
    },
    
    'ai-features': {
      name: 'AI-Powered Features',
      capabilities: [
        'AI Data Chat - Ask questions about your data in natural language',
        'AI Chart Generation - Describe the chart you want and let AI create it',
        'AI Agents - Automated data quality monitoring and insights',
        'Smart Data Context - AI understands your business domain and data quality',
        'Predictive Analytics - Forecast trends and patterns',
        'Enhanced AI Context - AI leverages semantic types and relationships'
      ],
      enhancedCapabilities: [
        'Quality-aware AI responses that consider data reliability',
        'Relationship-informed insights across connected datasets',
        'Semantic type understanding for more accurate responses',
        'Automated data quality recommendations and alerts'
      ]
    },
    
    'data-quality': {
      name: 'Data Quality Management',
      steps: [
        'Upload or load data to trigger automatic quality assessment',
        'Review overall quality score and individual dimension scores',
        'Examine quality issues list with severity levels',
        'Follow AI-generated recommendations for improvements',
        'Monitor quality trends over time'
      ],
      troubleshooting: [
        'Low completeness - Address missing values through imputation or source validation',
        'Poor validity - Standardize formats and fix parsing issues',
        'Consistency issues - Implement data validation rules',
        'Accuracy problems - Review and handle outliers appropriately'
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
        'Try refreshing the page and uploading again',
        'If enhanced modeling is slow, try smaller datasets first'
      ]
    },
    
    'chart-not-showing': {
      problem: 'Chart not displaying correctly',
      solutions: [
        'Ensure X and Y columns are selected',
        'Check that data columns contain appropriate data types',
        'Verify data has values (not all empty/null)',
        'Try switching to a different chart type',
        'Check if data quality issues affect the visualization'
      ]
    },
    
    'performance-slow': {
      problem: 'Application running slowly',
      solutions: [
        'Large datasets may take time to process with enhanced modeling',
        'Try using data filters to reduce displayed data',
        'Close unused browser tabs',
        'Consider using data sampling for very large files',
        'Check storage optimization settings for better performance'
      ]
    },
    
    'low-quality-scores': {
      problem: 'Data quality scores are low',
      solutions: [
        'Review quality issues list for specific problems',
        'Address missing values through data cleaning or imputation',
        'Standardize formats for categorical and date columns',
        'Remove or investigate outliers that may indicate errors',
        'Implement data validation rules at the source'
      ]
    },
    
    'missing-relationships': {
      problem: 'Relationship discovery not finding connections',
      solutions: [
        'Ensure column names are meaningful and consistent',
        'Check that related columns contain overlapping values',
        'Try manual relationship creation if automatic discovery fails',
        'Verify data types are compatible between related columns',
        'Consider data standardization to improve matching'
      ]
    },
    
    'schema-conflicts': {
      problem: 'Schema version conflicts or issues',
      solutions: [
        'Check the schema version history for recent changes',
        'Verify that all datasets use compatible schema versions',
        'Review column type changes that might affect relationships',
        'Use schema rollback if needed to resolve conflicts',
        'Coordinate schema changes across related datasets'
      ]
    },
    
    'storage-optimization': {
      problem: 'Poor performance with large datasets',
      solutions: [
        'Review storage type recommendations (JSONB vs Columnar)',
        'Adjust access pattern settings based on usage (Hot/Warm/Cold)',
        'Enable column indexing for frequently queried fields',
        'Consider data compression for cold storage scenarios',
        'Use hybrid storage for mixed workload patterns'
      ]
    }
  },

  features: {
    'data-sources': {
      name: 'Data Source Connections',
      options: ['File Upload', 'Google Sheets API', 'REST API', 'PostgreSQL', 'Demo Datasets'],
      authentication: 'OAuth for Google Sheets, API keys for other services',
      enhancedFeatures: [
        'Automatic quality assessment on data import',
        'Smart storage format selection based on data characteristics',
        'Schema versioning and change tracking',
        'Cross-source relationship discovery'
      ]
    },
    
    'enhanced-data-modeling': {
      name: 'Enhanced Data Modeling Features',
      capabilities: [
        'Automatic semantic type detection (identifier, measure, dimension, temporal, geospatial)',
        'Real-time data quality scoring across 4 dimensions',
        'Intelligent relationship discovery between datasets',
        'Storage optimization with multiple formats (JSONB, Columnar, Hybrid)',
        'Schema versioning and evolution tracking',
        'Access pattern optimization (Hot, Warm, Cold)'
      ],
      qualityAssessment: [
        'Completeness analysis for missing values',
        'Validity checking for format consistency',
        'Consistency validation for logical relationships',
        'Accuracy assessment with outlier detection'
      ]
    },
    
    'chart-customization': {
      name: 'Chart Customization',
      options: ['Colors and themes', 'Data labels', 'Axis formatting', 'Multiple series', 'Sorting and filtering'],
      enhancedOptions: [
        'Smart chart recommendations based on semantic types',
        'Quality-aware data filtering and warnings',
        'Cross-dataset visualizations using discovered relationships',
        'Performance-optimized rendering for large datasets'
      ]
    },
    
    'export-options': {
      name: 'Export and Sharing',
      formats: ['PNG image', 'PDF report', 'CSV data', 'Dashboard link'],
      features: ['Scheduled reports', 'Email delivery', 'Custom branding'],
      enhancedFeatures: [
        'Quality profile reports with detailed assessments',
        'Relationship documentation exports',
        'Schema evolution reports',
        'Performance optimization summaries'
      ]
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
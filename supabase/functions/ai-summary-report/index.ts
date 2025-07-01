import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Try multiple possible environment variable names for the API key
const xaiApiKey = Deno.env.get('XAI_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataContext {
  columns: Array<{
    name: string;
    type: string;
    values: any[];
  }>;
  sampleData: any[];
  totalRows: number;
  fileName?: string;
}

interface ReportRequest {
  dataContext: DataContext;
  persona?: string;
}

const personaPrompts = {
  executive: `You are a C-level executive assistant providing strategic insights. Focus on:
- High-level business implications and trends
- Key performance indicators and metrics
- Strategic recommendations for decision-making
- Executive summary style with actionable insights
- Risk assessment and opportunities`,

  marketing: `You are a marketing analyst providing campaign and customer insights. Focus on:
- Customer segmentation and behavior patterns
- Marketing performance metrics and conversion rates
- Audience analysis and targeting opportunities
- Campaign effectiveness and optimization suggestions
- Growth and engagement metrics`,

  finance: `You are a financial analyst providing fiscal insights. Focus on:
- Revenue trends and financial performance
- Cost analysis and budget implications
- Profitability metrics and financial ratios
- Risk assessment from a financial perspective
- Investment and resource allocation recommendations`,

  operations: `You are an operations analyst providing efficiency insights. Focus on:
- Process efficiency and operational metrics
- Resource utilization and capacity analysis
- Quality metrics and performance indicators
- Bottlenecks and optimization opportunities
- Workflow and process improvement suggestions`,

  data_scientist: `You are a senior data scientist providing technical insights. Focus on:
- Statistical analysis and data quality assessment
- Correlation patterns and anomaly detection
- Predictive modeling opportunities
- Data preprocessing and cleaning recommendations
- Advanced analytics and machine learning potential`,

  general: `You are a business intelligence analyst providing comprehensive insights. Focus on:
- Overall data patterns and trends
- Key findings and notable observations
- Data quality and completeness assessment
- Visualization recommendations
- General business insights and recommendations`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dataContext, persona = 'general' }: ReportRequest = await req.json();

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
      throw new Error('API key not configured. Please add XAI_API_KEY or OPENAI_API_KEY to your Supabase secrets.');
    }

    console.log(`Using ${provider} API with model ${model} for report generation`);

    // Calculate basic statistics
    const totalRows = dataContext.totalRows;
    const totalColumns = dataContext.columns.length;
    
    // Analyze column types
    const columnTypes = dataContext.columns.reduce((acc, col) => {
      acc[col.type] = (acc[col.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate data completeness
    const dataCompleteness = dataContext.columns.map(col => {
      const nullCount = col.values.filter(val => val === null || val === undefined || val === '').length;
      const completeness = ((col.values.length - nullCount) / col.values.length) * 100;
      return { column: col.name, completeness: Math.round(completeness) };
    });

    // Get persona-specific prompt
    const personaPrompt = personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.general;

    // Create comprehensive system prompt
    const systemPrompt = `${personaPrompt}

You are analyzing a dataset with the following characteristics:
- Dataset: ${dataContext.fileName || 'Uploaded Data'}
- Total rows: ${totalRows.toLocaleString()}
- Total columns: ${totalColumns}
- Column types: ${Object.entries(columnTypes).map(([type, count]) => `${count} ${type}`).join(', ')}
- Sample data: ${JSON.stringify(dataContext.sampleData.slice(0, 2))}

Data Completeness Summary:
${dataCompleteness.map(dc => `- ${dc.column}: ${dc.completeness}% complete`).join('\n')}

Please provide a comprehensive analysis report with the following structure:

## Executive Summary
Brief overview of the dataset and key insights (2-3 sentences)

## Key Findings
- 3-5 most important insights from the data
- Notable patterns, trends, or anomalies
- Data quality observations

## Detailed Analysis
- Column-by-column insights where relevant
- Relationships between different data points
- Statistical observations

## Recommended Visualizations
- Suggest 3-4 specific chart types that would best represent this data
- Include which columns to use for each visualization
- Explain why each visualization would be valuable

## Data Quality Assessment
- Overall data completeness and quality
- Potential data issues or cleaning needs
- Reliability assessment

## Next Steps & Recommendations
- Actionable insights based on the analysis
- Suggested follow-up questions or investigations
- Potential business applications

Keep the report concise but comprehensive, using bullet points and clear sections. Focus on actionable insights rather than technical jargon.`;

    const userPrompt = `Please analyze this dataset and provide a comprehensive report based on the data characteristics provided above.`;

    console.log(`Making request to ${provider} API for report generation...`);

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2048,
        temperature: 0.3,
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
    
    const reportContent = data.choices[0].message.content;

    // Return structured response
    return new Response(JSON.stringify({ 
      report: reportContent,
      metadata: {
        totalRows,
        totalColumns,
        columnTypes,
        dataCompleteness,
        persona,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-summary-report function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred generating the report',
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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
    description?: string;
    businessMeaning?: string;
    unit?: string;
    isKPI?: boolean;
    expectedRange?: string;
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
}

interface ReportRequest {
  dataContext: DataContext;
  persona?: string;
  systemPrompt?: string;
  datasetProfile?: any;
  healthMetrics?: any;
}

const personaPrompts = {
  executive: `You are providing strategic insights for executives. Focus on:
- KEY BUSINESS IMPACT: What does this data mean for business performance?
- CRITICAL TRENDS: Identify 3-4 most important patterns affecting the bottom line
- STRATEGIC ACTIONS: Specific recommendations for leadership decisions
- RISK ASSESSMENT: What threats or opportunities are evident?

Keep response under 300 words. Lead with impact, not data description.`,

  marketing: `You are analyzing marketing performance data. Focus on:
- CUSTOMER INSIGHTS: What do the patterns reveal about customer behavior?
- CAMPAIGN EFFECTIVENESS: Which strategies are working/failing?
- OPTIMIZATION OPPORTUNITIES: Specific actions to improve performance
- AUDIENCE TARGETING: How to better reach and convert customers

Provide actionable recommendations, not just data summaries.`,

  finance: `You are providing financial analysis. Focus on:
- FINANCIAL HEALTH: What do the numbers say about fiscal performance?
- COST OPTIMIZATION: Where can efficiency be improved?
- REVENUE INSIGHTS: Patterns in income, profitability, and growth
- RISK FACTORS: Financial threats or opportunities

Quantify impact where possible and provide specific recommendations.`,

  operations: `You are analyzing operational performance. Focus on:
- EFFICIENCY METRICS: How well are processes performing?
- BOTTLENECKS: Where are the main constraints and delays?
- QUALITY INDICATORS: What's the state of output quality?
- IMPROVEMENT OPPORTUNITIES: Specific actions to enhance operations

Focus on actionable insights for process improvement.`,

  analyst: `You are providing technical data analysis. Focus on:
- STATISTICAL PATTERNS: Key correlations, distributions, and trends
- DATA QUALITY: Completeness, consistency, and reliability issues
- ANALYTICAL INSIGHTS: What advanced analysis reveals about the data
- PREDICTIVE INDICATORS: Patterns that suggest future outcomes

Provide technical depth while remaining accessible.`,

  general: `You are providing comprehensive business intelligence. Focus on:
- KEY INSIGHTS: Most important findings from the data
- PERFORMANCE INDICATORS: How key metrics are performing
- ACTIONABLE RECOMMENDATIONS: Specific next steps
- CRITICAL ISSUES: Problems that need immediate attention

Balance depth with accessibility for diverse stakeholders.`
};

const createAnalyticalContext = (dataContext: DataContext) => {
  const columns = dataContext.columns || [];
  const sampleData = dataContext.sampleData || [];
  const totalRows = dataContext.totalRows || 0;

  // Create concise column summaries
  const columnSummaries = columns.map(col => {
    const values = col.values || [];
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const completeness = values.length > 0 ? (nonNullValues.length / values.length) * 100 : 0;
    
    let summary = `${col.name} (${col.type})`;
    if (col.businessMeaning) summary += ` - ${col.businessMeaning}`;
    if (completeness < 100) summary += ` [${completeness.toFixed(0)}% complete]`;
    
    // Add value insights for key columns
    if (col.type === 'numeric' && nonNullValues.length > 0) {
      const nums = nonNullValues.map(v => Number(v)).filter(v => !isNaN(v));
      if (nums.length > 0) {
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        summary += ` [avg: ${avg.toFixed(1)}, range: ${min}-${max}]`;
      }
    }
    
    return summary;
  });

  // Enhanced context summary
  const contextSummary = dataContext.enhancedContext ? `
Business Context: ${dataContext.enhancedContext.businessDomain} | ${dataContext.enhancedContext.businessPurpose}
Key Metrics: ${dataContext.enhancedContext.keyMetrics.join(', ')}
Time Period: ${dataContext.enhancedContext.timePeriod}` : '';

  return {
    datasetOverview: `${dataContext.fileName || 'Dataset'}: ${totalRows.toLocaleString()} rows, ${columns.length} columns`,
    columnSummaries,
    contextSummary,
    sampleSize: sampleData.length
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body keys:', Object.keys(requestBody));
    
    if (!requestBody.dataContext) {
      throw new Error('dataContext is required');
    }

    const { dataContext, persona = 'general', systemPrompt, datasetProfile, healthMetrics }: ReportRequest = requestBody;

    // Validate dataContext structure
    if (!dataContext.columns || !Array.isArray(dataContext.columns)) {
      throw new Error('dataContext.columns must be an array');
    }

    if (!dataContext.sampleData || !Array.isArray(dataContext.sampleData)) {
      throw new Error('dataContext.sampleData must be an array');
    }

    if (typeof dataContext.totalRows !== 'number') {
      throw new Error('dataContext.totalRows must be a number');
    }

    console.log('Data context validation passed:', {
      columnsCount: dataContext.columns.length,
      sampleDataCount: dataContext.sampleData.length,
      totalRows: dataContext.totalRows
    });

    // Determine API configuration
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

    console.log(`Using ${provider} API with model ${model} for report generation`);

    // Create analytical context
    const analyticalContext = createAnalyticalContext(dataContext);

    // Build focused system prompt
    const personaPrompt = personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.general;
    
    let focusedSystemPrompt = `${personaPrompt}

DATASET OVERVIEW:
${analyticalContext.datasetOverview}

COLUMN ANALYSIS:
${analyticalContext.columnSummaries.join('\n')}

${analyticalContext.contextSummary}`;

    // Add profile and health context if available
    if (datasetProfile) {
      focusedSystemPrompt += `\n\nDATA PROFILE: ${datasetProfile.dataType} dataset (${(datasetProfile.confidence * 100).toFixed(0)}% confidence)`;
    }

    if (healthMetrics) {
      focusedSystemPrompt += `\n\nQUALITY STATUS: ${(healthMetrics.dataQuality * 100).toFixed(0)}% quality, trend: ${healthMetrics.trendDirection}`;
      
      if (healthMetrics.criticalIssues && healthMetrics.criticalIssues.length > 0) {
        focusedSystemPrompt += `\n\nCRITICAL ISSUES:\n${healthMetrics.criticalIssues.map((issue: string) => `- ${issue}`).join('\n')}`;
      }
    }

    focusedSystemPrompt += `\n\nINSTRUCTIONS:
- Analyze the data for meaningful business insights
- Focus on actionable findings, not data description
- Identify trends, patterns, and opportunities
- Provide specific recommendations
- Keep response concise and valuable
- Lead with insights, not statistics`;

    const userPrompt = `Analyze this dataset and provide strategic insights based on the data characteristics. Focus on what the data reveals about business performance and opportunities.`;

    console.log(`Making request to ${provider} API for focused analysis...`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: focusedSystemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.2,
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

    // Calculate completion stats
    const totalColumns = dataContext.columns.length;
    const columnTypes = dataContext.columns.reduce((acc, col) => {
      acc[col.type] = (acc[col.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dataCompleteness = dataContext.columns.map(col => {
      const nullCount = col.values.filter(val => val === null || val === undefined || val === '').length;
      const completeness = col.values.length > 0 ? ((col.values.length - nullCount) / col.values.length) * 100 : 0;
      return { column: col.name, completeness: Math.round(completeness) };
    });

    return new Response(JSON.stringify({ 
      report: reportContent,
      metadata: {
        totalRows: dataContext.totalRows,
        totalColumns,
        columnTypes,
        dataCompleteness,
        persona,
        generatedAt: new Date().toISOString(),
        datasetProfile,
        healthMetrics
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

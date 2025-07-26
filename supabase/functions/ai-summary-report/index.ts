
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Try multiple possible environment variable names for the API key
const xaiApiKey = Deno.env.get('XAI_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced statistical analysis for data-first insights
interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'insufficient_data';
  slope: number;
  confidence: number;
  correlation: number;
  changeRate: number;
  volatility: number;
  pattern: 'linear' | 'exponential' | 'cyclical' | 'irregular';
}

interface ColumnAnalysis {
  name: string;
  type: string;
  trend: TrendAnalysis;
  businessCriticality: 'high' | 'medium' | 'low';
  healthScore: number;
  riskLevel: 'critical' | 'warning' | 'good';
}

interface DatasetInsights {
  overallTrend: TrendAnalysis;
  keyColumns: ColumnAnalysis[];
  businessHealth: {
    score: number;
    criticalIssues: string[];
    opportunities: string[];
  };
  dataQuality: {
    completeness: number;
    consistency: number;
    accuracy: number;
  };
  confidenceLevel: number;
  domainType: string;
}

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
  domainContext?: {
    domain: string;
    industry?: string;
    businessType?: string;
    keyMetrics?: string[];
    customContext?: string;
    dataDescription?: string;
    dataType?: string;
    businessObjectives?: string[];
    analysisGoals?: string[];
  };
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

// Advanced statistical analysis functions
const analyzeTrend = (values: number[]): TrendAnalysis => {
  if (!values || values.length < 3) {
    return {
      direction: 'insufficient_data',
      slope: 0,
      confidence: 0,
      correlation: 0,
      changeRate: 0,
      volatility: 0,
      pattern: 'irregular'
    };
  }

  const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (validValues.length < 3) {
    return {
      direction: 'insufficient_data',
      slope: 0,
      confidence: 0,
      correlation: 0,
      changeRate: 0,
      volatility: 0,
      pattern: 'irregular'
    };
  }

  // Calculate linear trend
  const n = validValues.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = validValues.reduce((sum, val) => sum + val, 0) / n;
  
  const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (validValues[i] - yMean), 0);
  const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  
  // Calculate correlation coefficient
  const yVariance = validValues.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const correlation = (denominator !== 0 && yVariance !== 0) ? 
    Math.abs(numerator) / Math.sqrt(denominator * yVariance) : 0;

  // Calculate volatility and change rate
  const differences = validValues.slice(1).map((val, i) => Math.abs(val - validValues[i]));
  const volatility = differences.length > 0 ? 
    differences.reduce((sum, diff) => sum + diff, 0) / differences.length : 0;
  
  const changeRate = validValues.length > 1 ? 
    Math.abs((validValues[validValues.length - 1] - validValues[0]) / validValues[0] * 100) : 0;

  // Determine direction based on slope and confidence
  let direction: TrendAnalysis['direction'];
  if (correlation < 0.3) {
    direction = volatility > yMean * 0.2 ? 'volatile' : 'stable';
  } else if (slope > 0) {
    direction = 'increasing';
  } else if (slope < 0) {
    direction = 'decreasing';
  } else {
    direction = 'stable';
  }

  // Determine pattern
  let pattern: TrendAnalysis['pattern'] = 'linear';
  if (correlation < 0.5) pattern = 'irregular';
  else if (Math.abs(slope) > yMean * 0.1) pattern = 'exponential';

  // Calculate confidence
  const sampleSizeScore = Math.min(n / 50, 1);
  const correlationScore = correlation;
  const completenessScore = validValues.length / values.length;
  const confidence = (sampleSizeScore + correlationScore + completenessScore) / 3;

  return {
    direction,
    slope,
    confidence,
    correlation,
    changeRate,
    volatility,
    pattern
  };
};

const detectDataDomain = (columns: any[], fileName?: string, providedDomain?: string): string => {
  // Prioritize provided domain context from survey
  if (providedDomain) {
    console.log('Using provided domain context:', providedDomain);
    return providedDomain;
  }

  const columnNames = columns.map(col => col.name.toLowerCase());
  const fileNameLower = fileName?.toLowerCase() || '';
  
  // Score each domain
  const domainScores = {
    sales: 0,
    financial: 0,
    marketing: 0,
    operations: 0,
    customer: 0,
    scientific: 0
  };
  
  // File name analysis
  if (fileNameLower.includes('sales') || fileNameLower.includes('revenue')) domainScores.sales += 5;
  if (fileNameLower.includes('financial') || fileNameLower.includes('budget')) domainScores.financial += 5;
  if (fileNameLower.includes('marketing') || fileNameLower.includes('campaign')) domainScores.marketing += 5;
  if (fileNameLower.includes('operations') || fileNameLower.includes('process')) domainScores.operations += 5;
  if (fileNameLower.includes('customer') || fileNameLower.includes('support')) domainScores.customer += 5;
  if (fileNameLower.includes('test') || fileNameLower.includes('experiment')) domainScores.scientific += 5;
  
  // Column name analysis
  columnNames.forEach(colName => {
    if (colName.includes('sales') || colName.includes('revenue') || colName.includes('deal')) domainScores.sales += 3;
    if (colName.includes('cost') || colName.includes('profit') || colName.includes('budget')) domainScores.financial += 3;
    if (colName.includes('campaign') || colName.includes('engagement') || colName.includes('conversion')) domainScores.marketing += 3;
    if (colName.includes('efficiency') || colName.includes('process') || colName.includes('production')) domainScores.operations += 3;
    if (colName.includes('satisfaction') || colName.includes('support') || colName.includes('feedback')) domainScores.customer += 3;
    if (colName.includes('test') || colName.includes('measurement') || colName.includes('result')) domainScores.scientific += 3;
  });
  
  const bestDomain = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  return bestDomain;
};

const analyzeDatasetInsights = (dataContext: DataContext): DatasetInsights => {
  const columns = dataContext.columns || [];
  
  // Analyze individual columns
  const keyColumns: ColumnAnalysis[] = columns.map(col => {
    const numericValues = col.values
      .map(v => Number(v))
      .filter(v => !isNaN(v));
    
    const trend = analyzeTrend(numericValues);
    
    // Determine business criticality
    const name = col.name.toLowerCase();
    let businessCriticality: 'high' | 'medium' | 'low' = 'low';
    if (name.includes('revenue') || name.includes('profit') || name.includes('sales') || 
        name.includes('cost') || name.includes('customer')) {
      businessCriticality = 'high';
    } else if (name.includes('conversion') || name.includes('efficiency') || name.includes('quality')) {
      businessCriticality = 'medium';
    }
    
    // Calculate health score
    let healthScore = 0.5;
    switch (trend.direction) {
      case 'increasing': healthScore += 0.3; break;
      case 'stable': healthScore += 0.1; break;
      case 'decreasing': healthScore -= 0.3; break;
      case 'volatile': healthScore -= 0.2; break;
    }
    healthScore += trend.confidence * 0.2;
    healthScore = Math.max(0, Math.min(1, healthScore));
    
    // Determine risk level
    let riskLevel: 'critical' | 'warning' | 'good' = 'good';
    if (healthScore < 0.3 || trend.direction === 'decreasing') riskLevel = 'critical';
    else if (healthScore < 0.6 || trend.direction === 'volatile') riskLevel = 'warning';
    
    return {
      name: col.name,
      type: col.type,
      trend,
      businessCriticality,
      healthScore,
      riskLevel
    };
  });

  // Calculate overall metrics
  const healthScores = keyColumns.map(col => col.healthScore);
  const avgHealthScore = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  
  const criticalIssues: string[] = [];
  const opportunities: string[] = [];
  
  keyColumns.forEach(col => {
    if (col.riskLevel === 'critical') {
      criticalIssues.push(`${col.name}: ${col.trend.direction} trend (${(col.trend.confidence * 100).toFixed(0)}% confidence)`);
    }
    if (col.trend.direction === 'increasing' && col.businessCriticality === 'high') {
      opportunities.push(`${col.name}: Strong positive trend - scaling opportunity`);
    }
  });

  // Calculate overall trend
  const allTrends = keyColumns.filter(col => col.trend.direction !== 'insufficient_data').map(col => col.trend);
  const avgSlope = allTrends.reduce((sum, t) => sum + t.slope, 0) / allTrends.length;
  const avgConfidence = allTrends.reduce((sum, t) => sum + t.confidence, 0) / allTrends.length;
  
  const directions = allTrends.map(t => t.direction);
  const directionCounts = directions.reduce((acc, dir) => {
    acc[dir] = (acc[dir] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonDirection = Object.entries(directionCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] as TrendAnalysis['direction'] || 'stable';

  const overallTrend: TrendAnalysis = {
    direction: mostCommonDirection,
    slope: avgSlope || 0,
    confidence: avgConfidence || 0,
    correlation: 0,
    changeRate: 0,
    volatility: 0,
    pattern: avgConfidence > 0.7 ? 'linear' : 'irregular'
  };

  // Calculate data quality
  const totalCells = columns.reduce((sum, col) => sum + col.values.length, 0);
  const nonNullCells = columns.reduce((sum, col) => {
    return sum + col.values.filter(v => v !== null && v !== undefined && v !== '').length;
  }, 0);
  
  const completeness = totalCells > 0 ? nonNullCells / totalCells : 0;
  
  return {
    overallTrend,
    keyColumns,
    businessHealth: {
      score: avgHealthScore,
      criticalIssues,
      opportunities
    },
    dataQuality: {
      completeness,
      consistency: completeness * 0.9,
      accuracy: completeness * 0.95
    },
    confidenceLevel: avgConfidence,
    domainType: detectDataDomain(columns, dataContext.fileName)
  };
};

const createAnalyticalContext = (dataContext: DataContext) => {
  const insights = analyzeDatasetInsights(dataContext);
  const columns = dataContext.columns || [];
  
  // Create enhanced column summaries with trend analysis
  const columnSummaries = insights.keyColumns.map(col => {
    const originalCol = columns.find(c => c.name === col.name);
    const values = originalCol?.values || [];
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const completeness = values.length > 0 ? (nonNullValues.length / values.length) * 100 : 0;
    
    let summary = `${col.name} (${col.type})`;
    if (originalCol?.businessMeaning) summary += ` - ${originalCol.businessMeaning}`;
    
    // Add trend information
    if (col.trend.direction !== 'insufficient_data') {
      summary += ` [TREND: ${col.trend.direction.toUpperCase()}]`;
      if (col.riskLevel === 'critical') summary += ` ⚠️ CRITICAL`;
      else if (col.riskLevel === 'warning') summary += ` ⚡ WARNING`;
    }
    
    if (completeness < 100) summary += ` [${completeness.toFixed(0)}% complete]`;
    
    // Add statistical insights for numeric columns
    if (col.type === 'numeric' && nonNullValues.length > 0) {
      const nums = nonNullValues.map(v => Number(v)).filter(v => !isNaN(v));
      if (nums.length > 0) {
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        summary += ` [avg: ${avg.toFixed(1)}, range: ${min}-${max}]`;
        if (col.trend.changeRate > 0) {
          summary += ` [change: ${col.trend.changeRate.toFixed(1)}%]`;
        }
      }
    }
    
    return summary;
  });

  // Create business health summary
  const healthSummary = `
BUSINESS HEALTH ANALYSIS:
- Overall Health Score: ${(insights.businessHealth.score * 100).toFixed(0)}%
- Domain Type: ${insights.domainType.toUpperCase()}
- Data Quality: ${(insights.dataQuality.completeness * 100).toFixed(0)}% complete
- Overall Trend: ${insights.overallTrend.direction.toUpperCase()} (${(insights.overallTrend.confidence * 100).toFixed(0)}% confidence)`;

  const criticalIssuesSummary = insights.businessHealth.criticalIssues.length > 0 ? `
CRITICAL ISSUES DETECTED:
${insights.businessHealth.criticalIssues.map(issue => `- ${issue}`).join('\n')}` : '';

  const opportunitiesSummary = insights.businessHealth.opportunities.length > 0 ? `
OPPORTUNITIES IDENTIFIED:
${insights.businessHealth.opportunities.map(opp => `- ${opp}`).join('\n')}` : '';

  // Enhanced context summary
  const contextSummary = dataContext.enhancedContext ? `
BUSINESS CONTEXT: ${dataContext.enhancedContext.businessDomain} | ${dataContext.enhancedContext.businessPurpose}
Key Metrics: ${dataContext.enhancedContext.keyMetrics.join(', ')}
Time Period: ${dataContext.enhancedContext.timePeriod}` : '';

  return {
    datasetOverview: `${dataContext.fileName || 'Dataset'}: ${dataContext.totalRows.toLocaleString()} rows, ${columns.length} columns`,
    columnSummaries,
    healthSummary,
    criticalIssuesSummary,
    opportunitiesSummary,
    contextSummary,
    insights,
    sampleSize: dataContext.sampleData.length
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

    const { dataContext, persona = 'general', systemPrompt, datasetProfile, healthMetrics, domainContext }: ReportRequest = requestBody;

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

    // Create analytical context with enhanced insights
    const analyticalContext = createAnalyticalContext(dataContext);
    const insights = analyticalContext.insights;

    // Use domain context from survey if available
    if (domainContext) {
      console.log('Using domain context from survey:', domainContext);
      insights.domainType = domainContext.domain;
    }

    // Generate domain-specific terminology and urgency matching
    const domainTerminology = insights.domainType;
    const urgencyLevel = insights.businessHealth.score < 0.3 ? 'CRITICAL' : 
                        insights.businessHealth.score < 0.6 ? 'WARNING' : 'STABLE';
    
    // Build enhanced system prompt with data-first analysis
    const personaPrompt = personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.general;
    
    let enhancedSystemPrompt = `CRITICAL INSTRUCTIONS - DATA-FIRST ANALYSIS:
1. ANALYZE THE ACTUAL DATA TRENDS FIRST - ignore templates, focus on what the data shows
2. MATCH RESPONSE URGENCY TO DATA SEVERITY - ${urgencyLevel} situation detected
3. USE DOMAIN-APPROPRIATE TERMINOLOGY - this is ${insights.domainType.toUpperCase()} data
4. QUANTIFY ALL MAJOR INSIGHTS with specific numbers and confidence levels
5. VALIDATE ALL RECOMMENDATIONS against observed data patterns

${personaPrompt}

STATISTICAL ANALYSIS RESULTS:
${analyticalContext.healthSummary}
${analyticalContext.criticalIssuesSummary}
${analyticalContext.opportunitiesSummary}

DATASET OVERVIEW:
${analyticalContext.datasetOverview}

DETAILED COLUMN ANALYSIS WITH TRENDS:
${analyticalContext.columnSummaries.join('\n')}

${analyticalContext.contextSummary}`;

    // Add domain context from survey if available
    if (domainContext) {
      enhancedSystemPrompt += `

DOMAIN CONTEXT (from user survey):
- Business Domain: ${domainContext.domain}
${domainContext.industry ? `- Industry: ${domainContext.industry}` : ''}
${domainContext.businessType ? `- Business Type: ${domainContext.businessType}` : ''}
${domainContext.keyMetrics?.length ? `- Key Metrics: ${domainContext.keyMetrics.join(', ')}` : ''}
${domainContext.businessObjectives?.length ? `- Business Objectives: ${domainContext.businessObjectives.join(', ')}` : ''}
${domainContext.analysisGoals?.length ? `- Analysis Goals: ${domainContext.analysisGoals.join(', ')}` : ''}
${domainContext.dataDescription ? `- Data Description: ${domainContext.dataDescription}` : ''}
${domainContext.customContext ? `- Additional Context: ${domainContext.customContext}` : ''}

IMPORTANT: Use the domain context above to provide industry-specific insights, terminology, and recommendations. Focus on metrics and objectives relevant to ${domainContext.domain} operations.`;
    }

    // Add confidence and validation context
    enhancedSystemPrompt += `\n\nCONFIDENCE CALIBRATION:
- Analysis Confidence: ${(insights.confidenceLevel * 100).toFixed(0)}%
- Data Quality: ${(insights.dataQuality.completeness * 100).toFixed(0)}% complete
- Sample Size: ${analyticalContext.sampleSize} records analyzed
- Domain Detection: ${insights.domainType} (${domainTerminology})`;

    // Add severity-specific instructions
    if (urgencyLevel === 'CRITICAL') {
      enhancedSystemPrompt += `\n\nCRITICAL SITUATION - URGENT LANGUAGE REQUIRED:
- Use immediate action language: "URGENT", "CRITICAL", "IMMEDIATE ATTENTION NEEDED"
- Focus on crisis intervention and stabilization strategies
- Prioritize risk mitigation over growth opportunities`;
    } else if (urgencyLevel === 'WARNING') {
      enhancedSystemPrompt += `\n\nWARNING SITUATION - BALANCED URGENCY:
- Use concerned but measured language
- Focus on corrective actions and trend reversal
- Balance immediate fixes with medium-term improvements`;
    } else {
      enhancedSystemPrompt += `\n\nSTABLE/POSITIVE SITUATION - OPTIMIZATION FOCUS:
- Use confident, forward-looking language
- Focus on scaling successful patterns and optimizing performance
- Emphasize growth opportunities and strategic initiatives`;
    }

    // Add profile and health context if available
    if (datasetProfile) {
      enhancedSystemPrompt += `\n\nEXTERNAL DATA PROFILE: ${datasetProfile.dataType} dataset (${(datasetProfile.confidence * 100).toFixed(0)}% confidence)`;
    }

    if (healthMetrics) {
      enhancedSystemPrompt += `\n\nEXTERNAL QUALITY STATUS: ${(healthMetrics.dataQuality * 100).toFixed(0)}% quality, trend: ${healthMetrics.trendDirection}`;
      
      if (healthMetrics.criticalIssues && healthMetrics.criticalIssues.length > 0) {
        enhancedSystemPrompt += `\n\nEXTERNAL CRITICAL ISSUES:\n${healthMetrics.criticalIssues.map((issue: string) => `- ${issue}`).join('\n')}`;
      }
    }

    enhancedSystemPrompt += `\n\nFINAL VALIDATION RULES:
- Every major insight MUST cite specific data evidence (numbers, percentages, trends)
- Recommendations MUST align with observed data patterns (no generic advice)
- Confidence statements MUST reflect actual data quality and sample size
- Language urgency MUST match the severity of detected issues
- Domain terminology MUST be appropriate for ${insights.domainType} context`;

    const enhancedUserPrompt = `Based on the statistical analysis showing ${insights.overallTrend.direction} trends with ${(insights.confidenceLevel * 100).toFixed(0)}% confidence, provide ${urgencyLevel.toLowerCase()} insights that match the actual data patterns observed. Focus on evidence-based recommendations that address the specific ${insights.domainType} context and severity level detected.`;

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
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: enhancedUserPrompt }
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

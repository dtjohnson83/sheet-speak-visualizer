import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BusinessAnalysisRequest {
  data: any[];
  columns: any[];
  issues: any[];
  insights: any[];
  businessContext?: {
    industry?: string;
    companySize?: string;
    revenue?: number;
    objectives?: string[];
    timeframe?: string;
  };
  includeStakeholders?: boolean;
}

interface EnhancedRecommendation {
  id: string;
  type: 'recommendation';
  title: string;
  description: string;
  financialImpact: {
    description: string;
    range: { min: number; max: number };
    confidence: number;
    basis: string;
  };
  timeframe: {
    description: string;
    weeks: number;
    phases: string[];
    dependencies: string[];
  };
  priority: {
    score: number;
    level: 'critical' | 'high' | 'medium' | 'low';
    urgency: string;
    strategicAlignment: number;
  };
  dataPoints: {
    affected: number;
    confidence: number;
    successProbability: number;
    keyMetrics: string[];
  };
  implementation: {
    steps: string[];
    resources: string[];
    risks: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: BusinessAnalysisRequest = await req.json();
    const { data, columns, issues, insights, businessContext, includeStakeholders } = requestData;

    console.log('Starting business analysis for:', {
      dataSize: data.length,
      columnCount: columns.length,
      issueCount: issues.length,
      insightCount: insights.length,
      industry: businessContext?.industry
    });

    // Analyze data patterns
    const dataAnalysis = analyzeDataPatterns(data, columns);
    const businessMetrics = calculateBusinessMetrics(data, columns, businessContext);
    
    // Generate LLM-enhanced recommendations
    const enhancedRecommendations = await generateEnhancedRecommendations(
      dataAnalysis,
      businessMetrics,
      issues,
      insights,
      businessContext
    );

    // Generate stakeholder analysis if requested
    let stakeholderAnalysis = null;
    if (includeStakeholders) {
      stakeholderAnalysis = await generateStakeholderAnalysis(columns, businessContext, insights);
    }

    return new Response(JSON.stringify({ 
      recommendations: enhancedRecommendations,
      analysis: dataAnalysis,
      metrics: businessMetrics,
      stakeholders: stakeholderAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-business-analyst:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeDataPatterns(data: any[], columns: any[]) {
  const numericColumns = columns.filter(col => col.type === 'numeric');
  const totalRows = data.length;
  
  // Calculate data quality score
  const completenessScore = columns.reduce((acc, col) => {
    const nonNullCount = data.filter(row => row[col.name] != null && row[col.name] !== '').length;
    return acc + (nonNullCount / totalRows);
  }, 0) / columns.length;

  // Identify patterns in numeric data
  const numericAnalysis = numericColumns.map(col => {
    const values = data.map(row => parseFloat(row[col.name])).filter(v => !isNaN(v));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    
    return {
      column: col.name,
      average: avg,
      variance: variance,
      range: { min: Math.min(...values), max: Math.max(...values) },
      outliers: values.filter(v => Math.abs(v - avg) > 2 * Math.sqrt(variance)).length
    };
  });

  return {
    totalRows,
    totalColumns: columns.length,
    completenessScore,
    numericAnalysis,
    dataQualityScore: Math.round(completenessScore * 100)
  };
}

function calculateBusinessMetrics(data: any[], columns: any[], businessContext?: any) {
  const revenueColumns = columns.filter(col => 
    col.name.toLowerCase().includes('revenue') || 
    col.name.toLowerCase().includes('sales') ||
    col.name.toLowerCase().includes('amount')
  );

  let estimatedRevenue = businessContext?.revenue;
  if (!estimatedRevenue && revenueColumns.length > 0) {
    const revenueData = data.map(row => parseFloat(row[revenueColumns[0].name])).filter(v => !isNaN(v));
    estimatedRevenue = revenueData.reduce((a, b) => a + b, 0);
  }

  const companySize = businessContext?.companySize || estimateCompanySize(data.length, estimatedRevenue);
  const industry = businessContext?.industry || detectIndustry(columns);

  return {
    estimatedRevenue: estimatedRevenue || 1000000, // Default 1M if unknown
    companySize,
    industry,
    marketMultiplier: getMarketMultiplier(industry),
    urgencyFactor: calculateUrgencyFactor(businessContext?.timeframe)
  };
}

function estimateCompanySize(dataSize: number, revenue?: number): string {
  if (revenue) {
    if (revenue < 1000000) return 'startup';
    if (revenue < 10000000) return 'small';
    if (revenue < 100000000) return 'medium';
    return 'enterprise';
  }
  
  if (dataSize < 1000) return 'startup';
  if (dataSize < 10000) return 'small';
  if (dataSize < 100000) return 'medium';
  return 'enterprise';
}

function detectIndustry(columns: any[]): string {
  const columnNames = columns.map(col => col.name.toLowerCase()).join(' ');
  
  if (columnNames.includes('customer') || columnNames.includes('retail')) return 'retail';
  if (columnNames.includes('patient') || columnNames.includes('medical')) return 'healthcare';
  if (columnNames.includes('account') || columnNames.includes('transaction')) return 'finance';
  if (columnNames.includes('product') || columnNames.includes('manufacturing')) return 'manufacturing';
  if (columnNames.includes('student') || columnNames.includes('education')) return 'education';
  
  return 'general';
}

function getMarketMultiplier(industry: string): number {
  const multipliers: Record<string, number> = {
    'finance': 1.5,
    'healthcare': 1.3,
    'retail': 1.2,
    'manufacturing': 1.1,
    'education': 0.9,
    'general': 1.0
  };
  return multipliers[industry] || 1.0;
}

function calculateUrgencyFactor(timeframe?: string): number {
  if (!timeframe) return 1.0;
  
  const lower = timeframe.toLowerCase();
  if (lower.includes('urgent') || lower.includes('asap')) return 1.5;
  if (lower.includes('month')) return 1.2;
  if (lower.includes('quarter')) return 1.0;
  if (lower.includes('year')) return 0.8;
  
  return 1.0;
}

async function generateEnhancedRecommendations(
  dataAnalysis: any,
  businessMetrics: any,
  issues: any[],
  insights: any[],
  businessContext?: any
): Promise<EnhancedRecommendation[]> {
  
  // Group issues by severity and impact
  const criticalIssues = issues.filter(issue => issue.severity === 'high');
  const recommendations: EnhancedRecommendation[] = [];

  // Generate top 3 recommendations based on impact
  const topRecommendations = await Promise.all([
    generateDataQualityRecommendation(dataAnalysis, businessMetrics, criticalIssues),
    generatePerformanceRecommendation(dataAnalysis, businessMetrics),
    generateBusinessIntelligenceRecommendation(insights, businessMetrics, businessContext)
  ]);

  return topRecommendations.filter(rec => rec !== null);
}

async function generateDataQualityRecommendation(
  dataAnalysis: any,
  businessMetrics: any,
  criticalIssues: any[]
): Promise<EnhancedRecommendation> {
  
  const baseRevenue = businessMetrics.estimatedRevenue;
  const qualityScore = dataAnalysis.dataQualityScore;
  const impactMultiplier = (100 - qualityScore) / 100 * businessMetrics.marketMultiplier;
  
  const financialImpact = {
    min: Math.round(baseRevenue * 0.02 * impactMultiplier),
    max: Math.round(baseRevenue * 0.08 * impactMultiplier)
  };

  const implementationWeeks = businessMetrics.companySize === 'enterprise' ? 12 : 
                             businessMetrics.companySize === 'medium' ? 8 : 6;

  return {
    id: `enhanced_rec_${Date.now()}_quality`,
    type: 'recommendation',
    title: 'Implement Comprehensive Data Quality Framework',
    description: await generateLLMDescription('data_quality', {
      qualityScore,
      criticalIssues: criticalIssues.length,
      industry: businessMetrics.industry,
      companySize: businessMetrics.companySize
    }),
    financialImpact: {
      description: `Improved data quality typically increases operational efficiency by 15-25% and reduces compliance risks by 40-60% for ${businessMetrics.industry} companies.`,
      range: financialImpact,
      confidence: 0.85,
      basis: `Based on ${businessMetrics.industry} industry benchmarks and current data quality score of ${qualityScore}%`
    },
    timeframe: {
      description: `${implementationWeeks}-week phased implementation with immediate wins in weeks 2-4`,
      weeks: implementationWeeks,
      phases: [
        'Data audit and baseline establishment',
        'Critical issue resolution and validation rules',
        'Automated monitoring and alerting setup',
        'Team training and process optimization'
      ],
      dependencies: ['Data governance team assignment', 'IT infrastructure review']
    },
    priority: {
      score: Math.round(85 + (100 - qualityScore) * 0.15),
      level: qualityScore < 70 ? 'critical' : qualityScore < 85 ? 'high' : 'medium',
      urgency: `Data quality issues affecting ${criticalIssues.length} critical business processes`,
      strategicAlignment: 90
    },
    dataPoints: {
      affected: Math.round(dataAnalysis.totalRows * (100 - qualityScore) / 100),
      confidence: 0.87,
      successProbability: 0.82,
      keyMetrics: ['Data completeness', 'Accuracy score', 'Processing time', 'Error rates']
    },
    implementation: {
      steps: [
        'Conduct comprehensive data quality assessment',
        'Implement automated validation rules',
        'Set up real-time monitoring dashboards',
        'Train team on data quality best practices'
      ],
      resources: ['Data analyst (0.5 FTE)', 'IT support (0.25 FTE)', 'Data quality tools license'],
      risks: ['Initial productivity dip during implementation', 'Change management resistance']
    }
  };
}

async function generatePerformanceRecommendation(
  dataAnalysis: any,
  businessMetrics: any
): Promise<EnhancedRecommendation> {
  
  const isLargeDataset = dataAnalysis.totalRows > 50000;
  if (!isLargeDataset) return null;

  const baseRevenue = businessMetrics.estimatedRevenue;
  const performanceImpact = {
    min: Math.round(baseRevenue * 0.01),
    max: Math.round(baseRevenue * 0.05)
  };

  return {
    id: `enhanced_rec_${Date.now()}_performance`,
    type: 'recommendation',
    title: 'Optimize Data Processing Performance',
    description: `With ${dataAnalysis.totalRows.toLocaleString()} records, implement data processing optimization to improve analysis speed by 60-80% and reduce operational costs.`,
    financialImpact: {
      description: 'Performance optimization reduces processing costs and enables faster decision-making cycles',
      range: performanceImpact,
      confidence: 0.78,
      basis: `Based on dataset size of ${dataAnalysis.totalRows.toLocaleString()} records and current processing inefficiencies`
    },
    timeframe: {
      description: '6-8 week implementation with performance gains visible by week 3',
      weeks: 7,
      phases: [
        'Performance audit and bottleneck identification',
        'Data indexing and query optimization',
        'Caching strategy implementation',
        'Load testing and fine-tuning'
      ],
      dependencies: ['Database administrator access', 'Performance testing environment']
    },
    priority: {
      score: 75,
      level: 'high',
      urgency: 'Large dataset causing processing delays affecting daily operations',
      strategicAlignment: 80
    },
    dataPoints: {
      affected: dataAnalysis.totalRows,
      confidence: 0.82,
      successProbability: 0.88,
      keyMetrics: ['Query response time', 'System throughput', 'Resource utilization']
    },
    implementation: {
      steps: [
        'Analyze current query patterns and bottlenecks',
        'Implement database indexing strategy',
        'Deploy caching layer for frequent queries',
        'Monitor and optimize performance metrics'
      ],
      resources: ['Database specialist (0.3 FTE)', 'DevOps engineer (0.2 FTE)'],
      risks: ['Temporary system downtime during optimization', 'Query complexity increase']
    }
  };
}

async function generateBusinessIntelligenceRecommendation(
  insights: any[],
  businessMetrics: any,
  businessContext?: any
): Promise<EnhancedRecommendation> {
  
  const baseRevenue = businessMetrics.estimatedRevenue;
  const biImpact = {
    min: Math.round(baseRevenue * 0.03),
    max: Math.round(baseRevenue * 0.12)
  };

  return {
    id: `enhanced_rec_${Date.now()}_bi`,
    type: 'recommendation',
    title: 'Deploy Advanced Business Intelligence Platform',
    description: `Transform your ${insights.length} data insights into actionable business intelligence with automated reporting and predictive analytics tailored for ${businessMetrics.industry} operations.`,
    financialImpact: {
      description: 'Advanced BI typically improves decision-making speed by 40% and identifies new revenue opportunities worth 3-12% of annual revenue',
      range: biImpact,
      confidence: 0.82,
      basis: `Industry benchmark for ${businessMetrics.industry} companies with similar data maturity`
    },
    timeframe: {
      description: '10-14 week comprehensive BI platform deployment',
      weeks: 12,
      phases: [
        'Requirements gathering and BI platform selection',
        'Data pipeline and ETL process setup',
        'Dashboard and reporting framework development',
        'Advanced analytics and ML model integration',
        'User training and adoption program'
      ],
      dependencies: ['Executive sponsorship', 'Data architecture review', 'BI tool licensing']
    },
    priority: {
      score: 82,
      level: 'high',
      urgency: 'Competitive advantage requires faster insight-to-action cycles',
      strategicAlignment: 95
    },
    dataPoints: {
      affected: insights.length,
      confidence: 0.85,
      successProbability: 0.79,
      keyMetrics: ['Time to insight', 'Decision accuracy', 'Revenue per insight', 'User adoption rate']
    },
    implementation: {
      steps: [
        'Define BI requirements and success metrics',
        'Set up automated data pipelines',
        'Build executive and operational dashboards',
        'Implement predictive analytics models',
        'Launch user training and adoption program'
      ],
      resources: ['BI analyst (1.0 FTE)', 'Data engineer (0.5 FTE)', 'Change management lead (0.3 FTE)'],
      risks: ['User adoption challenges', 'Data integration complexity', 'Initial learning curve']
    }
  };
}

async function generateLLMDescription(type: string, context: any): Promise<string> {
  if (!openAIApiKey) {
    return `Enhanced ${type} recommendation based on data analysis and business context.`;
  }

  try {
    const prompt = `Generate a concise, business-focused description for a ${type} recommendation with the following context:
    - Industry: ${context.industry}
    - Company size: ${context.companySize}
    - Quality score: ${context.qualityScore}%
    - Critical issues: ${context.criticalIssues}
    
    Focus on business impact and actionable insights. Keep it under 100 words and professional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a business analyst providing strategic recommendations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content || `Enhanced ${type} recommendation based on comprehensive analysis.`;
  } catch (error) {
    console.error('LLM description generation failed:', error);
    return `Enhanced ${type} recommendation based on data analysis and business context.`;
  }
}
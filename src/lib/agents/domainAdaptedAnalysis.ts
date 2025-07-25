import { DataRow, ColumnInfo } from '@/pages/Index';
import { DomainContext } from '@/components/agents/DomainSurvey';
import { BusinessPrediction, BusinessScenario } from '@/hooks/usePredictiveAnalytics';
import { analyzeDatasetInsights, DatasetInsights } from '@/lib/analysis/statisticalAnalysis';
import { DynamicScenarioGenerator } from '@/lib/ml/dynamicScenarioGenerator';
import { PreAnalysisEngine, PreAnalysisResult } from '@/lib/ml/preAnalysisLayer';

export interface DomainAdaptedInsight {
  id: string;
  title: string;
  description: string;
  domain_specific: boolean;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  category: 'trend' | 'anomaly' | 'prediction' | 'recommendation' | 'opportunity';
  business_impact: 'high' | 'medium' | 'low';
  implementation_effort: 'high' | 'medium' | 'low';
  timeline: string;
}

export interface DomainAdaptedAnalysis {
  insights: DomainAdaptedInsight[];
  predictions: BusinessPrediction[];
  scenarios: BusinessScenario[];
  domain_summary: string;
  confidence_score: number;
  recommendations: {
    title: string;
    description: string;
    priority: number;
    implementation: string;
  }[];
}

export const performDomainAdaptedAnalysis = async (
  data: DataRow[],
  columns: ColumnInfo[],
  domainContext?: DomainContext
): Promise<DomainAdaptedAnalysis> => {
  // Perform pre-analysis to understand data characteristics
  const preAnalysis = PreAnalysisEngine.analyze(data, columns);
  
  // Get domain-specific column mappings and thresholds
  const domainConfig = getDomainConfiguration(domainContext?.domain || 'general');
  
  // Identify relevant columns based on domain
  const relevantColumns = identifyRelevantColumns(columns, domainConfig, domainContext);
  
  // Perform statistical analysis with domain context
  const stats = analyzeDatasetInsights(data, relevantColumns);
  
  // Generate domain-specific insights
  const insights = generateDomainSpecificInsights(
    data, 
    relevantColumns, 
    stats, 
    preAnalysis,
    domainContext
  );
  
  // Generate predictions with domain context
  const predictions = generateDomainPredictions(
    data, 
    relevantColumns, 
    stats, 
    domainContext
  );
  
  // Generate scenarios using dynamic scenario generator
  const scenarios = DynamicScenarioGenerator.generateAdaptiveScenarios(predictions, preAnalysis);
  
  // Generate domain-specific recommendations
  const recommendations = generateDomainRecommendations(
    insights, 
    predictions, 
    domainContext
  );
  
  return {
    insights,
    predictions,
    scenarios,
    domain_summary: generateDomainSummary(domainContext, preAnalysis, stats),
    confidence_score: calculateOverallConfidence(insights, predictions, preAnalysis),
    recommendations
  };
};

const getDomainConfiguration = (domain: string) => {
  const configurations: Record<string, any> = {
    finance: {
      keyColumns: ['revenue', 'profit', 'cost', 'income', 'expense', 'margin'],
      thresholds: { growth: 0.05, volatility: 0.15 },
      metrics: ['ROI', 'Growth Rate', 'Profit Margin'],
      timePatterns: ['monthly', 'quarterly', 'yearly']
    },
    retail: {
      keyColumns: ['sales', 'orders', 'customers', 'inventory', 'conversion'],
      thresholds: { growth: 0.03, seasonality: 0.2 },
      metrics: ['Sales Volume', 'Customer Acquisition', 'Inventory Turnover'],
      timePatterns: ['daily', 'weekly', 'seasonal']
    },
    manufacturing: {
      keyColumns: ['production', 'units', 'efficiency', 'quality', 'downtime'],
      thresholds: { efficiency: 0.8, quality: 0.95 },
      metrics: ['Production Efficiency', 'Quality Rate', 'Utilization'],
      timePatterns: ['shift', 'daily', 'weekly']
    },
    healthcare: {
      keyColumns: ['patients', 'outcomes', 'satisfaction', 'wait', 'utilization'],
      thresholds: { satisfaction: 0.8, utilization: 0.7 },
      metrics: ['Patient Satisfaction', 'Outcome Quality', 'Resource Utilization'],
      timePatterns: ['daily', 'weekly', 'monthly']
    },
    general: {
      keyColumns: ['value', 'amount', 'count', 'rate', 'total'],
      thresholds: { growth: 0.05, volatility: 0.2 },
      metrics: ['Growth Rate', 'Performance', 'Efficiency'],
      timePatterns: ['daily', 'weekly', 'monthly']
    }
  };
  
  return configurations[domain] || configurations.general;
};

const identifyRelevantColumns = (
  columns: ColumnInfo[], 
  domainConfig: any, 
  domainContext?: DomainContext
): ColumnInfo[] => {
  const relevantColumns = columns.filter(col => {
    const colName = col.name.toLowerCase();
    
    // Check against domain-specific keywords
    const matchesDomainKeywords = domainConfig.keyColumns.some((keyword: string) =>
      colName.includes(keyword)
    );
    
    // Check against user-specified key metrics
    const matchesUserMetrics = domainContext?.keyMetrics?.some(metric =>
      colName.includes(metric.toLowerCase().replace(/\s+/g, ''))
    );
    
    // Always include numeric columns for statistical analysis
    const isNumeric = col.type === 'numeric';
    
    return matchesDomainKeywords || matchesUserMetrics || isNumeric;
  });
  
  return relevantColumns.length > 0 ? relevantColumns : columns;
};

const generateDomainSpecificInsights = (
  data: DataRow[],
  columns: ColumnInfo[],
  stats: DatasetInsights,
  preAnalysis: PreAnalysisResult,
  domainContext?: DomainContext
): DomainAdaptedInsight[] => {
  const insights: DomainAdaptedInsight[] = [];
  const domain = domainContext?.domain || 'general';
  
  // Generate trend insights
  if (preAnalysis.trendAnalysis.primaryTrend !== 'stable') {
    insights.push({
      id: `trend-${Date.now()}`,
      title: `${getDomainTerminology(domain, 'performance')} Trend Detected`,
      description: `Data shows a ${preAnalysis.trendAnalysis.primaryTrend} trend with ${preAnalysis.trendAnalysis.trendStrength.toFixed(1)} strength.`,
      domain_specific: true,
      confidence: preAnalysis.trendAnalysis.trendStrength,
      priority: preAnalysis.trendAnalysis.primaryTrend.includes('negative') ? 'high' : 'medium',
      actionable: true,
      category: 'trend',
      business_impact: preAnalysis.trendAnalysis.primaryTrend.includes('negative') ? 'high' : 'medium',
      implementation_effort: 'medium',
      timeline: '1-3 months'
    });
  }
  
  // Generate anomaly insights
  if (preAnalysis.anomalies.detected) {
    insights.push({
      id: `anomaly-${Date.now()}`,
      title: `${preAnalysis.anomalies.count} ${getDomainTerminology(domain, 'anomalies')} Detected`,
      description: `Identified unusual patterns that may indicate ${getDomainSpecificAnomalyReasons(domain)}.`,
      domain_specific: true,
      confidence: 0.8, // Default confidence for anomaly detection
      priority: 'high',
      actionable: true,
      category: 'anomaly',
      business_impact: 'high',
      implementation_effort: 'low',
      timeline: 'immediate'
    });
  }
  
  // Generate data quality insights
  if (preAnalysis.dataHealth.score < 0.7) {
    insights.push({
      id: `quality-${Date.now()}`,
      title: 'Data Quality Improvement Needed',
      description: `Current data quality score is ${(preAnalysis.dataHealth.score * 100).toFixed(1)}%. Improving data quality will enhance prediction accuracy.`,
      domain_specific: false,
      confidence: 0.9,
      priority: 'medium',
      actionable: true,
      category: 'recommendation',
      business_impact: 'medium',
      implementation_effort: 'high',
      timeline: '2-6 months'
    });
  }
  
  return insights;
};

const generateDomainPredictions = (
  data: DataRow[],
  columns: ColumnInfo[],
  stats: DatasetInsights,
  domainContext?: DomainContext
): BusinessPrediction[] => {
  const predictions: BusinessPrediction[] = [];
  const domain = domainContext?.domain || 'general';
  
  // Find the most relevant numeric column for prediction
  const primaryColumn = columns.find(col => 
    col.type === 'numeric' && 
    (domainContext?.keyMetrics?.some(metric => 
      col.name.toLowerCase().includes(metric.toLowerCase())
    ) || ['revenue', 'sales', 'profit', 'value'].some(keyword =>
      col.name.toLowerCase().includes(keyword)
    ))
  ) || columns.find(col => col.type === 'numeric');
  
  if (primaryColumn && data.length > 0) {
    const values = data.map(row => parseFloat(row[primaryColumn.name]) || 0);
    const recentValue = values[values.length - 1];
    const trend = values.length > 1 ? (recentValue - values[0]) / values[0] : 0;
    
    predictions.push({
      id: `prediction-${Date.now()}`,
      type: 'revenue' as const,
      title: `${primaryColumn.name} Forecast`,
      description: `Predicted ${primaryColumn.name} based on trend analysis`,
      prediction: recentValue * (1 + trend * 0.5), // Simple trend projection
      unit: 'currency' as const,
      confidence: Math.max(0.3, Math.min(0.9, 0.7 - Math.abs(trend))),
      timeframe: getDomainTimeframe(domain),
      trend: trend > 0.05 ? 'increasing' : trend < -0.05 ? 'decreasing' : 'stable',
      impact: 'high' as const,
      timestamp: new Date(),
      metadata: {
        methodology: 'Trend Analysis with Domain Context',
        factors: getDomainFactors(domain)
      }
    });
  }
  
  return predictions;
};

const generateDomainRecommendations = (
  insights: DomainAdaptedInsight[],
  predictions: BusinessPrediction[],
  domainContext?: DomainContext
) => {
  const recommendations = [];
  const domain = domainContext?.domain || 'general';
  
  // High priority insights need immediate attention
  const highPriorityInsights = insights.filter(i => i.priority === 'high');
  if (highPriorityInsights.length > 0) {
    recommendations.push({
      title: `Address ${getDomainTerminology(domain, 'critical_issues')}`,
      description: `${highPriorityInsights.length} critical issues require immediate attention to maintain ${getDomainTerminology(domain, 'performance')}.`,
      priority: 1,
      implementation: 'Immediate action required - review flagged items and implement corrective measures.'
    });
  }
  
  // Declining trends need intervention
  const decliningPredictions = predictions.filter(p => p.trend === 'decreasing');
  if (decliningPredictions.length > 0) {
    recommendations.push({
      title: `Implement ${getDomainTerminology(domain, 'improvement_strategy')}`,
      description: `Declining trends detected. Implement targeted strategies to reverse negative trajectories.`,
      priority: 2,
      implementation: getDomainSpecificStrategy(domain)
    });
  }
  
  return recommendations;
};

const getDomainTerminology = (domain: string, concept: string): string => {
  const terminology: Record<string, Record<string, string>> = {
    finance: {
      performance: 'Financial Performance',
      anomalies: 'Financial Anomalies',
      critical_issues: 'Financial Risks',
      improvement_strategy: 'Revenue Optimization Strategy'
    },
    retail: {
      performance: 'Sales Performance',
      anomalies: 'Sales Anomalies',
      critical_issues: 'Sales Issues',
      improvement_strategy: 'Sales Growth Strategy'
    },
    manufacturing: {
      performance: 'Production Performance',
      anomalies: 'Production Anomalies',
      critical_issues: 'Production Issues',
      improvement_strategy: 'Efficiency Improvement Strategy'
    },
    general: {
      performance: 'Business Performance',
      anomalies: 'Data Anomalies',
      critical_issues: 'Critical Issues',
      improvement_strategy: 'Improvement Strategy'
    }
  };
  
  return terminology[domain]?.[concept] || terminology.general[concept];
};

const getDomainSpecificAnomalyReasons = (domain: string): string => {
  const reasons: Record<string, string> = {
    finance: 'irregular transactions, accounting errors, or fraud',
    retail: 'inventory issues, pricing errors, or demand spikes',
    manufacturing: 'equipment malfunctions, quality issues, or supply disruptions',
    healthcare: 'patient care variations, resource constraints, or process issues',
    general: 'process variations, data quality issues, or external factors'
  };
  
  return reasons[domain] || reasons.general;
};

// This function is no longer needed as we use const assertion

const getDomainTimeframe = (domain: string): string => {
  const timeframes: Record<string, string> = {
    finance: 'next quarter',
    retail: 'next month',
    manufacturing: 'next week',
    healthcare: 'next month',
    general: 'next period'
  };
  
  return timeframes[domain] || timeframes.general;
};

const getDomainFactors = (domain: string): string[] => {
  const factors: Record<string, string[]> = {
    finance: ['Market conditions', 'Economic indicators', 'Business cycles'],
    retail: ['Seasonal patterns', 'Customer behavior', 'Competition'],
    manufacturing: ['Production capacity', 'Supply chain', 'Demand fluctuations'],
    healthcare: ['Patient demographics', 'Treatment protocols', 'Resource availability'],
    general: ['Market trends', 'External factors', 'Historical patterns']
  };
  
  return factors[domain] || factors.general;
};

const getDomainSpecificStrategy = (domain: string): string => {
  const strategies: Record<string, string> = {
    finance: 'Review cost structure, optimize pricing strategies, and improve cash flow management.',
    retail: 'Enhance customer experience, optimize inventory, and implement targeted marketing campaigns.',
    manufacturing: 'Improve operational efficiency, reduce waste, and optimize production scheduling.',
    healthcare: 'Streamline patient care processes, optimize resource allocation, and improve outcomes.',
    general: 'Identify root causes, implement process improvements, and monitor key performance indicators.'
  };
  
  return strategies[domain] || strategies.general;
};

const generateDomainSummary = (
  domainContext: DomainContext | undefined,
  preAnalysis: PreAnalysisResult,
  stats: DatasetInsights
): string => {
  const domain = domainContext?.domain || 'general';
  const industryContext = domainContext?.industry ? ` in ${domainContext.industry}` : '';
  
  return `Analysis performed for ${domain} domain${industryContext}. ` +
    `Data shows ${preAnalysis.trendAnalysis.primaryTrend} trends with ` +
    `${(preAnalysis.dataHealth.score * 100).toFixed(1)}% data quality score. ` +
    `${preAnalysis.anomalies.detected ? preAnalysis.anomalies.count : 0} anomalies detected requiring attention.`;
};

const calculateOverallConfidence = (
  insights: DomainAdaptedInsight[],
  predictions: BusinessPrediction[],
  preAnalysis: PreAnalysisResult
): number => {
  const dataQualityFactor = preAnalysis.dataHealth.score;
  const trendConfidenceFactor = preAnalysis.trendAnalysis.trendStrength;
  const predictionConfidenceFactor = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
    : 0.5;
  
  return Math.min(0.95, Math.max(0.1, 
    (dataQualityFactor * 0.4) + 
    (trendConfidenceFactor * 0.3) + 
    (predictionConfidenceFactor * 0.3)
  ));
};
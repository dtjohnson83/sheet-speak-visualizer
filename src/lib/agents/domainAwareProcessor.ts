import { DomainContext, DataContext } from '@/types/agents';

export interface DomainAnalysisResult {
  insights: Array<{
    insight_type: 'trend' | 'anomaly' | 'correlation' | 'recommendation' | 'summary';
    title: string;
    description: string;
    confidence_score: number;
    priority: number;
    data: any;
  }>;
  predictions: Array<{
    metric: string;
    prediction: number;
    confidence: number;
    timeframe: string;
    methodology: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    implementation: string;
    expectedImpact: number;
    timeframe: string;
  }>;
}

export function performDomainAnalysis(
  dataContext: DataContext, 
  taskType: string
): DomainAnalysisResult {
  const { data, columns, domainContext } = dataContext;
  
  if (!domainContext) {
    return performGenericAnalysis(data, columns, taskType);
  }

  switch (domainContext.domain) {
    case 'finance':
      return performFinanceAnalysis(data, columns, domainContext, taskType);
    case 'retail':
      return performRetailAnalysis(data, columns, domainContext, taskType);
    case 'manufacturing':
      return performManufacturingAnalysis(data, columns, domainContext, taskType);
    case 'healthcare':
      return performHealthcareAnalysis(data, columns, domainContext, taskType);
    default:
      return performGenericAnalysis(data, columns, taskType);
  }
}

function performFinanceAnalysis(
  data: any[], 
  columns: any[], 
  domainContext: DomainContext, 
  taskType: string
): DomainAnalysisResult {
  const insights = [];
  const predictions = [];
  const recommendations = [];

  // Find financial columns
  const revenueColumns = columns.filter(col => 
    col.name.toLowerCase().includes('revenue') || 
    col.name.toLowerCase().includes('sales') ||
    col.name.toLowerCase().includes('income')
  );

  const expenseColumns = columns.filter(col => 
    col.name.toLowerCase().includes('expense') || 
    col.name.toLowerCase().includes('cost')
  );

  // Revenue trend analysis
  if (revenueColumns.length > 0) {
    const revenueColumn = revenueColumns[0];
    const values = data.map(row => Number(row[revenueColumn.name])).filter(val => !isNaN(val));
    
    if (values.length > 2) {
      const trend = calculateTrend(values);
      const avgGrowth = ((values[values.length - 1] - values[0]) / values[0]) * 100;
      
      insights.push({
        insight_type: 'trend',
        title: `Revenue ${trend > 0 ? 'Growth' : 'Decline'} Trend`,
        description: `Revenue shows a ${trend > 0 ? 'positive' : 'negative'} trend with ${Math.abs(avgGrowth).toFixed(1)}% ${trend > 0 ? 'growth' : 'decline'} over the period.`,
        confidence_score: 0.85,
        priority: 8,
        data: { 
          column: revenueColumn.name, 
          trend_direction: trend > 0 ? 'up' : 'down',
          growth_rate: avgGrowth,
          values: values.slice(-5)
        }
      });

      // Revenue prediction
      const nextPeriodPrediction = values[values.length - 1] * (1 + (avgGrowth / 100));
      predictions.push({
        metric: 'Revenue',
        prediction: nextPeriodPrediction,
        confidence: 0.75,
        timeframe: 'Next Period',
        methodology: 'Linear Trend Extrapolation'
      });
    }
  }

  // Profitability analysis
  if (revenueColumns.length > 0 && expenseColumns.length > 0) {
    recommendations.push({
      title: 'Optimize Profit Margins',
      description: 'Based on revenue and expense trends, focus on cost optimization strategies.',
      implementation: 'Implement cost tracking and review expense categories quarterly.',
      expectedImpact: 15,
      timeframe: '3-6 months'
    });
  }

  return { insights, predictions, recommendations };
}

function performRetailAnalysis(
  data: any[], 
  columns: any[], 
  domainContext: DomainContext, 
  taskType: string
): DomainAnalysisResult {
  const insights = [];
  const predictions = [];
  const recommendations = [];

  // Find retail-specific columns
  const salesColumns = columns.filter(col => 
    col.name.toLowerCase().includes('sales') || 
    col.name.toLowerCase().includes('units') ||
    col.name.toLowerCase().includes('quantity')
  );

  const customerColumns = columns.filter(col => 
    col.name.toLowerCase().includes('customer') || 
    col.name.toLowerCase().includes('buyer')
  );

  // Sales volume analysis
  if (salesColumns.length > 0) {
    const salesColumn = salesColumns[0];
    const values = data.map(row => Number(row[salesColumn.name])).filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const seasonality = detectSeasonality(values);
      
      insights.push({
        insight_type: 'trend',
        title: `Sales ${seasonality ? 'Seasonal' : 'Linear'} Pattern`,
        description: `Sales data shows ${seasonality ? 'seasonal variations' : 'consistent patterns'} which can inform inventory and marketing decisions.`,
        confidence_score: 0.8,
        priority: 7,
        data: { 
          column: salesColumn.name, 
          pattern_type: seasonality ? 'seasonal' : 'linear',
          values: values.slice(-10)
        }
      });

      // Customer acquisition prediction
      if (customerColumns.length > 0) {
        predictions.push({
          metric: 'Customer Growth',
          prediction: values[values.length - 1] * 1.15,
          confidence: 0.7,
          timeframe: 'Next Quarter',
          methodology: 'Retail Growth Model'
        });
      }
    }
  }

  recommendations.push({
    title: 'Optimize Inventory Management',
    description: 'Implement data-driven inventory optimization based on sales patterns.',
    implementation: 'Use historical sales data to predict demand and adjust stock levels.',
    expectedImpact: 20,
    timeframe: '2-4 months'
  });

  return { insights, predictions, recommendations };
}

function performManufacturingAnalysis(
  data: any[], 
  columns: any[], 
  domainContext: DomainContext, 
  taskType: string
): DomainAnalysisResult {
  const insights = [];
  const predictions = [];
  const recommendations = [];

  // Find manufacturing-specific columns
  const productionColumns = columns.filter(col => 
    col.name.toLowerCase().includes('production') || 
    col.name.toLowerCase().includes('output') ||
    col.name.toLowerCase().includes('units')
  );

  const qualityColumns = columns.filter(col => 
    col.name.toLowerCase().includes('quality') || 
    col.name.toLowerCase().includes('defect') ||
    col.name.toLowerCase().includes('error')
  );

  // Production efficiency analysis
  if (productionColumns.length > 0) {
    const prodColumn = productionColumns[0];
    const values = data.map(row => Number(row[prodColumn.name])).filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const efficiency = calculateEfficiency(values);
      
      insights.push({
        insight_type: 'summary',
        title: `Production Efficiency Analysis`,
        description: `Current production efficiency is ${efficiency.toFixed(1)}% with potential for optimization.`,
        confidence_score: 0.82,
        priority: 6,
        data: { 
          column: prodColumn.name, 
          efficiency_score: efficiency,
          optimization_potential: Math.max(0, 90 - efficiency)
        }
      });

      predictions.push({
        metric: 'Production Output',
        prediction: values[values.length - 1] * 1.08,
        confidence: 0.78,
        timeframe: 'Next Month',
        methodology: 'Manufacturing Efficiency Model'
      });
    }
  }

  recommendations.push({
    title: 'Implement Predictive Maintenance',
    description: 'Use data patterns to predict equipment maintenance needs and reduce downtime.',
    implementation: 'Monitor equipment performance metrics and schedule proactive maintenance.',
    expectedImpact: 25,
    timeframe: '6-12 months'
  });

  return { insights, predictions, recommendations };
}

function performHealthcareAnalysis(
  data: any[], 
  columns: any[], 
  domainContext: DomainContext, 
  taskType: string
): DomainAnalysisResult {
  const insights = [];
  const predictions = [];
  const recommendations = [];

  // Find healthcare-specific columns
  const patientColumns = columns.filter(col => 
    col.name.toLowerCase().includes('patient') || 
    col.name.toLowerCase().includes('admission') ||
    col.name.toLowerCase().includes('visit')
  );

  const outcomeColumns = columns.filter(col => 
    col.name.toLowerCase().includes('outcome') || 
    col.name.toLowerCase().includes('satisfaction') ||
    col.name.toLowerCase().includes('recovery')
  );

  // Patient flow analysis
  if (patientColumns.length > 0) {
    const patientColumn = patientColumns[0];
    const values = data.map(row => Number(row[patientColumn.name])).filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const capacity = analyzeCapacity(values);
      
      insights.push({
        insight_type: 'summary',
        title: `Patient Flow Analysis`,
        description: `Current patient volume is at ${capacity.utilization.toFixed(1)}% of optimal capacity.`,
        confidence_score: 0.85,
        priority: 7,
        data: { 
          column: patientColumn.name, 
          utilization: capacity.utilization,
          peak_periods: capacity.peaks
        }
      });

      predictions.push({
        metric: 'Patient Volume',
        prediction: capacity.predicted_volume,
        confidence: 0.8,
        timeframe: 'Next Week',
        methodology: 'Healthcare Flow Model'
      });
    }
  }

  recommendations.push({
    title: 'Optimize Resource Allocation',
    description: 'Use patient flow data to optimize staff scheduling and resource allocation.',
    implementation: 'Implement dynamic scheduling based on predicted patient volumes.',
    expectedImpact: 18,
    timeframe: '3-6 months'
  });

  return { insights, predictions, recommendations };
}

function performGenericAnalysis(
  data: any[], 
  columns: any[], 
  taskType: string
): DomainAnalysisResult {
  const insights = [];
  const predictions = [];
  const recommendations = [];

  // Generic statistical analysis
  const numericColumns = columns.filter(col => col.type === 'numeric');
  
  if (numericColumns.length > 0) {
    const column = numericColumns[0];
    const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const stats = calculateBasicStats(values);
      
      insights.push({
        insight_type: 'summary',
        title: `Data Analysis Summary`,
        description: `Analyzed ${values.length} data points with average value of ${stats.mean.toFixed(2)} and ${stats.variability} variability.`,
        confidence_score: 0.9,
        priority: 5,
        data: { 
          column: column.name, 
          statistics: stats
        }
      });

      predictions.push({
        metric: column.name,
        prediction: stats.mean * 1.05,
        confidence: 0.6,
        timeframe: 'Next Period',
        methodology: 'Basic Statistical Model'
      });
    }
  }

  recommendations.push({
    title: 'Implement Data Governance',
    description: 'Establish data quality standards and monitoring processes.',
    implementation: 'Create data quality dashboards and regular review processes.',
    expectedImpact: 10,
    timeframe: '3-6 months'
  });

  return { insights, predictions, recommendations };
}

// Utility functions
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  return secondAvg - firstAvg;
}

function detectSeasonality(values: number[]): boolean {
  // Simple seasonality detection - look for repeating patterns
  if (values.length < 12) return false;
  const quarters = Math.floor(values.length / 4);
  let seasonalScore = 0;
  
  for (let i = 0; i < quarters; i++) {
    const quarterValues = values.slice(i * 4, (i + 1) * 4);
    const avgQuarter = quarterValues.reduce((sum, val) => sum + val, 0) / quarterValues.length;
    const overallAvg = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (Math.abs(avgQuarter - overallAvg) > overallAvg * 0.1) {
      seasonalScore++;
    }
  }
  
  return seasonalScore > quarters * 0.5;
}

function calculateEfficiency(values: number[]): number {
  if (values.length === 0) return 0;
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  return (avg / max) * 100;
}

function analyzeCapacity(values: number[]): { utilization: number; peaks: number[]; predicted_volume: number } {
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const utilization = (avg / max) * 100;
  
  // Find peak periods (values above 80% of max)
  const threshold = max * 0.8;
  const peaks = values.map((val, idx) => val > threshold ? idx : -1).filter(idx => idx !== -1);
  
  // Simple prediction based on recent trend
  const recentAvg = values.slice(-5).reduce((sum, val) => sum + val, 0) / Math.min(5, values.length);
  const predicted_volume = recentAvg * 1.1;
  
  return { utilization, peaks, predicted_volume };
}

function calculateBasicStats(values: number[]): { mean: number; std: number; variability: string } {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  const coefficient = std / mean;
  
  let variability = 'low';
  if (coefficient > 0.3) variability = 'high';
  else if (coefficient > 0.15) variability = 'medium';
  
  return { mean, std, variability };
}
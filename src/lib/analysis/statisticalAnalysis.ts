export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'insufficient_data';
  slope: number;
  confidence: number;
  correlation: number;
  seasonality: boolean;
  changeRate: number;
  volatility: number;
  outliers: number[];
  pattern: 'linear' | 'exponential' | 'cyclical' | 'irregular';
}

export interface ColumnStatistics {
  name: string;
  type: string;
  trend: TrendAnalysis;
  correlation: Map<string, number>;
  businessMetrics: {
    criticality: 'high' | 'medium' | 'low';
    healthScore: number;
    riskLevel: 'critical' | 'warning' | 'good';
    impactArea: string[];
  };
}

export interface DatasetInsights {
  overallTrend: TrendAnalysis;
  keyColumns: ColumnStatistics[];
  correlationMatrix: Map<string, Map<string, number>>;
  businessHealth: {
    score: number;
    criticalIssues: string[];
    opportunities: string[];
    recommendations: string[];
  };
  dataQuality: {
    completeness: number;
    consistency: number;
    accuracy: number;
    timeliness: number;
  };
  confidenceLevel: number;
}

export const analyzeTrend = (values: number[], timeColumn?: any[]): TrendAnalysis => {
  if (!values || values.length < 3) {
    return {
      direction: 'insufficient_data',
      slope: 0,
      confidence: 0,
      correlation: 0,
      seasonality: false,
      changeRate: 0,
      volatility: 0,
      outliers: [],
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
      seasonality: false,
      changeRate: 0,
      volatility: 0,
      outliers: [],
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

  // Calculate volatility
  const differences = validValues.slice(1).map((val, i) => Math.abs(val - validValues[i]));
  const volatility = differences.length > 0 ? 
    differences.reduce((sum, diff) => sum + diff, 0) / differences.length : 0;

  // Detect outliers using IQR method
  const sorted = [...validValues].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const outlierThreshold = 1.5 * iqr;
  const outliers = validValues
    .map((val, idx) => ({ val, idx }))
    .filter(({ val }) => val < q1 - outlierThreshold || val > q3 + outlierThreshold)
    .map(({ idx }) => idx);

  // Determine direction based on slope and confidence
  let direction: TrendAnalysis['direction'];
  const changeRate = validValues.length > 1 ? 
    Math.abs((validValues[validValues.length - 1] - validValues[0]) / validValues[0] * 100) : 0;

  if (correlation < 0.3) {
    direction = volatility > yMean * 0.2 ? 'volatile' : 'stable';
  } else if (slope > 0) {
    direction = 'increasing';
  } else if (slope < 0) {
    direction = 'decreasing';
  } else {
    direction = 'stable';
  }

  // Detect seasonality (simplified)
  const seasonality = detectSeasonality(validValues);

  // Determine pattern
  let pattern: TrendAnalysis['pattern'] = 'linear';
  if (seasonality) pattern = 'cyclical';
  else if (correlation < 0.5) pattern = 'irregular';
  else if (Math.abs(slope) > yMean * 0.1) pattern = 'exponential';

  // Calculate confidence based on correlation, sample size, and data quality
  const sampleSizeScore = Math.min(n / 50, 1); // Prefer 50+ data points
  const correlationScore = correlation;
  const completenessScore = validValues.length / values.length;
  const confidence = (sampleSizeScore + correlationScore + completenessScore) / 3;

  return {
    direction,
    slope,
    confidence,
    correlation,
    seasonality,
    changeRate,
    volatility,
    outliers,
    pattern
  };
};

const detectSeasonality = (values: number[]): boolean => {
  if (values.length < 12) return false;
  
  // Simple seasonality detection using autocorrelation
  const periods = [7, 12, 24, 30]; // Common seasonal periods
  
  for (const period of periods) {
    if (values.length >= period * 2) {
      const autocorr = calculateAutocorrelation(values, period);
      if (autocorr > 0.6) return true;
    }
  }
  
  return false;
};

const calculateAutocorrelation = (values: number[], lag: number): number => {
  if (values.length <= lag) return 0;
  
  const n = values.length - lag;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (values[i] - mean) * (values[i + lag] - mean);
  }
  
  for (let i = 0; i < values.length; i++) {
    denominator += Math.pow(values[i] - mean, 2);
  }
  
  return denominator !== 0 ? numerator / denominator : 0;
};

export const calculateCorrelationMatrix = (columns: Array<{ name: string; values: any[] }>): Map<string, Map<string, number>> => {
  const matrix = new Map<string, Map<string, number>>();
  
  const numericColumns = columns.filter(col => {
    const validValues = col.values.filter(v => v !== null && v !== undefined && !isNaN(Number(v)));
    return validValues.length > 0;
  });

  for (const col1 of numericColumns) {
    const correlations = new Map<string, number>();
    
    for (const col2 of numericColumns) {
      if (col1.name === col2.name) {
        correlations.set(col2.name, 1);
        continue;
      }
      
      const correlation = calculatePearsonCorrelation(
        col1.values.map(v => Number(v)).filter(v => !isNaN(v)),
        col2.values.map(v => Number(v)).filter(v => !isNaN(v))
      );
      
      correlations.set(col2.name, correlation);
    }
    
    matrix.set(col1.name, correlations);
  }
  
  return matrix;
};

const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let xVariance = 0;
  let yVariance = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    
    numerator += xDiff * yDiff;
    xVariance += xDiff * xDiff;
    yVariance += yDiff * yDiff;
  }
  
  const denominator = Math.sqrt(xVariance * yVariance);
  return denominator !== 0 ? numerator / denominator : 0;
};

export const analyzeDatasetInsights = (data: any[], columns: Array<{ name: string; type: string; values: any[] }>): DatasetInsights => {
  const correlationMatrix = calculateCorrelationMatrix(columns);
  
  // Analyze individual columns
  const keyColumns: ColumnStatistics[] = columns.map(col => {
    const numericValues = col.values
      .map(v => Number(v))
      .filter(v => !isNaN(v));
    
    const trend = analyzeTrend(numericValues);
    const correlations = correlationMatrix.get(col.name) || new Map();
    
    // Determine business criticality
    const criticality = determineCriticality(col, trend, correlations);
    const healthScore = calculateColumnHealthScore(col, trend);
    const riskLevel = determineRiskLevel(trend, healthScore);
    const impactArea = determineImpactArea(col.name, trend);
    
    return {
      name: col.name,
      type: col.type,
      trend,
      correlation: correlations,
      businessMetrics: {
        criticality,
        healthScore,
        riskLevel,
        impactArea
      }
    };
  });

  // Calculate overall dataset trend
  const allNumericTrends = keyColumns
    .filter(col => col.trend.direction !== 'insufficient_data')
    .map(col => col.trend);
  
  const overallTrend = calculateOverallTrend(allNumericTrends);
  
  // Calculate business health
  const businessHealth = calculateBusinessHealth(keyColumns, correlationMatrix);
  
  // Calculate data quality metrics
  const dataQuality = calculateDataQuality(columns);
  
  // Calculate overall confidence
  const confidenceLevel = calculateOverallConfidence(keyColumns, dataQuality);

  return {
    overallTrend,
    keyColumns,
    correlationMatrix,
    businessHealth,
    dataQuality,
    confidenceLevel
  };
};

const determineCriticality = (column: any, trend: TrendAnalysis, correlations: Map<string, number>): 'high' | 'medium' | 'low' => {
  const name = column.name.toLowerCase();
  
  // High criticality indicators
  if (name.includes('revenue') || name.includes('profit') || name.includes('sales') || 
      name.includes('cost') || name.includes('customer') || name.includes('user')) {
    return 'high';
  }
  
  // Check correlation strength with other columns
  const maxCorrelation = Math.max(...Array.from(correlations.values()).map(Math.abs));
  if (maxCorrelation > 0.7) return 'high';
  if (maxCorrelation > 0.4) return 'medium';
  
  return 'low';
};

const calculateColumnHealthScore = (column: any, trend: TrendAnalysis): number => {
  let score = 0.5; // Base score
  
  // Trend contribution
  switch (trend.direction) {
    case 'increasing':
      score += 0.3;
      break;
    case 'stable':
      score += 0.1;
      break;
    case 'decreasing':
      score -= 0.3;
      break;
    case 'volatile':
      score -= 0.2;
      break;
  }
  
  // Confidence contribution
  score += trend.confidence * 0.2;
  
  // Volatility penalty
  score -= Math.min(trend.volatility / 100, 0.2);
  
  return Math.max(0, Math.min(1, score));
};

const determineRiskLevel = (trend: TrendAnalysis, healthScore: number): 'critical' | 'warning' | 'good' => {
  if (healthScore < 0.3 || trend.direction === 'decreasing') return 'critical';
  if (healthScore < 0.6 || trend.direction === 'volatile') return 'warning';
  return 'good';
};

const determineImpactArea = (columnName: string, trend: TrendAnalysis): string[] => {
  const name = columnName.toLowerCase();
  const areas: string[] = [];
  
  if (name.includes('revenue') || name.includes('sales')) areas.push('Revenue');
  if (name.includes('cost') || name.includes('expense')) areas.push('Cost Management');
  if (name.includes('customer') || name.includes('user')) areas.push('Customer Success');
  if (name.includes('product') || name.includes('inventory')) areas.push('Operations');
  if (name.includes('employee') || name.includes('staff')) areas.push('Human Resources');
  
  if (areas.length === 0) areas.push('General Performance');
  
  return areas;
};

const calculateOverallTrend = (trends: TrendAnalysis[]): TrendAnalysis => {
  if (trends.length === 0) {
    return {
      direction: 'insufficient_data',
      slope: 0,
      confidence: 0,
      correlation: 0,
      seasonality: false,
      changeRate: 0,
      volatility: 0,
      outliers: [],
      pattern: 'irregular'
    };
  }
  
  const avgSlope = trends.reduce((sum, t) => sum + t.slope, 0) / trends.length;
  const avgConfidence = trends.reduce((sum, t) => sum + t.confidence, 0) / trends.length;
  const avgCorrelation = trends.reduce((sum, t) => sum + t.correlation, 0) / trends.length;
  const avgVolatility = trends.reduce((sum, t) => sum + t.volatility, 0) / trends.length;
  const avgChangeRate = trends.reduce((sum, t) => sum + t.changeRate, 0) / trends.length;
  
  // Determine overall direction
  const directions = trends.map(t => t.direction);
  const directionCounts = directions.reduce((acc, dir) => {
    acc[dir] = (acc[dir] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonDirection = Object.entries(directionCounts)
    .sort(([,a], [,b]) => b - a)[0][0] as TrendAnalysis['direction'];
  
  return {
    direction: mostCommonDirection,
    slope: avgSlope,
    confidence: avgConfidence,
    correlation: avgCorrelation,
    seasonality: trends.some(t => t.seasonality),
    changeRate: avgChangeRate,
    volatility: avgVolatility,
    outliers: [],
    pattern: avgConfidence > 0.7 ? 'linear' : 'irregular'
  };
};

const calculateBusinessHealth = (columns: ColumnStatistics[], correlationMatrix: Map<string, Map<string, number>>) => {
  const healthScores = columns.map(col => col.businessMetrics.healthScore);
  const avgHealthScore = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  
  const criticalIssues: string[] = [];
  const opportunities: string[] = [];
  const recommendations: string[] = [];
  
  columns.forEach(col => {
    if (col.businessMetrics.riskLevel === 'critical') {
      criticalIssues.push(`${col.name}: ${col.trend.direction} trend with ${(col.trend.confidence * 100).toFixed(0)}% confidence`);
      recommendations.push(`Immediate attention needed for ${col.name} - implement stabilization measures`);
    }
    
    if (col.trend.direction === 'increasing' && col.businessMetrics.criticality === 'high') {
      opportunities.push(`${col.name} showing positive ${col.trend.direction} trend - potential for scaling`);
    }
  });
  
  return {
    score: avgHealthScore,
    criticalIssues,
    opportunities,
    recommendations
  };
};

const calculateDataQuality = (columns: Array<{ name: string; values: any[] }>) => {
  const totalCells = columns.reduce((sum, col) => sum + col.values.length, 0);
  const nonNullCells = columns.reduce((sum, col) => {
    return sum + col.values.filter(v => v !== null && v !== undefined && v !== '').length;
  }, 0);
  
  const completeness = totalCells > 0 ? nonNullCells / totalCells : 0;
  
  return {
    completeness,
    consistency: completeness * 0.9, // Simplified
    accuracy: completeness * 0.95, // Simplified
    timeliness: 0.8 // Simplified
  };
};

const calculateOverallConfidence = (columns: ColumnStatistics[], dataQuality: any): number => {
  const avgTrendConfidence = columns.reduce((sum, col) => sum + col.trend.confidence, 0) / columns.length;
  const dataQualityScore = (dataQuality.completeness + dataQuality.consistency + dataQuality.accuracy) / 3;
  const sampleSizeScore = Math.min(columns.length / 10, 1);
  
  return (avgTrendConfidence + dataQualityScore + sampleSizeScore) / 3;
};
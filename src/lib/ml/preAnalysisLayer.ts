// Pre-Analysis Layer for Data Assessment and Pattern Detection
import { DataRow, ColumnInfo } from '@/pages/Index';
import { detectAnomalies } from './anomalyDetection';
import { analyzeDatasetInsights, TrendAnalysis, DatasetInsights } from '../analysis/statisticalAnalysis';

export interface PreAnalysisResult {
  dataHealth: {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    issues: string[];
    recommendations: string[];
  };
  trendAnalysis: {
    primaryTrend: 'strong_positive' | 'weak_positive' | 'stable' | 'weak_negative' | 'strong_negative';
    trendStrength: number;
    volatility: number;
    seasonality: number;
  };
  anomalies: {
    detected: boolean;
    count: number;
    severity: 'low' | 'medium' | 'high';
    affectedColumns: string[];
  };
  predictiveReadiness: {
    score: number;
    approach: 'advanced' | 'moderate' | 'conservative' | 'basic';
    confidence: number;
    limitations: string[];
  };
  baselineMetrics: Record<string, number>;
  datasetInsights: DatasetInsights;
}

export class PreAnalysisEngine {
  static async analyzeDataset(data: DataRow[], columns: ColumnInfo[]): Promise<PreAnalysisResult> {
    console.log('=== Pre-Analysis Layer Starting ===');
    
    // Step 1: Basic data health assessment
    const dataHealth = this.assessDataHealth(data, columns);
    
    // Step 2: Comprehensive statistical analysis
    const datasetInsights = this.generateDatasetInsights(data, columns);
    
    // Step 3: Trend analysis across key metrics
    const trendAnalysis = this.analyzePrimaryTrends(data, columns);
    
    // Step 4: Anomaly detection
    const anomalies = this.detectDataAnomalies(data, columns);
    
    // Step 5: Determine predictive approach
    const predictiveReadiness = this.assessPredictiveReadiness(
      dataHealth, 
      trendAnalysis, 
      anomalies, 
      data.length
    );
    
    // Step 6: Calculate baseline metrics
    const baselineMetrics = this.calculateBaselineMetrics(data, columns);
    
    console.log('Pre-Analysis Results:', {
      dataHealth: dataHealth.status,
      primaryTrend: trendAnalysis.primaryTrend,
      anomaliesDetected: anomalies.detected,
      predictiveApproach: predictiveReadiness.approach
    });
    
    return {
      dataHealth,
      trendAnalysis,
      anomalies,
      predictiveReadiness,
      baselineMetrics,
      datasetInsights
    };
  }

  private static assessDataHealth(data: DataRow[], columns: ColumnInfo[]) {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 1.0;

    // Check data size
    if (data.length < 30) {
      issues.push(`Small dataset (${data.length} rows)`);
      recommendations.push('Collect more data for better predictions');
      score -= 0.3;
    }

    // Check column diversity
    const numericColumns = columns.filter(col => col.type === 'numeric');
    if (numericColumns.length < 2) {
      issues.push('Limited numeric columns for analysis');
      recommendations.push('Add more quantitative metrics');
      score -= 0.2;
    }

    // Check data completeness
    let totalMissing = 0;
    let totalCells = 0;

    numericColumns.forEach(column => {
      const values = data.map(row => row[column.name]);
      const missing = values.filter(val => val === null || val === undefined || val === '').length;
      totalMissing += missing;
      totalCells += values.length;

      const missingPercentage = (missing / values.length) * 100;
      if (missingPercentage > 30) {
        issues.push(`High missing values in ${column.name} (${missingPercentage.toFixed(1)}%)`);
        recommendations.push(`Clean or impute missing values in ${column.name}`);
        score -= 0.15;
      }
    });

    const completeness = totalCells > 0 ? 1 - (totalMissing / totalCells) : 0;
    if (completeness < 0.8) {
      score -= 0.2;
    }

    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (score >= 0.9) status = 'excellent';
    else if (score >= 0.7) status = 'good';
    else if (score >= 0.5) status = 'fair';
    else if (score >= 0.3) status = 'poor';
    else status = 'critical';

    return {
      score: Math.max(0, score),
      status,
      issues,
      recommendations
    };
  }

  private static generateDatasetInsights(data: DataRow[], columns: ColumnInfo[]): DatasetInsights {
    // Convert to format expected by analyzeDatasetInsights
    const processedColumns = columns
      .filter(col => col.type === 'numeric')
      .map(col => ({
        name: col.name,
        type: col.type,
        values: data.map(row => row[col.name]).filter(val => val !== null && val !== undefined)
      }));

    return analyzeDatasetInsights(data, processedColumns);
  }

  private static analyzePrimaryTrends(data: DataRow[], columns: ColumnInfo[]) {
    const numericColumns = columns.filter(col => col.type === 'numeric');
    let totalTrendStrength = 0;
    let totalVolatility = 0;
    let trendCount = 0;

    numericColumns.forEach(column => {
      const values = data
        .map(row => Number(row[column.name]))
        .filter(val => !isNaN(val));

      if (values.length >= 5) {
        // Calculate trend strength using linear regression
        const n = values.length;
        const xMean = (n - 1) / 2;
        const yMean = values.reduce((a, b) => a + b, 0) / n;
        
        let numerator = 0;
        let denominator = 0;
        
        values.forEach((y, x) => {
          numerator += (x - xMean) * (y - yMean);
          denominator += Math.pow(x - xMean, 2);
        });
        
        const slope = denominator !== 0 ? numerator / denominator : 0;
        const trendStrength = Math.abs(slope) / (yMean || 1);
        
        // Calculate volatility (coefficient of variation)
        const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / n);
        const volatility = yMean !== 0 ? stdDev / Math.abs(yMean) : 0;
        
        totalTrendStrength += trendStrength;
        totalVolatility += volatility;
        trendCount++;
      }
    });

    const avgTrendStrength = trendCount > 0 ? totalTrendStrength / trendCount : 0;
    const avgVolatility = trendCount > 0 ? totalVolatility / trendCount : 0;

    // Determine primary trend
    let primaryTrend: 'strong_positive' | 'weak_positive' | 'stable' | 'weak_negative' | 'strong_negative';
    
    if (avgTrendStrength > 0.2) {
      primaryTrend = avgTrendStrength > 0 ? 'strong_positive' : 'strong_negative';
    } else if (avgTrendStrength > 0.1) {
      primaryTrend = avgTrendStrength > 0 ? 'weak_positive' : 'weak_negative';
    } else {
      primaryTrend = 'stable';
    }

    // Estimate seasonality (simplified)
    const seasonality = Math.min(0.5, avgVolatility * 0.5);

    return {
      primaryTrend,
      trendStrength: avgTrendStrength,
      volatility: avgVolatility,
      seasonality
    };
  }

  private static detectDataAnomalies(data: DataRow[], columns: ColumnInfo[]) {
    const numericColumns = columns.filter(col => col.type === 'numeric');
    let totalAnomalies = 0;
    const affectedColumns: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' = 'low';

    numericColumns.forEach(column => {
      const values = data
        .map(row => Number(row[column.name]))
        .filter(val => !isNaN(val));

      if (values.length >= 10) {
        const { anomalies } = detectAnomalies(values);
        
        if (anomalies.length > 0) {
          totalAnomalies += anomalies.length;
          affectedColumns.push(column.name);
          
          const anomalyPercentage = (anomalies.length / values.length) * 100;
          if (anomalyPercentage > 15) {
            maxSeverity = 'high';
          } else if (anomalyPercentage > 5 && maxSeverity !== 'high') {
            maxSeverity = 'medium';
          }
        }
      }
    });

    return {
      detected: totalAnomalies > 0,
      count: totalAnomalies,
      severity: maxSeverity,
      affectedColumns
    };
  }

  private static assessPredictiveReadiness(
    dataHealth: any,
    trendAnalysis: any,
    anomalies: any,
    sampleSize: number
  ) {
    let score = 0.5; // Start with base score
    const limitations: string[] = [];

    // Data health factor
    score += dataHealth.score * 0.3;
    if (dataHealth.status === 'critical' || dataHealth.status === 'poor') {
      limitations.push('Poor data quality limits prediction accuracy');
    }

    // Sample size factor
    if (sampleSize >= 100) {
      score += 0.2;
    } else if (sampleSize >= 50) {
      score += 0.1;
    } else {
      limitations.push('Small sample size reduces prediction reliability');
    }

    // Trend clarity factor
    if (trendAnalysis.trendStrength > 0.15) {
      score += 0.2;
    } else if (trendAnalysis.trendStrength < 0.05) {
      limitations.push('Weak trends make forecasting challenging');
    }

    // Volatility factor
    if (trendAnalysis.volatility > 0.5) {
      score -= 0.1;
      limitations.push('High volatility increases prediction uncertainty');
    }

    // Anomaly factor
    if (anomalies.severity === 'high') {
      score -= 0.2;
      limitations.push('High anomaly rate affects model stability');
    } else if (anomalies.severity === 'medium') {
      score -= 0.1;
    }

    // Determine approach
    let approach: 'advanced' | 'moderate' | 'conservative' | 'basic';
    if (score >= 0.8) approach = 'advanced';
    else if (score >= 0.6) approach = 'moderate';
    else if (score >= 0.4) approach = 'conservative';
    else approach = 'basic';

    const confidence = Math.max(0.2, Math.min(0.9, score));

    return {
      score: Math.max(0, score),
      approach,
      confidence,
      limitations
    };
  }

  private static calculateBaselineMetrics(data: DataRow[], columns: ColumnInfo[]): Record<string, number> {
    const metrics: Record<string, number> = {};

    const numericColumns = columns.filter(col => col.type === 'numeric');
    
    numericColumns.forEach(column => {
      const values = data
        .map(row => Number(row[column.name]))
        .filter(val => !isNaN(val));

      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        metrics[`${column.name}_mean`] = mean;
        metrics[`${column.name}_std`] = stdDev;
        metrics[`${column.name}_min`] = Math.min(...values);
        metrics[`${column.name}_max`] = Math.max(...values);
        metrics[`${column.name}_cv`] = mean !== 0 ? stdDev / Math.abs(mean) : 0;
      }
    });

    metrics.data_completeness = this.calculateCompleteness(data, columns);
    metrics.data_size = data.length;
    metrics.numeric_columns = numericColumns.length;

    return metrics;
  }

  private static calculateCompleteness(data: DataRow[], columns: ColumnInfo[]): number {
    let totalCells = 0;
    let validCells = 0;

    columns.forEach(column => {
      data.forEach(row => {
        totalCells++;
        if (row[column.name] !== null && row[column.name] !== undefined && row[column.name] !== '') {
          validCells++;
        }
      });
    });

    return totalCells > 0 ? validCells / totalCells : 0;
  }
}
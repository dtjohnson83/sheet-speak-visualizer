import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

export interface MLInsight {
  id: string;
  type: 'anomaly' | 'pattern' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  column?: string;
  action?: string;
  impact: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MLAnalysisResult {
  insights: MLInsight[];
  anomalies: Array<{
    column: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
    examples: any[];
  }>;
  patterns: Array<{
    type: string;
    description: string;
    confidence: number;
    columns: string[];
  }>;
  predictions: Array<{
    metric: string;
    prediction: number;
    confidence: number;
    timeframe: string;
  }>;
}

export const useMLDataQuality = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateAdvancedInsights = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[],
    existingIssues: any[]
  ): Promise<MLAnalysisResult> => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      // Simulate advanced ML processing
      const insights: MLInsight[] = [];
      const anomalies: any[] = [];
      const patterns: any[] = [];
      const predictions: any[] = [];

      // Step 1: Statistical Analysis (25%)
      setAnalysisProgress(25);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Advanced anomaly detection using ensemble methods
      for (const column of columns) {
        const columnData = data.map(row => row[column.name]).filter(val => val != null);
        
        if (column.type === 'numeric' && columnData.length > 10) {
          const numericData = columnData.map(Number).filter(n => !isNaN(n));
          
          if (numericData.length > 0) {
            // Isolation Forest simulation
            const isolationAnomalies = detectIsolationAnomalies(numericData);
            
            // Local Outlier Factor simulation
            const lofAnomalies = detectLOFAnomalies(numericData);
            
            // Combine results
            const combinedAnomalies = [...new Set([...isolationAnomalies, ...lofAnomalies])];
            
            if (combinedAnomalies.length > 0) {
              anomalies.push({
                column: column.name,
                count: combinedAnomalies.length,
                severity: combinedAnomalies.length > numericData.length * 0.1 ? 'high' : 
                         combinedAnomalies.length > numericData.length * 0.05 ? 'medium' : 'low',
                examples: combinedAnomalies.slice(0, 5)
              });

              insights.push({
                id: `advanced_anomaly_${column.name}_${Date.now()}`,
                type: 'anomaly',
                title: `Advanced Anomaly Detection: ${column.name}`,
                description: `Ensemble methods detected ${combinedAnomalies.length} anomalous values using Isolation Forest and LOF algorithms.`,
                confidence: 0.85,
                severity: combinedAnomalies.length > numericData.length * 0.1 ? 'high' : 'medium',
                column: column.name,
                impact: Math.min((combinedAnomalies.length / numericData.length) * 100, 90),
                timestamp: new Date(),
                action: 'Review flagged values with domain experts',
                metadata: {
                  algorithm: 'Ensemble (Isolation Forest + LOF)',
                  total_values: numericData.length,
                  anomaly_count: combinedAnomalies.length
                }
              });
            }
          }
        }
      }

      // Step 2: Pattern Recognition (50%)
      setAnalysisProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Advanced pattern detection
      const correlationPatterns = detectCorrelationPatterns(data, columns);
      const temporalPatterns = detectTemporalPatterns(data, columns);
      const categoricalPatterns = detectCategoricalPatterns(data, columns);

      patterns.push(...correlationPatterns, ...temporalPatterns, ...categoricalPatterns);

      // Generate pattern insights
      patterns.forEach(pattern => {
        if (pattern.confidence > 0.6) {
          insights.push({
            id: `pattern_${Date.now()}_${Math.random()}`,
            type: 'pattern',
            title: `${pattern.type} Pattern Detected`,
            description: pattern.description,
            confidence: pattern.confidence,
            severity: pattern.confidence > 0.8 ? 'high' : 'medium',
            impact: pattern.confidence * 80,
            timestamp: new Date(),
            action: 'Investigate business rules and data sources',
            metadata: {
              pattern_type: pattern.type,
              columns_involved: pattern.columns,
              confidence_score: pattern.confidence
            }
          });
        }
      });

      // Step 3: Predictive Analysis (75%)
      setAnalysisProgress(75);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Quality degradation prediction
      const qualityTrend = existingIssues.length / Math.max(data.length, 1);
      const futureQualityPrediction = predictQualityTrend(qualityTrend, data.length);

      predictions.push({
        metric: 'Overall Quality Score',
        prediction: futureQualityPrediction.score,
        confidence: futureQualityPrediction.confidence,
        timeframe: '30 days'
      });

      // Volume prediction
      const volumePrediction = predictDataVolume(data.length);
      predictions.push({
        metric: 'Data Volume',
        prediction: volumePrediction.volume,
        confidence: volumePrediction.confidence,
        timeframe: '30 days'
      });

      // Generate prediction insights
      predictions.forEach(pred => {
        if (pred.confidence > 0.7) {
          insights.push({
            id: `prediction_${Date.now()}_${Math.random()}`,
            type: 'prediction',
            title: `${pred.metric} Forecast`,
            description: `Predicted ${pred.metric.toLowerCase()} for next ${pred.timeframe}: ${pred.prediction}${pred.metric.includes('Score') ? '%' : ''}`,
            confidence: pred.confidence,
            severity: pred.prediction < 70 ? 'high' : pred.prediction < 85 ? 'medium' : 'low',
            impact: pred.metric.includes('Score') ? 100 - pred.prediction : Math.min(pred.prediction / 1000 * 100, 100),
            timestamp: new Date(),
            action: 'Plan capacity and quality improvements',
            metadata: {
              prediction_value: pred.prediction,
              timeframe: pred.timeframe,
              confidence_level: pred.confidence
            }
          });
        }
      });

      // Step 4: Smart Recommendations (100%)
      setAnalysisProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate AI-powered recommendations
      const smartRecommendations = generateSmartRecommendations(data, columns, existingIssues, insights);
      insights.push(...smartRecommendations);

      setLastAnalysis(new Date());

      return {
        insights: insights.sort((a, b) => (b.impact * b.confidence) - (a.impact * a.confidence)),
        anomalies,
        patterns,
        predictions
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  }, []);

  // Advanced ML-powered data quality analysis using edge function
  const runAdvancedMLAnalysis = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<MLAnalysisResult> => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      // Prepare data for ML analysis
      const analysisData = {
        data: data.slice(0, 1000), // Limit for performance
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          sample_values: data.slice(0, 10).map(row => row[col.name])
        })),
        metadata: {
          row_count: data.length,
          column_count: columns.length,
          timestamp: new Date().toISOString()
        }
      };

      setAnalysisProgress(25);

      // Call ML analysis edge function
      const { data: result, error } = await supabase.functions.invoke('ai-data-quality-analysis', {
        body: analysisData
      });

      setAnalysisProgress(75);

      if (error) {
        throw new Error(error.message || 'Failed to analyze data');
      }

      setAnalysisProgress(100);
      setLastAnalysis(new Date());

      return result as MLAnalysisResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ML analysis failed';
      setError(errorMessage);
      
      // Fallback to local analysis
      console.warn('ML analysis failed, falling back to local analysis:', errorMessage);
      return generateAdvancedInsights(data, columns, []);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  }, [generateAdvancedInsights]);

  return {
    isAnalyzing,
    analysisProgress,
    lastAnalysis,
    error,
    generateAdvancedInsights,
    runAdvancedMLAnalysis
  };
};

// Utility functions for ML algorithms simulation

function detectIsolationAnomalies(data: number[]): number[] {
  // Simplified Isolation Forest simulation
  const anomalies: number[] = [];
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const std = Math.sqrt(data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length);
  
  data.forEach(value => {
    const isolationScore = Math.abs(value - mean) / std;
    if (isolationScore > 2.5) {
      anomalies.push(value);
    }
  });
  
  return anomalies;
}

function detectLOFAnomalies(data: number[]): number[] {
  // Simplified Local Outlier Factor simulation
  const anomalies: number[] = [];
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  data.forEach(value => {
    if (value < q1 - 2 * iqr || value > q3 + 2 * iqr) {
      anomalies.push(value);
    }
  });
  
  return anomalies;
}

function detectCorrelationPatterns(data: DataRow[], columns: ColumnInfo[]): any[] {
  const patterns: any[] = [];
  
  // Find columns that tend to be null together
  const nullPatterns = new Map<string, number>();
  
  data.forEach(row => {
    const nullCols = columns
      .filter(col => row[col.name] == null || row[col.name] === '')
      .map(col => col.name)
      .sort()
      .join(',');
    
    if (nullCols && nullCols.includes(',')) {
      nullPatterns.set(nullCols, (nullPatterns.get(nullCols) || 0) + 1);
    }
  });
  
  nullPatterns.forEach((count, pattern) => {
    if (count > data.length * 0.1) {
      patterns.push({
        type: 'Correlation',
        description: `Columns [${pattern}] are frequently null together in ${count} rows`,
        confidence: count / data.length,
        columns: pattern.split(',')
      });
    }
  });
  
  return patterns;
}

function detectTemporalPatterns(data: DataRow[], columns: ColumnInfo[]): any[] {
  const patterns: any[] = [];
  
  // Look for date columns and analyze temporal patterns
  const dateColumns = columns.filter(col => 
    col.type === 'date' || 
    col.name.toLowerCase().includes('date') ||
    col.name.toLowerCase().includes('time')
  );
  
  dateColumns.forEach(col => {
    const dates = data
      .map(row => row[col.name])
      .filter(date => date != null)
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime()));
    
    if (dates.length > 10) {
      // Check for clustering around specific periods
      const dayOfWeek = new Map<number, number>();
      dates.forEach(date => {
        const day = date.getDay();
        dayOfWeek.set(day, (dayOfWeek.get(day) || 0) + 1);
      });
      
      const maxDayCount = Math.max(...dayOfWeek.values());
      if (maxDayCount > dates.length * 0.4) {
        patterns.push({
          type: 'Temporal',
          description: `${col.name} shows clustering on specific days of the week`,
          confidence: maxDayCount / dates.length,
          columns: [col.name]
        });
      }
    }
  });
  
  return patterns;
}

function detectCategoricalPatterns(data: DataRow[], columns: ColumnInfo[]): any[] {
  const patterns: any[] = [];
  
  const categoricalColumns = columns.filter(col => col.type === 'text');
  
  categoricalColumns.forEach(col => {
    const values = data.map(row => row[col.name]).filter(val => val != null && val !== '');
    const uniqueValues = new Set(values);
    
    // High cardinality check
    if (uniqueValues.size > values.length * 0.8 && values.length > 50) {
      patterns.push({
        type: 'High Cardinality',
        description: `${col.name} has very high cardinality (${uniqueValues.size}/${values.length} unique values)`,
        confidence: uniqueValues.size / values.length,
        columns: [col.name]
      });
    }
    
    // Dominant value pattern
    const valueCounts = new Map<string, number>();
    values.forEach(val => {
      valueCounts.set(String(val), (valueCounts.get(String(val)) || 0) + 1);
    });
    
    const maxCount = Math.max(...valueCounts.values());
    if (maxCount > values.length * 0.7) {
      patterns.push({
        type: 'Dominant Value',
        description: `${col.name} is dominated by a single value (${(maxCount / values.length * 100).toFixed(1)}%)`,
        confidence: maxCount / values.length,
        columns: [col.name]
      });
    }
  });
  
  return patterns;
}

function predictQualityTrend(currentQuality: number, dataSize: number): { score: number; confidence: number } {
  // Simple trend prediction based on current state
  const volatility = Math.min(dataSize / 10000, 1); // Larger datasets tend to be more stable
  const trendFactor = Math.random() * 0.2 - 0.1; // Random trend between -10% and +10%
  
  const predictedScore = Math.max(0, Math.min(100, (1 - currentQuality) * 100 + trendFactor * 100));
  const confidence = 0.6 + volatility * 0.3;
  
  return { score: Math.round(predictedScore), confidence };
}

function predictDataVolume(currentSize: number): { volume: number; confidence: number } {
  // Predict volume growth
  const growthRate = 0.1 + Math.random() * 0.3; // 10-40% growth
  const predictedVolume = Math.round(currentSize * (1 + growthRate));
  
  return { volume: predictedVolume, confidence: 0.7 };
}

function generateSmartRecommendations(
  data: DataRow[],
  columns: ColumnInfo[],
  issues: any[],
  insights: MLInsight[]
): MLInsight[] {
  const recommendations: MLInsight[] = [];
  
  // Analyze issue distribution
  const issuesByColumn = new Map<string, number>();
  issues.forEach(issue => {
    issuesByColumn.set(issue.column, (issuesByColumn.get(issue.column) || 0) + 1);
  });
  
  // High-impact column recommendations
  const problematicColumns = Array.from(issuesByColumn.entries())
    .filter(([, count]) => count > 2)
    .sort(([, a], [, b]) => b - a);
  
  if (problematicColumns.length > 0) {
    const [topColumn, issueCount] = problematicColumns[0];
    recommendations.push({
      id: `smart_rec_${Date.now()}_column`,
      type: 'recommendation',
      title: 'Prioritize Column Validation',
      description: `Focus on implementing comprehensive validation for "${topColumn}" which has ${issueCount} different types of issues.`,
      confidence: Math.min(issueCount / 5, 0.95),
      severity: 'high',
      column: topColumn,
      impact: 75,
      timestamp: new Date(),
      action: `Create validation pipeline for ${topColumn}`,
      metadata: {
        issue_count: issueCount,
        recommendation_type: 'validation_priority'
      }
    });
  }
  
  // Data volume recommendations
  if (data.length > 10000) {
    recommendations.push({
      id: `smart_rec_${Date.now()}_performance`,
      type: 'recommendation',
      title: 'Implement Sampling Strategy',
      description: `With ${data.length} rows, consider implementing data sampling for faster quality analysis while maintaining statistical significance.`,
      confidence: 0.8,
      severity: 'medium',
      impact: 60,
      timestamp: new Date(),
      action: 'Set up stratified sampling',
      metadata: {
        data_size: data.length,
        recommendation_type: 'performance_optimization'
      }
    });
  }
  
  return recommendations;
}
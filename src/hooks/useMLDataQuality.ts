
import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { MLInsight, MLAnalysisResult } from '@/lib/ml/types';
import { detectAnomalies } from '@/lib/ml/anomalyDetection';
import { discoverPatterns } from '@/lib/ml/patternAnalysis';
import { predictQualityTrend, predictDataVolume, predictCustomerLifetimeValue } from '@/lib/ml/predictionUtils';

export const useMLDataQuality = () => {
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const runMLAnalysis = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<MLAnalysisResult> => {
    console.log('Running ML data quality analysis...');
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const newInsights: MLInsight[] = [];
      const anomalies: any[] = [];
      const patterns: any[] = [];
      const predictions: any[] = [];

      // Step 1: Anomaly Detection (25%)
      setAnalysisProgress(10);
      const numericColumns = columns.filter(col => col.type === 'numeric');
      
      for (const column of numericColumns) {
        const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
        
        if (values.length > 10) {
          const anomalyResult = detectAnomalies(values, { threshold: 2.5 });
          
          if (anomalyResult.anomalies.length > 0) {
            anomalies.push({
              column: column.name,
              count: anomalyResult.anomalies.length,
              severity: anomalyResult.anomalies.length > values.length * 0.1 ? 'high' as const : 'medium' as const,
              examples: anomalyResult.anomalies.slice(0, 5)
            });

            newInsights.push({
              id: `anomaly_${column.name}_${Date.now()}`,
              type: 'anomaly',
              title: `Anomalies detected in ${column.name}`,
              description: `Found ${anomalyResult.anomalies.length} anomalous values in ${column.name}`,
              confidence: anomalyResult.confidence,
              severity: anomalyResult.anomalies.length > values.length * 0.1 ? 'high' : 'medium',
              column: column.name,
              impact: anomalyResult.anomalies.length / values.length,
              timestamp: new Date(),
              metadata: {
                anomalies: anomalyResult.anomalies,
                threshold: 2.5,
                statisticalMethod: 'z-score'
              }
            });
          }
        }
      }

      setAnalysisProgress(25);

      // Step 2: Pattern Discovery (50%)
      const patternResult = discoverPatterns(data, columns);
      patternResult.patterns.forEach(pattern => {
        patterns.push({
          type: pattern.type,
          description: pattern.description,
          confidence: pattern.confidence,
          columns: pattern.columns
        });

        newInsights.push({
          id: `pattern_${Date.now()}_${Math.random()}`,
          type: 'pattern',
          title: `Pattern discovered: ${pattern.type}`,
          description: pattern.description,
          confidence: pattern.confidence,
          severity: pattern.confidence > 0.8 ? 'high' : 'medium',
          impact: pattern.confidence,
          timestamp: new Date(),
          metadata: {
            patternType: pattern.type,
            affectedColumns: pattern.columns
          }
        });
      });

      setAnalysisProgress(50);

      // Step 3: Predictive Analysis (75%)
      // Quality trend prediction
      const qualityTrend = predictQualityTrend(85, data.length);
      predictions.push({
        metric: 'data_quality',
        prediction: qualityTrend.r2Score || 0,
        confidence: qualityTrend.confidence,
        timeframe: '30 days'
      });

      newInsights.push({
        id: `prediction_quality_${Date.now()}`,
        type: 'prediction',
        title: 'Data Quality Trend Prediction',
        description: `Data quality is expected to ${(qualityTrend.r2Score || 0) > 0.8 ? 'remain stable' : 'decline'} over the next 30 days`,
        confidence: qualityTrend.confidence,
        severity: (qualityTrend.r2Score || 0) < 0.6 ? 'high' : 'low',
        impact: 1 - (qualityTrend.r2Score || 0),
        timestamp: new Date(),
        metadata: {
          currentQuality: 85,
          predictedQuality: qualityTrend.r2Score || 0,
          factors: ['data_volume', 'complexity']
        }
      });

      // Volume prediction
      const volumeTrend = predictDataVolume(data.length);
      predictions.push({
        metric: 'data_volume',
        prediction: volumeTrend.prediction,
        confidence: volumeTrend.confidence,
        timeframe: '60 days'
      });

      setAnalysisProgress(75);

      // Step 4: Generate Recommendations (100%)
      if (anomalies.length > 0) {
        newInsights.push({
          id: `recommendation_anomalies_${Date.now()}`,
          type: 'recommendation',
          title: 'Address Data Anomalies',
          description: `Investigate and clean ${anomalies.length} anomalous data points to improve quality`,
          confidence: 0.9,
          severity: 'medium',
          action: 'data_cleaning',
          impact: 0.7,
          timestamp: new Date(),
          metadata: {
            affectedColumns: anomalies.map(a => a.column),
            priority: 'medium'
          }
        });
      }

      setAnalysisProgress(100);
      setInsights(newInsights);

      console.log('ML analysis completed:', {
        insights: newInsights.length,
        anomalies: anomalies.length,
        patterns: patterns.length,
        predictions: predictions.length
      });

      return {
        insights: newInsights,
        anomalies,
        patterns,
        predictions
      };

    } catch (error) {
      console.error('ML analysis failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  }, []);

  return {
    insights,
    isAnalyzing,
    analysisProgress,
    runMLAnalysis
  };
};

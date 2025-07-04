import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';
import { MLInsight, MLAnalysisResult } from '@/lib/ml/types';
import { detectIsolationAnomalies, detectLOFAnomalies } from '@/lib/ml/anomalyDetection';
import { detectCorrelationPatterns, detectTemporalPatterns, detectCategoricalPatterns } from '@/lib/ml/patternAnalysis';
import { predictQualityTrend, predictDataVolume } from '@/lib/ml/predictionUtils';
import { generateSmartRecommendations } from '@/lib/ml/recommendationEngine';

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

// Re-export types for backward compatibility
export type { MLInsight, MLAnalysisResult } from '@/lib/ml/types';
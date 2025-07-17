import { useState, useCallback, useMemo } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TrendPrediction {
  columnName: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  explanation: string;
}

interface AnomalyDetection {
  columnName: string;
  anomalyCount: number;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
}

interface SeasonalityAnalysis {
  columnName: string;
  seasonalPattern: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'none';
  strength: number;
  explanation: string;
}

type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export const usePredictiveAnalytics = (data: DataRow[], columns: ColumnInfo[]) => {
  const [trendPredictions, setTrendPredictions] = useState<TrendPrediction[]>([]);
  const [anomalyDetections, setAnomalyDetections] = useState<AnomalyDetection[]>([]);
  const [seasonalityAnalysis, setSeasonalityAnalysis] = useState<SeasonalityAnalysis[]>([]);

  const numericColumns = useMemo(() => {
    return columns.filter(col => col.type === 'numeric');
  }, [columns]);

  const detectTrend = useCallback((values: number[]): TrendDirection => {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const threshold = Math.abs(firstAvg) * 0.1; // 10% threshold
    
    if (secondAvg > firstAvg + threshold) return 'increasing' as TrendDirection;
    if (secondAvg < firstAvg - threshold) return 'decreasing' as TrendDirection;
    return 'stable' as TrendDirection;
  }, []);

  const generateTrendPredictions = useCallback((data: DataRow[]): TrendPrediction[] => {
    const predictions: TrendPrediction[] = [];
    
    numericColumns.forEach(column => {
      const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
      
      if (values.length > 10) {
        const trend: TrendDirection = detectTrend(values);
        
        let explanation = '';
        if (trend === 'increasing') {
          explanation = `Values in column "${column.name}" show an increasing trend over time.`;
        } else if (trend === 'decreasing') {
          explanation = `Values in column "${column.name}" show a decreasing trend over time.`;
        } else {
          explanation = `Values in column "${column.name}" show a stable trend over time.`;
        }
        
        predictions.push({
          columnName: column.name,
          trend: trend,
          confidence: 0.75,
          explanation: explanation
        });
      }
    });
    
    return predictions;
  }, [detectTrend, numericColumns]);

  const detectAnomalies = useCallback((data: DataRow[]): AnomalyDetection[] => {
    const anomalyResults: AnomalyDetection[] = [];
    
    numericColumns.forEach(column => {
      const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
      
      if (values.length > 20) {
        const trend: TrendDirection = detectTrend(values);
        
        // Simple anomaly detection (values outside 3 standard deviations)
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
        const threshold = 3 * stdDev;
        
        const anomalies = values.filter(val => Math.abs(val - mean) > threshold);
        
        let severity: 'high' | 'medium' | 'low' = 'low';
        if (anomalies.length > 0.1 * values.length) severity = 'high';
        else if (anomalies.length > 0.05 * values.length) severity = 'medium';
        
        anomalyResults.push({
          columnName: column.name,
          anomalyCount: anomalies.length,
          severity: severity,
          explanation: `Detected ${anomalies.length} anomalies in column "${column.name}".`
        });
      }
    });
    
    return anomalyResults;
  }, [detectTrend, numericColumns]);

  const analyzeSeasonality = useCallback((data: DataRow[]): SeasonalityAnalysis[] => {
    const seasonalityResults: SeasonalityAnalysis[] = [];
    
    numericColumns.forEach(column => {
      const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
      
      if (values.length > 30) {
        // Simple seasonality detection (check for repeating patterns)
        const weeklyPattern = values.slice(0, 7);
        const monthlyPattern = values.slice(0, 30);
        
        // Fix the arithmetic operation
        const avgValue = values.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) / values.length;
        
        let seasonalPattern: SeasonalityAnalysis['seasonalPattern'] = 'none';
        let strength = 0;
        
        if (weeklyPattern.length === 7 && weeklyPattern.every(val => typeof val === 'number' && !isNaN(val))) {
          const weeklyDiffs = weeklyPattern.map(val => Math.abs(val - avgValue));
          const weeklyAvgDiff = weeklyDiffs.reduce((sum, diff) => sum + diff, 0) / weeklyDiffs.length;
          
          if (weeklyAvgDiff > 0.1 * Math.abs(avgValue)) {
            seasonalPattern = 'weekly';
            strength = 0.6;
          }
        }
        
        if (monthlyPattern.length === 30 && monthlyPattern.every(val => typeof val === 'number' && !isNaN(val))) {
          const monthlyDiffs = monthlyPattern.map(val => Math.abs(val - avgValue));
          const monthlyAvgDiff = monthlyDiffs.reduce((sum, diff) => sum + diff, 0) / monthlyDiffs.length;
          
          if (monthlyAvgDiff > 0.15 * Math.abs(avgValue)) {
            seasonalPattern = 'monthly';
            strength = 0.7;
          }
        }
        
        seasonalityResults.push({
          columnName: column.name,
          seasonalPattern: seasonalPattern,
          strength: strength,
          explanation: `Detected ${seasonalPattern} seasonality in column "${column.name}".`
        });
      }
    });
    
    return seasonalityResults;
  }, [detectTrend, numericColumns]);

  const runAllAnalysis = useCallback(() => {
    setTrendPredictions(generateTrendPredictions(data));
    setAnomalyDetections(detectAnomalies(data));
    setSeasonalityAnalysis(analyzeSeasonality(data));
  }, [data, generateTrendPredictions, detectAnomalies, analyzeSeasonality]);

  return {
    trendPredictions,
    anomalyDetections,
    seasonalityAnalysis,
    runAllAnalysis
  };
};

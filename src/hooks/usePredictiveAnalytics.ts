
import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface TrendPrediction {
  column: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  prediction: number[];
  timeframe: string;
}

export interface AnomalyDetection {
  column: string;
  anomalies: Array<{
    index: number;
    value: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  threshold: number;
}

export interface SeasonalityAnalysis {
  column: string;
  hasSeasonality: boolean;
  period?: number;
  strength?: number;
}

export interface BusinessPrediction {
  metric: string;
  current: number;
  predicted: number;
  change: number;
  changePercent: number;
  confidence: number;
}

export interface BusinessScenario {
  name: string;
  description: string;
  predictions: BusinessPrediction[];
}

export const usePredictiveAnalytics = (data: DataRow[], columns: ColumnInfo[]) => {
  const [trendPredictions, setTrendPredictions] = useState<TrendPrediction[]>([]);
  const [anomalyDetections, setAnomalyDetections] = useState<AnomalyDetection[]>([]);
  const [seasonalityAnalysis, setSeasonalityAnalysis] = useState<SeasonalityAnalysis[]>([]);

  const runAllAnalysis = useCallback(() => {
    // Run trend analysis
    const trends = columns
      .filter(col => col.type === 'numeric')
      .map(col => {
        const values = data.map(row => Number(row[col.name])).filter(val => !isNaN(val));
        const trend = calculateTrend(values);
        return {
          column: col.name,
          trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
          confidence: Math.min(Math.abs(trend) * 10, 1),
          prediction: values.slice(-5).concat([values[values.length - 1] + trend * 5]),
          timeframe: '30 days'
        } as TrendPrediction;
      });

    // Run anomaly detection
    const anomalies = columns
      .filter(col => col.type === 'numeric')
      .map(col => {
        const values = data.map(row => Number(row[col.name])).filter(val => !isNaN(val));
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
        const threshold = std * 2;
        
        const detectedAnomalies = values
          .map((value, index) => ({ index, value, severity: Math.abs(value - mean) > threshold ? 'high' : 'low' as 'low' | 'medium' | 'high' }))
          .filter(item => Math.abs(item.value - mean) > threshold);

        return {
          column: col.name,
          anomalies: detectedAnomalies,
          threshold
        } as AnomalyDetection;
      });

    // Run seasonality analysis
    const seasonality = columns
      .filter(col => col.type === 'numeric')
      .map(col => ({
        column: col.name,
        hasSeasonality: Math.random() > 0.7, // Simplified for demo
        period: Math.floor(Math.random() * 12) + 1,
        strength: Math.random()
      } as SeasonalityAnalysis));

    setTrendPredictions(trends);
    setAnomalyDetections(anomalies);
    setSeasonalityAnalysis(seasonality);
  }, [data, columns]);

  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  };

  return {
    trendPredictions,
    anomalyDetections,
    seasonalityAnalysis,
    runAllAnalysis,
  };
};

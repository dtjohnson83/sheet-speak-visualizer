import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessPrediction {
  id: string;
  type: 'revenue' | 'sales' | 'growth' | 'customer' | 'market' | 'risk';
  title: string;
  description: string;
  prediction: number;
  unit: string;
  confidence: number;
  timeframe: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'high' | 'medium' | 'low';
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface BusinessScenario {
  id: string;
  name: string;
  description: string;
  assumptions: Record<string, number>;
  predictions: BusinessPrediction[];
  confidence: number;
}

export interface PredictiveAnalyticsResult {
  predictions: BusinessPrediction[];
  scenarios: BusinessScenario[];
  insights: Array<{
    id: string;
    title: string;
    description: string;
    actionable: boolean;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export const usePredictiveAnalytics = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateBusinessPredictions = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<BusinessPrediction[]> => {
    const predictions: BusinessPrediction[] = [];
    
    // Revenue forecasting
    const revenueColumns = columns.filter(col => 
      col.name.toLowerCase().includes('revenue') ||
      col.name.toLowerCase().includes('sales') ||
      col.name.toLowerCase().includes('income')
    );

    for (const column of revenueColumns) {
      if (column.type === 'numeric') {
        const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
        if (values.length > 5) {
          const trend = calculateTrend(values);
          const forecast = forecastValue(values, 30); // 30-day forecast
          
          predictions.push({
            id: `revenue_${column.name}_${Date.now()}`,
            type: 'revenue',
            title: `${column.name} Forecast`,
            description: `Predicted ${column.name.toLowerCase()} for next 30 days based on historical trend analysis`,
            prediction: forecast.value,
            unit: 'currency',
            confidence: forecast.confidence,
            timeframe: '30 days',
            trend: trend.direction,
            impact: forecast.value > trend.average * 1.1 ? 'high' : forecast.value > trend.average * 0.9 ? 'medium' : 'low',
            metadata: {
              historicalAverage: trend.average,
              growthRate: trend.growthRate,
              seasonality: trend.seasonality
            },
            timestamp: new Date()
          });
        }
      }
    }

    // Customer analytics predictions
    const customerColumns = columns.filter(col =>
      col.name.toLowerCase().includes('customer') ||
      col.name.toLowerCase().includes('user') ||
      col.name.toLowerCase().includes('client')
    );

    if (customerColumns.length > 0) {
      const customerGrowth = calculateCustomerGrowth(data, customerColumns);
      
      predictions.push({
        id: `customers_${Date.now()}`,
        type: 'customer',
        title: 'Customer Growth Forecast',
        description: 'Predicted customer acquisition and retention trends',
        prediction: customerGrowth.predictedGrowth,
        unit: 'percentage',
        confidence: customerGrowth.confidence,
        timeframe: '90 days',
        trend: customerGrowth.trend,
        impact: 'high',
        metadata: {
          churnRate: customerGrowth.churnRate,
          acquisitionRate: customerGrowth.acquisitionRate
        },
        timestamp: new Date()
      });
    }

    // Market trend analysis
    const volumeColumns = columns.filter(col =>
      col.name.toLowerCase().includes('volume') ||
      col.name.toLowerCase().includes('quantity') ||
      col.name.toLowerCase().includes('count')
    );

    for (const column of volumeColumns) {
      if (column.type === 'numeric') {
        const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
        if (values.length > 10) {
          const marketTrend = analyzeMarketTrend(values);
          
          predictions.push({
            id: `market_${column.name}_${Date.now()}`,
            type: 'market',
            title: `${column.name} Market Trend`,
            description: `Market analysis for ${column.name.toLowerCase()} showing demand patterns`,
            prediction: marketTrend.forecast,
            unit: 'units',
            confidence: marketTrend.confidence,
            timeframe: '60 days',
            trend: marketTrend.direction,
            impact: 'medium',
            metadata: {
              volatility: marketTrend.volatility,
              cyclical: marketTrend.cyclical
            },
            timestamp: new Date()
          });
        }
      }
    }

    return predictions;
  }, []);

  const generateBusinessScenarios = useCallback((
    predictions: BusinessPrediction[]
  ): BusinessScenario[] => {
    const scenarios: BusinessScenario[] = [];

    // Optimistic scenario
    scenarios.push({
      id: `optimistic_${Date.now()}`,
      name: 'Optimistic Growth',
      description: 'Best-case scenario with favorable market conditions',
      assumptions: {
        marketGrowth: 1.15,
        customerRetention: 0.95,
        operationalEfficiency: 1.10
      },
      predictions: predictions.map(pred => ({
        ...pred,
        prediction: pred.prediction * 1.15,
        confidence: pred.confidence * 0.85
      })),
      confidence: 0.75
    });

    // Conservative scenario
    scenarios.push({
      id: `conservative_${Date.now()}`,
      name: 'Conservative Estimate',
      description: 'Conservative projection with market uncertainties',
      assumptions: {
        marketGrowth: 1.05,
        customerRetention: 0.85,
        operationalEfficiency: 0.95
      },
      predictions: predictions.map(pred => ({
        ...pred,
        prediction: pred.prediction * 0.85,
        confidence: pred.confidence * 0.95
      })),
      confidence: 0.90
    });

    // Pessimistic scenario
    scenarios.push({
      id: `pessimistic_${Date.now()}`,
      name: 'Risk Assessment',
      description: 'Worst-case scenario for risk planning',
      assumptions: {
        marketGrowth: 0.95,
        customerRetention: 0.75,
        operationalEfficiency: 0.85
      },
      predictions: predictions.map(pred => ({
        ...pred,
        prediction: pred.prediction * 0.70,
        confidence: pred.confidence * 0.80
      })),
      confidence: 0.85
    });

    return scenarios;
  }, []);

  const runPredictiveAnalysis = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<PredictiveAnalyticsResult> => {
    console.log('Starting predictive analysis with:', { dataRows: data.length, columns: columns.length });
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      // Step 1: Generate business predictions (40%)
      setAnalysisProgress(20);
      console.log('Generating business predictions...');
      const predictions = await generateBusinessPredictions(data, columns);
      console.log('Generated predictions:', predictions.length);
      
      setAnalysisProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Create business scenarios (70%)
      console.log('Creating business scenarios...');
      const scenarios = generateBusinessScenarios(predictions);
      console.log('Generated scenarios:', scenarios.length);
      setAnalysisProgress(70);

      // Step 3: Generate actionable insights (100%)
      console.log('Generating actionable insights...');
      const insights = generateActionableInsights(predictions, scenarios);
      console.log('Generated insights:', insights.length);
      setAnalysisProgress(100);

      setLastAnalysis(new Date());

      console.log('Predictive analysis completed successfully');
      return {
        predictions,
        scenarios,
        insights
      };

    } catch (err) {
      console.error('Predictive analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Predictive analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  }, [generateBusinessPredictions, generateBusinessScenarios]);

  return {
    isAnalyzing,
    analysisProgress,
    lastAnalysis,
    error,
    runPredictiveAnalysis
  };
};

// Utility functions for calculations
function calculateTrend(values: number[]) {
  const n = values.length;
  const xSum = Array.from({length: n}, (_, i) => i).reduce((a, b) => a + b, 0);
  const ySum = values.reduce((a, b) => a + b, 0);
  const xySum = values.reduce((sum, y, x) => sum + x * y, 0);
  const xxSum = Array.from({length: n}, (_, i) => i * i).reduce((a, b) => a + b, 0);
  
  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  const average = ySum / n;
  
  return {
    slope,
    average,
    direction: slope > 0.01 ? 'increasing' as const : slope < -0.01 ? 'decreasing' as const : 'stable' as const,
    growthRate: slope / average,
    seasonality: calculateSeasonality(values)
  };
}

function forecastValue(values: number[], daysAhead: number) {
  const trend = calculateTrend(values);
  const forecast = trend.average + (trend.slope * (values.length + daysAhead));
  const variance = calculateVariance(values);
  const confidence = Math.max(0.6, Math.min(0.95, 1 - (variance / (trend.average * trend.average))));
  
  return {
    value: Math.max(0, forecast),
    confidence
  };
}

function calculateSeasonality(values: number[]): number {
  if (values.length < 12) return 0;
  
  // Simple seasonality detection using autocorrelation
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const deviations = values.map(v => v - mean);
  
  // Check for weekly (7-day) and monthly (30-day) patterns
  let seasonality = 0;
  for (const period of [7, 30]) {
    if (values.length >= period * 2) {
      let correlation = 0;
      for (let i = 0; i < values.length - period; i++) {
        correlation += deviations[i] * deviations[i + period];
      }
      seasonality = Math.max(seasonality, Math.abs(correlation) / (values.length - period));
    }
  }
  
  return seasonality;
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
}

function calculateCustomerGrowth(data: DataRow[], customerColumns: ColumnInfo[]) {
  // Simplified customer growth calculation
  const totalRecords = data.length;
  const assumedChurnRate = 0.05; // 5% monthly churn
  const assumedAcquisitionRate = 0.08; // 8% monthly acquisition
  
  return {
    churnRate: assumedChurnRate,
    acquisitionRate: assumedAcquisitionRate,
    predictedGrowth: (assumedAcquisitionRate - assumedChurnRate) * 100,
    trend: assumedAcquisitionRate > assumedChurnRate ? 'increasing' as const : 'decreasing' as const,
    confidence: 0.75
  };
}

function analyzeMarketTrend(values: number[]) {
  const trend = calculateTrend(values);
  const volatility = calculateVariance(values) / (trend.average * trend.average);
  
  return {
    forecast: trend.average + (trend.slope * 60), // 60-day forecast
    direction: trend.direction,
    confidence: Math.max(0.65, 1 - volatility),
    volatility,
    cyclical: calculateSeasonality(values) > 0.3
  };
}

function generateActionableInsights(
  predictions: BusinessPrediction[],
  scenarios: BusinessScenario[]
): Array<{id: string; title: string; description: string; actionable: boolean; priority: 'high' | 'medium' | 'low'}> {
  const insights = [];
  
  // Revenue insights
  const revenuePredictions = predictions.filter(p => p.type === 'revenue');
  if (revenuePredictions.length > 0) {
    const avgGrowth = revenuePredictions.reduce((sum, p) => sum + (p.trend === 'increasing' ? 1 : -1), 0);
    
    insights.push({
      id: `insight_revenue_${Date.now()}`,
      title: avgGrowth > 0 ? 'Revenue Growth Opportunity' : 'Revenue Risk Alert',
      description: avgGrowth > 0 
        ? 'Multiple revenue streams show positive growth trends. Consider scaling marketing efforts.'
        : 'Revenue trends indicate potential challenges. Review pricing and market positioning.',
      actionable: true,
      priority: 'high' as const
    });
  }
  
  // Market insights
  const marketPredictions = predictions.filter(p => p.type === 'market');
  if (marketPredictions.length > 0) {
    insights.push({
      id: `insight_market_${Date.now()}`,
      title: 'Market Demand Analysis',
      description: 'Market trends indicate opportunities for product optimization and demand forecasting.',
      actionable: true,
      priority: 'medium' as const
    });
  }
  
  return insights;
}
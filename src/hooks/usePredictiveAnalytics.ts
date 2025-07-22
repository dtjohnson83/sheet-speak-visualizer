import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface BusinessPrediction {
  id: string;
  type: 'revenue' | 'customer' | 'market' | 'risk' | 'sales';
  title: string;
  description: string;
  prediction: number;
  unit: 'currency' | 'percentage' | 'units';
  confidence: number;
  timeframe: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'high' | 'medium' | 'low';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BusinessScenario {
  id: string;
  name: string;
  title: string;
  description: string;
  confidence: number;
  assumptions: {
    marketGrowth: number;
    customerRetention: number;
    operationalEfficiency: number;
  };
  predictions: Array<{
    type: string;
    prediction: number;
    unit: string;
  }>;
  potentialImpact: number;
  riskLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface BusinessHealthMetrics {
  customerAcquisitionTrend: number;
  churnRisk: number;
  revenueStability: number;
  activityLevel: number;
  overallHealth: 'growth' | 'stable' | 'decline' | 'crisis';
}

export const usePredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState<BusinessPrediction[]>([]);
  const [scenarios, setScenarios] = useState<BusinessScenario[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const generateBusinessPredictions = useCallback((
    data: DataRow[],
    columns: ColumnInfo[]
  ): BusinessPrediction[] => {
    const predictions: BusinessPrediction[] = [];

    // Revenue prediction
    const revenueColumns = columns.filter(col => 
      col.type === 'numeric' && (
        col.name.toLowerCase().includes('revenue') ||
        col.name.toLowerCase().includes('sales') ||
        col.name.toLowerCase().includes('income')
      )
    );

    revenueColumns.forEach(column => {
      const values = data
        .map(row => Number(row[column.name]))
        .filter(val => !isNaN(val) && val > 0);

      if (values.length >= 5) {
        const trend: 'increasing' | 'decreasing' | 'stable' = 
          values[values.length - 1] > values[0] ? 'increasing' : 
          values[values.length - 1] < values[0] ? 'decreasing' : 'stable';
        
        predictions.push({
          id: `revenue_${column.name}_${Date.now()}`,
          type: 'revenue',
          title: `${column.name} Forecast`,
          description: `Predicted ${column.name.toLowerCase()} based on historical trends`,
          prediction: values[values.length - 1] * 1.1,
          unit: 'currency',
          confidence: 0.75,
          timeframe: '30 days',
          trend: trend,
          impact: 'medium',
          timestamp: new Date()
        });
      }
    });

    // Customer churn risk
    const churnColumns = columns.filter(col => 
      col.type === 'numeric' && col.name.toLowerCase().includes('churn')
    );

    churnColumns.forEach(column => {
      const values = data
        .map(row => Number(row[column.name]))
        .filter(val => !isNaN(val));

      if (values.length > 0) {
        const avgChurn = values.reduce((a, b) => a + b, 0) / values.length;
        const trend: 'increasing' | 'decreasing' | 'stable' = avgChurn > 0.5 ? 'increasing' : 'decreasing';

        predictions.push({
          id: `churn_${column.name}_${Date.now()}`,
          type: 'risk',
          title: 'Customer Churn Risk',
          description: 'Predicted risk of customer churn based on available data',
          prediction: avgChurn * 100,
          unit: 'percentage',
          confidence: 0.8,
          timeframe: 'next month',
          trend: trend,
          impact: 'high',
          timestamp: new Date()
        });
      }
    });

    // Market trend analysis
    const marketColumns = columns.filter(col => 
      col.type === 'numeric' && col.name.toLowerCase().includes('market')
    );

    marketColumns.forEach(column => {
      const values = data
        .map(row => Number(row[column.name]))
        .filter(val => !isNaN(val));

      if (values.length > 0) {
        const trend: 'increasing' | 'decreasing' | 'stable' = 
          values[values.length - 1] > values[0] ? 'increasing' : 
          values[values.length - 1] < values[0] ? 'decreasing' : 'stable';

        predictions.push({
          id: `market_${column.name}_${Date.now()}`,
          type: 'market',
          title: 'Market Trend Analysis',
          description: 'Predicted market trends based on historical data',
          prediction: values[values.length - 1] * 1.05,
          unit: 'units',
          confidence: 0.7,
          timeframe: 'next quarter',
          trend: trend,
          impact: 'medium',
          timestamp: new Date()
        });
      }
    });

    return predictions;
  }, []);

  const generateBusinessScenarios = useCallback((
    predictions: BusinessPrediction[]
  ): BusinessScenario[] => {
    const scenarios: BusinessScenario[] = [];

    // Scenario 1: Optimistic Growth
    scenarios.push({
      id: 'scenario_optimistic',
      name: 'Optimistic Growth',
      title: 'Aggressive Marketing Campaign',
      description: 'Launch an aggressive marketing campaign to boost revenue',
      confidence: 0.7,
      assumptions: {
        marketGrowth: 1.15,
        customerRetention: 0.85,
        operationalEfficiency: 1.1
      },
      predictions: predictions.map(p => ({
        type: p.type,
        prediction: p.prediction * 1.2,
        unit: p.unit
      })),
      potentialImpact: 0.15,
      riskLevel: 'medium',
      recommendations: ['Increase ad spend', 'Improve targeting', 'Monitor ROI']
    });

    // Scenario 2: Conservative Approach
    scenarios.push({
      id: 'scenario_conservative',
      name: 'Conservative Approach',
      title: 'Enhanced Customer Support',
      description: 'Improve customer support to reduce churn',
      confidence: 0.85,
      assumptions: {
        marketGrowth: 1.05,
        customerRetention: 0.9,
        operationalEfficiency: 1.05
      },
      predictions: predictions.map(p => ({
        type: p.type,
        prediction: p.prediction * 1.05,
        unit: p.unit
      })),
      potentialImpact: 0.10,
      riskLevel: 'low',
      recommendations: ['Train support staff', 'Implement chatbot', 'Gather feedback']
    });

    // Scenario 3: Risk Mitigation
    scenarios.push({
      id: 'scenario_risk',
      name: 'Risk Mitigation',
      title: 'Defensive Strategy',
      description: 'Focus on maintaining current performance and reducing risks',
      confidence: 0.9,
      assumptions: {
        marketGrowth: 1.0,
        customerRetention: 0.8,
        operationalEfficiency: 1.0
      },
      predictions: predictions.map(p => ({
        type: p.type,
        prediction: p.prediction * 0.95,
        unit: p.unit
      })),
      potentialImpact: 0.05,
      riskLevel: 'low',
      recommendations: ['Cost reduction', 'Quality improvement', 'Risk assessment']
    });

    return scenarios;
  }, []);

  const generateActionableInsights = useCallback((
    predictions: BusinessPrediction[]
  ): any[] => {
    const insights: any[] = [];

    predictions.forEach(prediction => {
      if (prediction.type === 'revenue' && prediction.trend === 'decreasing') {
        insights.push({
          id: `insight_${prediction.id}`,
          title: 'Decreasing Revenue Trend',
          description: `Revenue is decreasing. Investigate the cause and take corrective action.`,
          actionable: true,
          priority: 'high',
          confidence: 0.8,
          impact: 0.7
        });
      }
    });

    return insights;
  }, []);

  const generateRecommendations = useCallback((
    predictions: BusinessPrediction[]
  ): any[] => {
    const recommendations: any[] = [];

    predictions.forEach(prediction => {
      if (prediction.type === 'risk' && prediction.prediction > 50) {
        recommendations.push({
          id: `recommendation_${prediction.id}`,
          title: 'Reduce Churn Risk',
          description: `Churn risk is high. Implement customer retention strategies.`,
          implementation: 'Offer discounts, improve support, gather feedback',
          expectedImpact: 0.15,
          timeframe: '30 days'
        });
      }
    });

    return recommendations;
  }, []);

  const runPredictiveAnalysis = useCallback((
    data: DataRow[],
    columns: ColumnInfo[]
  ) => {
    const newPredictions = generateBusinessPredictions(data, columns);
    const newScenarios = generateBusinessScenarios(newPredictions);
    const newInsights = generateActionableInsights(newPredictions);
    const newRecommendations = generateRecommendations(newPredictions);

    setPredictions(newPredictions);
    setScenarios(newScenarios);
    setInsights(newInsights);
    setRecommendations(newRecommendations);
  }, [generateBusinessPredictions, generateBusinessScenarios, generateActionableInsights, generateRecommendations]);

  return {
    predictions,
    scenarios,
    insights,
    recommendations,
    runPredictiveAnalysis
  };
};

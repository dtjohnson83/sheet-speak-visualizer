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

export interface BusinessHealthMetrics {
  customerAcquisitionTrend: number;
  churnRisk: number;
  revenueStability: number;
  activityLevel: number;
  overallHealth: 'growth' | 'stable' | 'decline' | 'crisis';
}

export const usePredictiveAnalytics = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeBusinessHealth = useCallback((data: DataRow[]): BusinessHealthMetrics => {
    console.log('=== Business Health Analysis ===');
    
    // Analyze customer acquisition trends
    const signupDates = data
      .map(row => ({ date: new Date(row.SignupDate || ''), id: row.CustomerID }))
      .filter(item => !isNaN(item.date.getTime()) && item.id);

    const signupsByYear = groupBy(signupDates, item => item.date.getFullYear());
    const years = Object.keys(signupsByYear).map(Number).sort();
    
    let customerAcquisitionTrend = 0;
    if (years.length >= 2) {
      const latestYear = years[years.length - 1];
      const previousYear = years[years.length - 2];
      const currentYearSignups = signupsByYear[latestYear]?.length || 0;
      const previousYearSignups = signupsByYear[previousYear]?.length || 0;
      
      if (previousYearSignups > 0) {
        customerAcquisitionTrend = (currentYearSignups - previousYearSignups) / previousYearSignups;
      }
    }

    // Analyze churn risk
    const churnScores = data
      .map(row => Number(row.ChurnRiskScore))
      .filter(score => !isNaN(score));
    const avgChurnRisk = churnScores.length > 0 ? 
      churnScores.reduce((a, b) => a + b, 0) / churnScores.length : 0.5;

    // Analyze activity level (customers with recent orders)
    const currentYear = new Date().getFullYear();
    const activeCustomers = data.filter(row => {
      const lastOrder = new Date(row.LastOrderDate || '');
      return !isNaN(lastOrder.getTime()) && lastOrder.getFullYear() === currentYear;
    }).length;
    
    const activityLevel = data.length > 0 ? activeCustomers / data.length : 0;

    // Analyze revenue stability
    const revenueValues = data
      .map(row => Number(row.TotalSpend || row.Revenue || 0))
      .filter(val => val > 0);
    const revenueStability = revenueValues.length > 0 ? 
      1 - (calculateVariance(revenueValues) / Math.pow(calculateMean(revenueValues), 2)) : 0.5;

    // Determine overall business health
    let overallHealth: 'growth' | 'stable' | 'decline' | 'crisis';
    if (customerAcquisitionTrend > 0.1 && avgChurnRisk < 0.3 && activityLevel > 0.7) {
      overallHealth = 'growth';
    } else if (customerAcquisitionTrend > -0.1 && avgChurnRisk < 0.5 && activityLevel > 0.4) {
      overallHealth = 'stable';
    } else if (customerAcquisitionTrend > -0.3 && avgChurnRisk < 0.7 && activityLevel > 0.2) {
      overallHealth = 'decline';
    } else {
      overallHealth = 'crisis';
    }

    console.log('Business Health Metrics:', {
      customerAcquisitionTrend: (customerAcquisitionTrend * 100).toFixed(1) + '%',
      avgChurnRisk: (avgChurnRisk * 100).toFixed(1) + '%',
      activityLevel: (activityLevel * 100).toFixed(1) + '%',
      revenueStability: (revenueStability * 100).toFixed(1) + '%',
      overallHealth
    });

    return {
      customerAcquisitionTrend,
      churnRisk: avgChurnRisk,
      revenueStability: Math.max(0, Math.min(1, revenueStability)),
      activityLevel,
      overallHealth
    };
  }, []);

  const generateBusinessPredictions = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<BusinessPrediction[]> => {
    const predictions: BusinessPrediction[] = [];
    const businessHealth = analyzeBusinessHealth(data);
    
    console.log('=== Predictive Analysis Debug ===');
    console.log('Available columns:', columns.map(c => ({ name: c.name, type: c.type })));
    console.log('Data sample:', data.slice(0, 3));
    console.log('Business health:', businessHealth);
    
    // Revenue forecasting with customer lifecycle consideration
    const revenueColumns = columns.filter(col => 
      col.name.toLowerCase().includes('revenue') ||
      col.name.toLowerCase().includes('sales') ||
      col.name.toLowerCase().includes('income') ||
      col.name.toLowerCase().includes('price') ||
      col.name.toLowerCase().includes('amount') ||
      col.name.toLowerCase().includes('cost') ||
      col.name.toLowerCase().includes('total') ||
      col.name.toLowerCase().includes('spend')
    );
    
    console.log('Revenue columns found:', revenueColumns.map(c => c.name));

    for (const column of revenueColumns) {
      console.log(`Checking revenue column: ${column.name} (type: ${column.type})`);
      if (column.type === 'numeric') {
        const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
        console.log(`  - Valid numeric values: ${values.length} out of ${data.length} rows`);
        
        if (values.length > 5) {
          const trend = calculateTrend(values);
          const forecast = forecastValueWithBusinessHealth(values, 30, businessHealth);
          
          predictions.push({
            id: `revenue_${column.name}_${Date.now()}`,
            type: 'revenue',
            title: `${column.name} Forecast`,
            description: `Predicted ${column.name.toLowerCase()} for next 30 days based on historical trend and customer lifecycle analysis`,
            prediction: forecast.value,
            unit: 'currency',
            confidence: forecast.confidence,
            timeframe: '30 days',
            trend: trend.direction,
            impact: forecast.value > trend.average * 1.1 ? 'high' : forecast.value > trend.average * 0.9 ? 'medium' : 'low',
            metadata: {
              historicalAverage: trend.average,
              growthRate: trend.growthRate,
              seasonality: trend.seasonality,
              businessHealthImpact: businessHealth.overallHealth,
              customerActivityLevel: businessHealth.activityLevel
            },
            timestamp: new Date()
          });
        }
      }
    }

    // FIXED: Real customer analytics based on actual data
    const customerGrowth = calculateRealCustomerGrowth(data, businessHealth);
    
    predictions.push({
      id: `customers_${Date.now()}`,
      type: 'customer',
      title: 'Customer Growth Forecast',
      description: 'Predicted customer acquisition and retention trends based on historical data',
      prediction: customerGrowth.predictedGrowth,
      unit: 'percentage',
      confidence: customerGrowth.confidence,
      timeframe: '90 days',
      trend: customerGrowth.trend,
      impact: 'high',
      metadata: {
        churnRate: customerGrowth.churnRate,
        acquisitionRate: customerGrowth.acquisitionRate,
        historicalTrend: customerGrowth.historicalTrend,
        riskFactors: customerGrowth.riskFactors
      },
      timestamp: new Date()
    });

    // Market trend analysis
    const volumeColumns = columns.filter(col =>
      col.name.toLowerCase().includes('volume') ||
      col.name.toLowerCase().includes('quantity') ||
      col.name.toLowerCase().includes('count') ||
      col.name.toLowerCase().includes('orders')
    );

    for (const column of volumeColumns) {
      if (column.type === 'numeric') {
        const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val));
        if (values.length > 10) {
          const marketTrend = analyzeMarketTrendWithHealth(values, businessHealth);
          
          predictions.push({
            id: `market_${column.name}_${Date.now()}`,
            type: 'market',
            title: `${column.name} Market Trend`,
            description: `Market analysis for ${column.name.toLowerCase()} adjusted for business health`,
            prediction: marketTrend.forecast,
            unit: 'units',
            confidence: marketTrend.confidence,
            timeframe: '60 days',
            trend: marketTrend.direction,
            impact: 'medium',
            metadata: {
              volatility: marketTrend.volatility,
              cyclical: marketTrend.cyclical,
              healthAdjustment: marketTrend.healthAdjustment
            },
            timestamp: new Date()
          });
        }
      }
    }

    // Validate and adjust predictions based on reality
    validatePredictions(predictions, data, businessHealth);

    return predictions;
  }, [analyzeBusinessHealth]);

  const generateRealisticScenarios = useCallback((
    predictions: BusinessPrediction[],
    businessHealth: BusinessHealthMetrics
  ): BusinessScenario[] => {
    const scenarios: BusinessScenario[] = [];

    console.log('Generating scenarios for business health:', businessHealth.overallHealth);

    // Scenario generation based on actual business state
    switch (businessHealth.overallHealth) {
      case 'growth':
        scenarios.push(
          {
            id: `optimistic_${Date.now()}`,
            name: 'Accelerated Growth',
            description: 'Capitalize on current growth momentum',
            assumptions: {
              marketGrowth: 1.15,
              customerRetention: 0.95,
              operationalEfficiency: 1.10
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 1.2,
              confidence: pred.confidence * 0.9
            })),
            confidence: 0.75
          },
          {
            id: `conservative_${Date.now()}`,
            name: 'Sustainable Growth',
            description: 'Moderate growth with stability focus',
            assumptions: {
              marketGrowth: 1.08,
              customerRetention: 0.90,
              operationalEfficiency: 1.05
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 1.05,
              confidence: pred.confidence * 0.95
            })),
            confidence: 0.85
          },
          {
            id: `risk_${Date.now()}`,
            name: 'Growth Plateau',
            description: 'Growth slows due to market saturation',
            assumptions: {
              marketGrowth: 1.02,
              customerRetention: 0.85,
              operationalEfficiency: 1.00
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.95,
              confidence: pred.confidence * 0.90
            })),
            confidence: 0.80
          }
        );
        break;

      case 'stable':
        scenarios.push(
          {
            id: `optimistic_${Date.now()}`,
            name: 'Breakthrough Growth',
            description: 'Strategic initiatives drive growth',
            assumptions: {
              marketGrowth: 1.10,
              customerRetention: 0.88,
              operationalEfficiency: 1.08
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 1.1,
              confidence: pred.confidence * 0.80
            })),
            confidence: 0.65
          },
          {
            id: `conservative_${Date.now()}`,
            name: 'Maintain Stability',
            description: 'Focus on operational efficiency',
            assumptions: {
              marketGrowth: 1.02,
              customerRetention: 0.82,
              operationalEfficiency: 1.02
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.98,
              confidence: pred.confidence * 0.90
            })),
            confidence: 0.85
          },
          {
            id: `risk_${Date.now()}`,
            name: 'Market Pressure',
            description: 'Increased competition affects performance',
            assumptions: {
              marketGrowth: 0.95,
              customerRetention: 0.75,
              operationalEfficiency: 0.95
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.85,
              confidence: pred.confidence * 0.85
            })),
            confidence: 0.80
          }
        );
        break;

      case 'decline':
        scenarios.push(
          {
            id: `optimistic_${Date.now()}`,
            name: 'Turnaround Success',
            description: 'Strategic interventions reverse decline',
            assumptions: {
              marketGrowth: 1.05,
              customerRetention: 0.80,
              operationalEfficiency: 1.05
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.95,
              confidence: pred.confidence * 0.70
            })),
            confidence: 0.60
          },
          {
            id: `conservative_${Date.now()}`,
            name: 'Stabilization',
            description: 'Halt decline and stabilize business',
            assumptions: {
              marketGrowth: 0.98,
              customerRetention: 0.70,
              operationalEfficiency: 0.98
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.75,
              confidence: pred.confidence * 0.80
            })),
            confidence: 0.75
          },
          {
            id: `risk_${Date.now()}`,
            name: 'Continued Decline',
            description: 'Decline continues without intervention',
            assumptions: {
              marketGrowth: 0.90,
              customerRetention: 0.60,
              operationalEfficiency: 0.85
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.50,
              confidence: pred.confidence * 0.85
            })),
            confidence: 0.85
          }
        );
        break;

      case 'crisis':
        scenarios.push(
          {
            id: `optimistic_${Date.now()}`,
            name: 'Emergency Recovery',
            description: 'Aggressive turnaround strategy',
            assumptions: {
              marketGrowth: 1.02,
              customerRetention: 0.65,
              operationalEfficiency: 1.10
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.70,
              confidence: pred.confidence * 0.60
            })),
            confidence: 0.50
          },
          {
            id: `conservative_${Date.now()}`,
            name: 'Damage Control',
            description: 'Minimize losses and preserve core business',
            assumptions: {
              marketGrowth: 0.95,
              customerRetention: 0.55,
              operationalEfficiency: 0.90
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.45,
              confidence: pred.confidence * 0.75
            })),
            confidence: 0.70
          },
          {
            id: `risk_${Date.now()}`,
            name: 'Business Failure',
            description: 'Worst-case scenario without immediate action',
            assumptions: {
              marketGrowth: 0.80,
              customerRetention: 0.40,
              operationalEfficiency: 0.70
            },
            predictions: predictions.map(pred => ({
              ...pred,
              prediction: pred.prediction * 0.25,
              confidence: pred.confidence * 0.80
            })),
            confidence: 0.85
          }
        );
        break;
    }

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
      // Step 1: Analyze business health (20%)
      setAnalysisProgress(10);
      console.log('Analyzing business health...');
      const businessHealth = analyzeBusinessHealth(data);
      setAnalysisProgress(20);

      // Step 2: Generate business predictions (50%)
      console.log('Generating business predictions...');
      const predictions = await generateBusinessPredictions(data, columns);
      console.log('Generated predictions:', predictions.length);
      setAnalysisProgress(50);

      // Step 3: Create realistic business scenarios (80%)
      console.log('Creating realistic business scenarios...');
      const scenarios = generateRealisticScenarios(predictions, businessHealth);
      console.log('Generated scenarios:', scenarios.length);
      setAnalysisProgress(80);

      // Step 4: Generate actionable insights (100%)
      console.log('Generating actionable insights...');
      const insights = generateActionableInsights(predictions, scenarios, businessHealth);
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
  }, [generateBusinessPredictions, generateRealisticScenarios, analyzeBusinessHealth]);

  return {
    isAnalyzing,
    analysisProgress,
    lastAnalysis,
    error,
    runPredictiveAnalysis
  };
};

// FIXED: Real customer growth calculation based on actual data
function calculateRealCustomerGrowth(data: DataRow[], businessHealth: BusinessHealthMetrics) {
  console.log('=== Real Customer Growth Analysis ===');
  
  // Parse signup dates
  const signupDates = data
    .map(row => ({ 
      date: new Date(row.SignupDate || ''), 
      id: row.CustomerID,
      churnRisk: Number(row.ChurnRiskScore || 0)
    }))
    .filter(item => !isNaN(item.date.getTime()) && item.id);

  if (signupDates.length === 0) {
    console.warn('No valid signup dates found');
    return {
      churnRate: 0.5,
      acquisitionRate: 0,
      predictedGrowth: -10, // Default pessimistic
      trend: 'decreasing' as const,
      confidence: 0.3,
      historicalTrend: 'insufficient_data',
      riskFactors: ['No signup data available']
    };
  }

  // Group by year and month for trend analysis
  const signupsByYear = groupBy(signupDates, item => item.date.getFullYear());
  const years = Object.keys(signupsByYear).map(Number).sort();
  
  console.log('Signups by year:', Object.fromEntries(
    years.map(year => [year, signupsByYear[year].length])
  ));

  // Calculate year-over-year growth
  let acquisitionTrend = 0;
  let historicalTrend = 'insufficient_data';
  
  if (years.length >= 2) {
    const latestYear = years[years.length - 1];
    const previousYear = years[years.length - 2];
    const currentYearSignups = signupsByYear[latestYear]?.length || 0;
    const previousYearSignups = signupsByYear[previousYear]?.length || 0;
    
    if (previousYearSignups > 0) {
      acquisitionTrend = (currentYearSignups - previousYearSignups) / previousYearSignups;
      
      if (acquisitionTrend > 0.1) historicalTrend = 'strong_growth';
      else if (acquisitionTrend > 0) historicalTrend = 'moderate_growth';
      else if (acquisitionTrend > -0.1) historicalTrend = 'stable';
      else if (acquisitionTrend > -0.3) historicalTrend = 'decline';
      else historicalTrend = 'steep_decline';
    }
  }

  // Calculate actual churn risk from data
  const churnScores = signupDates.map(item => item.churnRisk).filter(score => score > 0);
  const avgChurnRisk = churnScores.length > 0 ? 
    churnScores.reduce((a, b) => a + b, 0) / churnScores.length : 0.5;

  // Analyze activity patterns
  const currentYear = new Date().getFullYear();
  const activeCustomers = data.filter(row => {
    const lastOrder = new Date(row.LastOrderDate || '');
    return !isNaN(lastOrder.getTime()) && lastOrder.getFullYear() === currentYear;
  }).length;

  // Calculate realistic growth prediction
  const baseGrowthRate = acquisitionTrend;
  const churnImpact = -avgChurnRisk * 0.5; // Churn reduces growth
  const activityImpact = (activeCustomers / data.length - 0.5) * 0.3; // Activity level impact
  
  const predictedGrowth = (baseGrowthRate + churnImpact + activityImpact) * 100;
  
  // Determine trend direction
  const trend = predictedGrowth > 2 ? 'increasing' : predictedGrowth < -2 ? 'decreasing' : 'stable';
  
  // Calculate confidence based on data quality
  let confidence = 0.6; // Base confidence
  if (years.length >= 3) confidence += 0.1; // More historical data
  if (churnScores.length > data.length * 0.8) confidence += 0.1; // Good churn data coverage
  if (activeCustomers > 0) confidence += 0.1; // Recent activity data
  confidence = Math.min(0.9, confidence);

  // Identify risk factors
  const riskFactors: string[] = [];
  if (avgChurnRisk > 0.6) riskFactors.push('High average churn risk');
  if (acquisitionTrend < -0.2) riskFactors.push('Steep customer acquisition decline');
  if (activeCustomers / data.length < 0.3) riskFactors.push('Low customer activity level');
  if (years.length < 2) riskFactors.push('Limited historical data');

  console.log('Customer Growth Analysis Results:', {
    acquisitionTrend: (acquisitionTrend * 100).toFixed(1) + '%',
    avgChurnRisk: (avgChurnRisk * 100).toFixed(1) + '%',
    predictedGrowth: predictedGrowth.toFixed(1) + '%',
    trend,
    confidence: (confidence * 100).toFixed(1) + '%',
    historicalTrend,
    riskFactors
  });

  return {
    churnRate: avgChurnRisk,
    acquisitionRate: Math.max(acquisitionTrend, -0.5), // Cap at -50%
    predictedGrowth,
    trend,
    confidence,
    historicalTrend,
    riskFactors
  };
}

// Utility functions for calculations - Improved for accuracy
function calculateTrend(values: number[]) {
  const n = values.length;
  if (n < 2) return { slope: 0, average: 0, direction: 'stable' as const, growthRate: 0, seasonality: 0 };
  
  const x = Array.from({length: n}, (_, i) => i);
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  
  const ssXX = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
  const ssXY = x.reduce((sum, xi, i) => sum + (xi - meanX) * (values[i] - meanY), 0);
  const slope = ssXX > 0 ? ssXY / ssXX : 0;
  const average = meanY;
  
  const direction = slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable';
  const growthRate = average > 0 ? slope / average * 100 : 0;  // Percentage growth
  
  return { slope, average, direction, growthRate, seasonality: calculateSeasonality(values) };
}

function forecastValueWithBusinessHealth(values: number[], daysAhead: number, businessHealth: BusinessHealthMetrics) {
  const n = values.length;
  if (n < 2) return { value: 0, confidence: 0 };
  
  const trend = calculateTrend(values);
  let forecast = trend.average + (trend.slope * (n + daysAhead - 1));
  
  // Apply business health adjustments
  switch (businessHealth.overallHealth) {
    case 'crisis':
      forecast *= 0.4; // Severe reduction
      break;
    case 'decline':
      forecast *= 0.7; // Significant reduction
      break;
    case 'stable':
      forecast *= 0.95; // Slight reduction
      break;
    case 'growth':
      forecast *= 1.1; // Slight increase
      break;
  }

  // Adjust for customer activity level
  forecast *= (0.5 + businessHealth.activityLevel * 0.5);
  
  // Calculate confidence with business health consideration
  const ssTot = values.reduce((sum, v) => sum + Math.pow(v - trend.average, 2), 0);
  const predicted = Array.from({length: n}, (_, i) => trend.average + trend.slope * i);
  const ssRes = values.reduce((sum, v, i) => sum + Math.pow(v - predicted[i], 2), 0);
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  
  let confidence = Math.max(0.3, Math.min(0.9, r2));
  
  // Reduce confidence for poor business health
  if (businessHealth.overallHealth === 'crisis') confidence *= 0.6;
  else if (businessHealth.overallHealth === 'decline') confidence *= 0.8;
  
  return { value: Math.max(0, forecast), confidence };
}

function analyzeMarketTrendWithHealth(values: number[], businessHealth: BusinessHealthMetrics) {
  const trend = calculateTrend(values);
  const volatility = calculateVariance(values) / Math.pow(trend.average, 2);
  
  let forecast = trend.average + (trend.slope * 60); // 60-day forecast
  
  // Apply business health adjustments to market forecast
  const healthMultiplier = businessHealth.overallHealth === 'growth' ? 1.05 :
                          businessHealth.overallHealth === 'stable' ? 1.0 :
                          businessHealth.overallHealth === 'decline' ? 0.9 : 0.75;
  
  forecast *= healthMultiplier;
  
  let confidence = Math.max(0.4, 1 - volatility);
  
  // Adjust confidence based on business health stability
  confidence *= (0.7 + businessHealth.revenueStability * 0.3);
  
  return {
    forecast: Math.max(0, forecast),
    direction: trend.direction,
    confidence: Math.min(0.9, confidence),
    volatility,
    cyclical: calculateSeasonality(values) > 0.3,
    healthAdjustment: healthMultiplier
  };
}

function validatePredictions(predictions: BusinessPrediction[], data: DataRow[], businessHealth: BusinessHealthMetrics) {
  console.log('=== Validating Predictions Against Reality ===');
  
  const currentYear = new Date().getFullYear();
  const activeCustomers = data.filter(row => {
    const lastOrder = new Date(row.LastOrderDate || '');
    return !isNaN(lastOrder.getTime()) && lastOrder.getFullYear() === currentYear;
  }).length;
  
  const totalCustomers = data.length;
  const activityRate = totalCustomers > 0 ? activeCustomers / totalCustomers : 0;
  
  predictions.forEach(pred => {
    let adjustmentFactor = 1;
    const warnings: string[] = [];
    
    // Validate customer predictions
    if (pred.type === 'customer') {
      if (pred.trend === 'increasing' && businessHealth.customerAcquisitionTrend < -0.1) {
        adjustmentFactor *= 0.4;
        warnings.push('Growth prediction conflicts with negative acquisition trend');
      }
      
      if (businessHealth.churnRisk > 0.6 && pred.prediction > 0) {
        adjustmentFactor *= 0.6;
        warnings.push('High churn risk not adequately reflected');
      }
      
      if (activityRate < 0.3 && pred.trend === 'increasing') {
        adjustmentFactor *= 0.5;
        warnings.push('Low activity rate contradicts growth prediction');
      }
    }
    
    // Validate revenue predictions
    if (pred.type === 'revenue') {
      if (activityRate < 0.4) {
        adjustmentFactor *= (0.5 + activityRate);
        warnings.push('Revenue prediction adjusted for low customer activity');
      }
      
      if (businessHealth.overallHealth === 'decline' && pred.trend === 'increasing') {
        adjustmentFactor *= 0.6;
        warnings.push('Revenue growth unlikely given business decline');
      }
    }
    
    // Apply adjustments
    if (adjustmentFactor < 1) {
      pred.prediction *= adjustmentFactor;
      pred.confidence *= 0.7; // Reduce confidence for adjusted predictions
      pred.metadata.validationWarnings = warnings;
      pred.metadata.adjustmentFactor = adjustmentFactor;
      
      console.warn(`Prediction ${pred.title} adjusted by ${((1-adjustmentFactor)*100).toFixed(1)}%:`, warnings);
    }
  });
}

function calculateSeasonality(values: number[]): number {
  if (values.length < 12) return 0;
  
  let maxCorr = 0;
  for (let lag = 1; lag <= Math.min(30, Math.floor(values.length / 2)); lag++) {
    const corr = autocorrelation(values, lag);
    maxCorr = Math.max(maxCorr, Math.abs(corr));
  }
  return maxCorr;
}

function autocorrelation(values: number[], lag: number): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  let num = 0;
  let den1 = 0;
  let den2 = 0;
  
  for (let i = 0; i < values.length - lag; i++) {
    num += (values[i] - mean) * (values[i + lag] - mean);
    den1 += Math.pow(values[i] - mean, 2);
    den2 += Math.pow(values[i + lag] - mean, 2);
  }
  
  return den1 > 0 && den2 > 0 ? num / Math.sqrt(den1 * den2) : 0;
}

function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (values.length - 1);
}

function calculateMean(values: number[]): number {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function groupBy<T, K extends keyof any>(array: T[], keyFunc: (item: T) => K): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFunc(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

function generateActionableInsights(
  predictions: BusinessPrediction[],
  scenarios: BusinessScenario[],
  businessHealth: BusinessHealthMetrics
): Array<{id: string; title: string; description: string; actionable: boolean; priority: 'high' | 'medium' | 'low'}> {
  const insights = [];
  
  // Business health insights
  switch (businessHealth.overallHealth) {
    case 'crisis':
      insights.push({
        id: `insight_crisis_${Date.now()}`,
        title: 'URGENT: Business Crisis Detected',
        description: `Customer acquisition declined by ${(Math.abs(businessHealth.customerAcquisitionTrend) * 100).toFixed(1)}% with ${(businessHealth.churnRisk * 100).toFixed(1)}% average churn risk. Immediate intervention required.`,
        actionable: true,
        priority: 'high' as const
      });
      break;
      
    case 'decline':
      insights.push({
        id: `insight_decline_${Date.now()}`,
        title: 'Business Decline Alert',
        description: `Negative customer growth trend of ${(businessHealth.customerAcquisitionTrend * 100).toFixed(1)}%. Focus on retention and value optimization.`,
        actionable: true,
        priority: 'high' as const
      });
      break;
      
    case 'stable':
      insights.push({
        id: `insight_stable_${Date.now()}`,
        title: 'Growth Opportunity',
        description: `Business is stable with ${(businessHealth.activityLevel * 100).toFixed(1)}% customer activity. Consider growth initiatives.`,
        actionable: true,
        priority: 'medium' as const
      });
      break;
      
    case 'growth':
      insights.push({
        id: `insight_growth_${Date.now()}`,
        title: 'Scale Growth Strategy',
        description: `Positive growth momentum with ${(businessHealth.customerAcquisitionTrend * 100).toFixed(1)}% acquisition growth. Scale successful strategies.`,
        actionable: true,
        priority: 'medium' as const
      });
      break;
  }
  
  // Customer insights
  const customerPredictions = predictions.filter(p => p.type === 'customer');
  if (customerPredictions.length > 0) {
    const customerPred = customerPredictions[0];
    if (customerPred.metadata.riskFactors && customerPred.metadata.riskFactors.length > 0) {
      insights.push({
        id: `insight_customer_risk_${Date.now()}`,
        title: 'Customer Risk Factors Identified',
        description: `Key risks: ${customerPred.metadata.riskFactors.join(', ')}. Address these factors to improve customer outlook.`,
        actionable: true,
        priority: 'high' as const
      });
    }
  }
  
  // Revenue insights
  const revenuePredictions = predictions.filter(p => p.type === 'revenue');
  if (revenuePredictions.length > 0) {
    const revenueGrowth = revenuePredictions.reduce((sum, p) => sum + (p.metadata.growthRate || 0), 0) / revenuePredictions.length;
    
    if (revenueGrowth < -5) {
      insights.push({
        id: `insight_revenue_decline_${Date.now()}`,
        title: 'Revenue Decline Risk',
        description: `Average revenue decline of ${Math.abs(revenueGrowth).toFixed(1)}%. Review pricing strategy and customer value propositions.`,
        actionable: true,
        priority: 'high' as const
      });
    }
  }
  
  // Activity level insights
  if (businessHealth.activityLevel < 0.4) {
    insights.push({
      id: `insight_activity_${Date.now()}`,
      title: 'Low Customer Activity Warning',
      description: `Only ${(businessHealth.activityLevel * 100).toFixed(1)}% of customers are active. Implement re-engagement campaigns.`,
      actionable: true,
      priority: 'high' as const
    });
  }
  
  return insights;
}

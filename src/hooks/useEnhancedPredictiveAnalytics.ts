
import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { AdvancedForecasting, ForecastingConfig, ForecastResult } from '@/lib/ml/advancedForecasting';
import { BusinessPrediction, BusinessScenario, BusinessHealthMetrics } from './usePredictiveAnalytics';
import { predictQualityTrend, predictDataVolume } from '@/lib/ml/predictionUtils';
import { PreAnalysisEngine, PreAnalysisResult } from '@/lib/ml/preAnalysisLayer';
import { DataValidationEngine, ValidationResult } from '@/lib/ml/dataValidation';
import { DynamicScenarioGenerator } from '@/lib/ml/dynamicScenarioGenerator';

export interface EnhancedPredictiveAnalyticsResult {
  predictions: BusinessPrediction[];
  scenarios: BusinessScenario[];
  insights: Array<{
    id: string;
    title: string;
    description: string;
    actionable: boolean;
    priority: 'high' | 'medium' | 'low';
    confidence: number;
    impact: number;
  }>;
  forecastResults: Map<string, ForecastResult>;
  businessHealth: BusinessHealthMetrics;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    implementation: string;
    expectedImpact: number;
    timeframe: string;
  }>;
  preAnalysis: PreAnalysisResult;
  validationResults: {
    dataQuality: ValidationResult;
    statisticalMetrics: ValidationResult;
    overallConfidence: number;
  };
}

export const useEnhancedPredictiveAnalytics = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeBusinessHealth = useCallback((data: DataRow[]): BusinessHealthMetrics => {
    console.log('=== Enhanced Business Health Analysis ===');
    
    // Extract temporal data
    const dateColumns = ['SignupDate', 'LastOrderDate', 'CreatedAt', 'UpdatedAt'];
    const revenueColumns = ['TotalSpend', 'Revenue', 'Amount', 'Sales'];
    const activityColumns = ['LastActive', 'LastLogin', 'LastPurchase'];

    // Analyze customer acquisition trends
    const signupDates = data
      .map(row => {
        const dateCol = dateColumns.find(col => row[col]);
        return dateCol ? { date: new Date(row[dateCol] as string), id: row.CustomerID } : null;
      })
      .filter(item => item && !isNaN(item.date.getTime()))
      .sort((a, b) => a!.date.getTime() - b!.date.getTime());

    let customerAcquisitionTrend = 0;
    if (signupDates.length >= 10) {
      const monthlySignups = groupByMonth(signupDates.map(s => s!.date));
      const signupValues = Object.values(monthlySignups);
      
      if (signupValues.length >= 3) {
        try {
          const forecastResult = AdvancedForecasting.forecast(signupValues, {
            periods: 3,
            method: 'linear',
            confidenceLevel: 0.95
          });
          
          customerAcquisitionTrend = forecastResult.trend === 'increasing' ? 0.1 : 
                                   forecastResult.trend === 'decreasing' ? -0.1 : 0;
        } catch (error) {
          console.warn('Failed to forecast customer acquisition:', error);
        }
      }
    }

    // Analyze churn risk
    const churnScores = data
      .map(row => Number(row.ChurnRiskScore || 0))
      .filter(score => score > 0);
    const avgChurnRisk = churnScores.length > 0 ? 
      churnScores.reduce((a, b) => a + b, 0) / churnScores.length : 0.5;

    // Analyze revenue stability
    const revenueValues = data
      .map(row => {
        const revenueCol = revenueColumns.find(col => row[col]);
        return revenueCol ? Number(row[revenueCol]) : 0;
      })
      .filter(val => val > 0);

    let revenueStability = 0.5;
    if (revenueValues.length >= 10) {
      const forecastResult = AdvancedForecasting.forecast(revenueValues, {
        periods: 5,
        method: 'exponential',
        confidenceLevel: 0.95
      });
      revenueStability = Math.max(0, Math.min(1, forecastResult.r2Score || 0));
    }

    // Analyze activity level
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const activeCustomers = data.filter(row => {
      const activityCol = activityColumns.find(col => row[col]);
      if (!activityCol) return false;
      const lastActivity = new Date(row[activityCol] as string);
      return !isNaN(lastActivity.getTime()) && lastActivity >= thirtyDaysAgo;
    }).length;

    const activityLevel = data.length > 0 ? activeCustomers / data.length : 0;

    // Determine overall business health
    let overallHealth: 'growth' | 'stable' | 'decline' | 'crisis';
    const healthScore = (
      (customerAcquisitionTrend + 0.5) * 0.3 +
      (1 - avgChurnRisk) * 0.25 +
      revenueStability * 0.25 +
      activityLevel * 0.2
    );

    if (healthScore > 0.75) overallHealth = 'growth';
    else if (healthScore > 0.5) overallHealth = 'stable';
    else if (healthScore > 0.25) overallHealth = 'decline';
    else overallHealth = 'crisis';

    console.log('Enhanced Business Health Metrics:', {
      customerAcquisitionTrend: (customerAcquisitionTrend * 100).toFixed(1) + '%',
      avgChurnRisk: (avgChurnRisk * 100).toFixed(1) + '%',
      revenueStability: (revenueStability * 100).toFixed(1) + '%',
      activityLevel: (activityLevel * 100).toFixed(1) + '%',
      healthScore: (healthScore * 100).toFixed(1) + '%',
      overallHealth
    });

    return {
      customerAcquisitionTrend: customerAcquisitionTrend || 0,
      churnRisk: avgChurnRisk,
      revenueStability: revenueStability,
      activityLevel: activityLevel,
      overallHealth
    };
  }, []);

  const generateEnhancedPredictions = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[],
    preAnalysis?: PreAnalysisResult
  ): Promise<{ predictions: BusinessPrediction[]; forecastResults: Map<string, ForecastResult> }> => {
    const predictions: BusinessPrediction[] = [];
    const forecastResults = new Map<string, ForecastResult>();
    
    console.log('=== Enhanced Prediction Generation ===');
    console.log('Available columns:', columns.map(c => ({ name: c.name, type: c.type })));

    // Enhanced revenue forecasting
    const revenueColumns = columns.filter(col => 
      col.type === 'numeric' && (
        col.name.toLowerCase().includes('revenue') ||
        col.name.toLowerCase().includes('sales') ||
        col.name.toLowerCase().includes('income') ||
        col.name.toLowerCase().includes('total') ||
        col.name.toLowerCase().includes('spend')
      )
    );

    for (const column of revenueColumns) {
      const values = data.map(row => Number(row[column.name])).filter(val => !isNaN(val) && val > 0);
      
      if (values.length >= 10) {
        console.log(`Forecasting ${column.name} with ${values.length} data points`);
        
        // Try multiple forecasting methods and pick the best one
        const methods: ForecastingConfig['method'][] = ['linear', 'exponential', 'seasonal'];
        let bestForecast: ForecastResult | null = null;
        let bestMethod = 'linear';

        for (const method of methods) {
          try {
            const forecast = AdvancedForecasting.forecast(values, {
              periods: 30,
              seasonalPeriods: Math.min(12, Math.floor(values.length / 4)),
              confidenceLevel: 0.95,
              method
            });

            if (!bestForecast || (forecast.r2Score || 0) > (bestForecast.r2Score || 0)) {
              bestForecast = forecast;
              bestMethod = method;
            }
          } catch (error) {
            console.warn(`Forecasting method ${method} failed:`, error);
          }
        }

        if (bestForecast) {
          forecastResults.set(column.name, bestForecast);
          
          const avgPrediction = bestForecast.predictions.reduce((sum, val) => sum + val, 0) / bestForecast.predictions.length;
          
          predictions.push({
            id: `revenue_${column.name}_${Date.now()}`,
            type: 'revenue',
            title: `${column.name} Advanced Forecast`,
            description: `30-day ${column.name.toLowerCase()} forecast using ${bestMethod} method with ${((bestForecast.r2Score || 0) * 100).toFixed(1)}% accuracy`,
            prediction: avgPrediction,
            unit: 'currency',
            confidence: Math.max(0.3, bestForecast.r2Score || 0),
            timeframe: '30 days',
            trend: bestForecast.trend,
            impact: avgPrediction > values[values.length - 1] * 1.1 ? 'high' : 
                   avgPrediction > values[values.length - 1] * 0.9 ? 'medium' : 'low',
            metadata: {
              forecastMethod: bestMethod,
              r2Score: bestForecast.r2Score,
              mae: bestForecast.mae,
              mape: bestForecast.mape,
              seasonality: bestForecast.seasonality,
              outliers: bestForecast.metadata?.outliers,
              trendStrength: bestForecast.metadata?.trendStrength,
              confidenceInterval: {
                lower: bestForecast.confidenceIntervals?.lower?.[0],
                upper: bestForecast.confidenceIntervals?.upper?.[0]
              }
            },
            timestamp: new Date()
          });
        }
      }
    }

    // Enhanced customer analytics
    const customerIdColumns = columns.filter(col => 
      col.name.toLowerCase().includes('customer') && col.type === 'text'
    );

    if (customerIdColumns.length > 0) {
      const uniqueCustomers = new Set(data.map(row => row[customerIdColumns[0].name])).size;
      const monthlyCustomers = extractMonthlyCustomerCounts(data, customerIdColumns[0].name);
      
      if (monthlyCustomers.length >= 6) {
        const customerForecast = AdvancedForecasting.forecast(monthlyCustomers, {
          periods: 12,
          seasonalPeriods: 12,
          confidenceLevel: 0.90,
          method: 'seasonal'
        });

        forecastResults.set('customer_growth', customerForecast);

        predictions.push({
          id: `customers_enhanced_${Date.now()}`,
          type: 'customer',
          title: 'Customer Growth Forecast',
          description: `Advanced customer growth prediction with ${((customerForecast.r2Score || 0) * 100).toFixed(1)}% model accuracy`,
          prediction: (customerForecast.predictions[11] / uniqueCustomers - 1) * 100, // 12-month growth rate
          unit: 'percentage',
          confidence: customerForecast.r2Score || 0,
          timeframe: '12 months',
          trend: customerForecast.trend,
          impact: 'high',
          metadata: {
            currentCustomers: uniqueCustomers,
            forecastMethod: 'seasonal',
            seasonality: customerForecast.seasonality,
            r2Score: customerForecast.r2Score,
            mape: customerForecast.mape,
            monthlyForecast: customerForecast.predictions
          },
          timestamp: new Date()
        });
      }
    }

    // Data quality predictions
    const qualityTrend = predictQualityTrend(85, data.length);
    predictions.push({
      id: `data_quality_${Date.now()}`,
      type: 'risk',
      title: 'Data Quality Trend',
      description: 'Predicted data quality degradation risk based on dataset size and complexity',
      prediction: qualityTrend.r2Score ? qualityTrend.r2Score * 100 : 0,
      unit: 'percentage',
      confidence: qualityTrend.confidence,
      timeframe: '60 days',
      trend: (qualityTrend.r2Score || 0) < 0.2 ? 'increasing' : 'decreasing',
      impact: (qualityTrend.r2Score || 0) > 0.5 ? 'high' : (qualityTrend.r2Score || 0) > 0.25 ? 'medium' : 'low',
      metadata: {
        currentQuality: 85,
        dataSize: data.length,
        algorithm: 'statistical_trend_analysis'
      },
      timestamp: new Date()
    });

    return { predictions, forecastResults };
  }, []);

  const generateActionableRecommendations = useCallback((
    predictions: BusinessPrediction[],
    businessHealth: BusinessHealthMetrics,
    forecastResults: Map<string, ForecastResult>
  ) => {
    const recommendations = [];

    // Revenue optimization recommendations
    const revenuePredictions = predictions.filter(p => p.type === 'revenue');
    for (const pred of revenuePredictions) {
      if (pred.trend === 'decreasing' || pred.confidence < 0.7) {
        recommendations.push({
          id: `revenue_opt_${Date.now()}`,
          title: 'Revenue Optimization Strategy',
          description: `${pred.title} shows ${pred.trend} trend with ${(pred.confidence * 100).toFixed(1)}% confidence. Implement pricing optimization and customer retention strategies.`,
          implementation: 'Review pricing strategy, analyze customer segments, implement targeted promotions',
          expectedImpact: pred.impact === 'high' ? 0.15 : pred.impact === 'medium' ? 0.10 : 0.05,
          timeframe: '30-60 days'
        });
      }
    }

    // Customer growth recommendations
    if (businessHealth.customerAcquisitionTrend < 0) {
      recommendations.push({
        id: `customer_growth_${Date.now()}`,
        title: 'Customer Acquisition Enhancement',
        description: `Customer acquisition declined by ${(Math.abs(businessHealth.customerAcquisitionTrend) * 100).toFixed(1)}%. Focus on marketing optimization and referral programs.`,
        implementation: 'A/B test marketing channels, implement referral incentives, optimize onboarding flow',
        expectedImpact: 0.20,
        timeframe: '45-90 days'
      });
    }

    // Data quality recommendations
    const qualityPredictions = predictions.filter(p => p.type === 'risk');
    for (const pred of qualityPredictions) {
      if (pred.prediction > 30) {
        recommendations.push({
          id: `data_quality_${Date.now()}`,
          title: 'Data Quality Improvement',
          description: `Data quality risk of ${pred.prediction}% detected. Implement automated data validation and cleansing processes.`,
          implementation: 'Set up data validation rules, implement automated cleansing, establish data governance policies',
          expectedImpact: 0.25,
          timeframe: '30-45 days'
        });
      }
    }

    // Business health-specific recommendations
    switch (businessHealth.overallHealth) {
      case 'crisis':
        recommendations.push({
          id: `crisis_response_${Date.now()}`,
          title: 'Crisis Response Plan',
          description: 'Business in crisis state. Immediate intervention required to stabilize operations.',
          implementation: 'Emergency cost reduction, customer retention campaigns, operational efficiency improvements',
          expectedImpact: 0.30,
          timeframe: '14-30 days'
        });
        break;
      
      case 'decline':
        recommendations.push({
          id: `turnaround_strategy_${Date.now()}`,
          title: 'Business Turnaround Strategy',
          description: 'Declining metrics detected. Implement comprehensive turnaround strategy.',
          implementation: 'Market analysis, product optimization, customer feedback integration, process improvements',
          expectedImpact: 0.20,
          timeframe: '60-90 days'
        });
        break;
        
      case 'growth':
        recommendations.push({
          id: `scale_growth_${Date.now()}`,
          title: 'Scale Growth Initiatives',
          description: 'Positive growth momentum detected. Scale successful strategies and explore new opportunities.',
          implementation: 'Expand successful marketing channels, develop new products, enter new markets',
          expectedImpact: 0.25,
          timeframe: '90-180 days'
        });
        break;
    }

    return recommendations;
  }, []);

  const runEnhancedPredictiveAnalysis = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<EnhancedPredictiveAnalyticsResult> => {
    console.log('Starting enhanced predictive analysis with:', { dataRows: data.length, columns: columns.length });
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      // Phase 1: Pre-Analysis Layer (20%)
      console.log('Phase 1: Pre-Analysis Layer');
      setAnalysisProgress(5);
      const preAnalysis = await PreAnalysisEngine.analyzeDataset(data, columns);
      setAnalysisProgress(20);

      // Phase 2: Data Validation (30%)
      console.log('Phase 2: Data Validation');
      setAnalysisProgress(25);
      const dataQuality = DataValidationEngine.validateDataQuality(data, columns);
      
      if (!dataQuality.isValid && dataQuality.errors.length > 0) {
        console.warn('Data quality issues detected:', dataQuality.errors);
      }
      setAnalysisProgress(30);

      // Phase 3: Enhanced Predictions with Validation (60%)
      console.log('Phase 3: Enhanced Predictions');
      setAnalysisProgress(35);
      const { predictions, forecastResults } = await generateEnhancedPredictions(data, columns, preAnalysis);
      
      // Validate statistical metrics
      const statisticalMetrics = validatePredictionMetrics(predictions);
      setAnalysisProgress(60);

      // Phase 4: Dynamic Scenario Generation (75%)
      console.log('Phase 4: Dynamic Scenario Generation');
      setAnalysisProgress(65);
      const scenarios = DynamicScenarioGenerator.generateAdaptiveScenarios(predictions, preAnalysis);
      setAnalysisProgress(75);

      // Phase 5: Business Health Analysis (85%)
      console.log('Phase 5: Business Health Analysis');
      setAnalysisProgress(80);
      const businessHealth = analyzeEnhancedBusinessHealth(data, preAnalysis);
      setAnalysisProgress(85);

      // Phase 6: Context-Aware Recommendations (95%)
      console.log('Phase 6: Context-Aware Recommendations');
      setAnalysisProgress(90);
      const insights = generateContextualInsights(predictions, preAnalysis, forecastResults);
      const recommendations = generateContextAwareRecommendations(predictions, businessHealth, preAnalysis, forecastResults);
      setAnalysisProgress(95);

      // Calculate overall confidence
      const overallConfidence = DataValidationEngine.calculateAdaptiveConfidence(
        dataQuality,
        statisticalMetrics,
        data.length,
        preAnalysis.trendAnalysis.trendStrength
      );

      setAnalysisProgress(100);
      setLastAnalysis(new Date());

      console.log('Enhanced predictive analysis completed successfully');
      console.log('Overall confidence:', (overallConfidence * 100).toFixed(1) + '%');
      
      return {
        predictions,
        scenarios,
        insights,
        forecastResults,
        businessHealth,
        recommendations,
        preAnalysis,
        validationResults: {
          dataQuality,
          statisticalMetrics,
          overallConfidence
        }
      };

    } catch (err) {
      console.error('Enhanced predictive analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Enhanced analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  }, []);

  // Enhanced helper methods with validation
  const validatePredictionMetrics = (predictions: BusinessPrediction[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    predictions.forEach(prediction => {
      // Validate confidence is within bounds
      if (prediction.confidence < 0 || prediction.confidence > 1) {
        errors.push(`Invalid confidence for ${prediction.title}: ${prediction.confidence}`);
      }

      // Validate prediction values make sense
      if (prediction.prediction < 0 && prediction.type === 'revenue') {
        errors.push(`Negative revenue prediction for ${prediction.title}`);
      }

      // Check metadata if available
      if (prediction.metadata?.r2Score) {
        const metricValidation = DataValidationEngine.validateStatisticalMetrics({
          r2Score: prediction.metadata.r2Score,
          confidence: prediction.confidence,
          mae: prediction.metadata.mae,
          mape: prediction.metadata.mape
        });
        
        errors.push(...metricValidation.errors);
        warnings.push(...metricValidation.warnings);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence: Math.max(0.1, 1 - (errors.length * 0.3 + warnings.length * 0.1)),
      qualityScore: Math.max(0.1, 1 - (errors.length * 0.5 + warnings.length * 0.2))
    };
  };

  const analyzeEnhancedBusinessHealth = (data: DataRow[], preAnalysis: PreAnalysisResult): BusinessHealthMetrics => {
    // Use pre-analysis insights to inform business health
    const baseHealth = analyzeBusinessHealth(data);
    
    // Adjust based on pre-analysis findings
    let adjustedHealth = { ...baseHealth };
    
    // Factor in data quality
    if (preAnalysis.dataHealth.score < 0.5) {
      adjustedHealth.overallHealth = adjustedHealth.overallHealth === 'growth' ? 'stable' : 
                                    adjustedHealth.overallHealth === 'stable' ? 'decline' : 
                                    adjustedHealth.overallHealth;
    }
    
    // Factor in trend analysis
    switch (preAnalysis.trendAnalysis.primaryTrend) {
      case 'strong_negative':
        adjustedHealth.overallHealth = 'crisis';
        break;
      case 'weak_negative':
        adjustedHealth.overallHealth = adjustedHealth.overallHealth === 'growth' ? 'stable' : 'decline';
        break;
      case 'strong_positive':
        adjustedHealth.overallHealth = adjustedHealth.overallHealth === 'crisis' ? 'decline' : 'growth';
        break;
    }
    
    return adjustedHealth;
  };

  const generateContextualInsights = (
    predictions: BusinessPrediction[], 
    preAnalysis: PreAnalysisResult, 
    forecastResults: Map<string, ForecastResult>
  ) => {
    const insights = [];
    
    // Data-driven insights based on pre-analysis
    if (preAnalysis.dataHealth.status === 'poor' || preAnalysis.dataHealth.status === 'critical') {
      insights.push({
        id: `data_health_${Date.now()}`,
        title: 'Data Quality Issues Detected',
        description: `Data health is ${preAnalysis.dataHealth.status}. ${preAnalysis.dataHealth.issues.join('. ')}.`,
        actionable: true,
        priority: 'high' as const,
        confidence: 0.9,
        impact: 0.3
      });
    }
    
    // Trend-based insights
    if (preAnalysis.trendAnalysis.primaryTrend.includes('negative')) {
      insights.push({
        id: `trend_warning_${Date.now()}`,
        title: 'Declining Performance Trend',
        description: `${preAnalysis.trendAnalysis.primaryTrend.replace('_', ' ')} trend detected with ${(preAnalysis.trendAnalysis.volatility * 100).toFixed(1)}% volatility.`,
        actionable: true,
        priority: 'high' as const,
        confidence: preAnalysis.predictiveReadiness.confidence,
        impact: 0.4
      });
    }
    
    // Anomaly insights
    if (preAnalysis.anomalies.detected && preAnalysis.anomalies.severity === 'high') {
      insights.push({
        id: `anomaly_alert_${Date.now()}`,
        title: 'Data Anomalies Detected',
        description: `${preAnalysis.anomalies.count} anomalies detected in ${preAnalysis.anomalies.affectedColumns.join(', ')}. This may indicate data quality issues or unusual business events.`,
        actionable: true,
        priority: 'medium' as const,
        confidence: 0.8,
        impact: 0.2
      });
    }
    
    return insights;
  };

  const generateContextAwareRecommendations = (
    predictions: BusinessPrediction[],
    businessHealth: BusinessHealthMetrics,
    preAnalysis: PreAnalysisResult,
    forecastResults: Map<string, ForecastResult>
  ) => {
    const recommendations = [];
    
    // Context-aware recommendations based on current state
    switch (preAnalysis.trendAnalysis.primaryTrend) {
      case 'strong_negative':
      case 'weak_negative':
        recommendations.push({
          id: `crisis_intervention_${Date.now()}`,
          title: 'Crisis Intervention Required',
          description: 'Declining trends detected. Immediate stabilization efforts needed before optimization.',
          implementation: 'Focus on core operations, reduce costs, retain customers, analyze root causes',
          expectedImpact: 0.25,
          timeframe: '30-60 days'
        });
        break;
        
      case 'stable':
        if (preAnalysis.predictiveReadiness.score > 0.7) {
          recommendations.push({
            id: `optimization_opportunity_${Date.now()}`,
            title: 'Optimization Opportunities',
            description: 'Stable trends with good data quality enable optimization initiatives.',
            implementation: 'Process improvement, efficiency gains, incremental growth strategies',
            expectedImpact: 0.15,
            timeframe: '60-90 days'
          });
        }
        break;
        
      case 'strong_positive':
      case 'weak_positive':
        recommendations.push({
          id: `scale_growth_${Date.now()}`,
          title: 'Scale Successful Strategies',
          description: 'Positive trends detected. Scale successful initiatives while monitoring sustainability.',
          implementation: 'Increase investment in successful channels, expand capacity, monitor quality',
          expectedImpact: 0.30,
          timeframe: '90-180 days'
        });
        break;
    }
    
    // Data quality recommendations
    if (preAnalysis.dataHealth.score < 0.7) {
      recommendations.push({
        id: `data_quality_${Date.now()}`,
        title: 'Improve Data Foundation',
        description: 'Poor data quality limits prediction accuracy and decision-making capability.',
        implementation: preAnalysis.dataHealth.recommendations.join(', '),
        expectedImpact: 0.20,
        timeframe: '45-90 days'
      });
    }
    
    return recommendations;
  };

  // Helper methods
  const groupByMonth = (dates: Date[]) => {
    const grouped: { [key: string]: number } = {};
    dates.forEach(date => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped[monthKey] = (grouped[monthKey] || 0) + 1;
    });
    return grouped;
  };

  const extractMonthlyCustomerCounts = (data: DataRow[], customerColumn: string): number[] => {
    const signupDates = data
      .map(row => ({ date: new Date(row.SignupDate as string || ''), customer: row[customerColumn] }))
      .filter(item => !isNaN(item.date.getTime()) && item.customer);

    const monthlyGroups = groupByMonth(signupDates.map(s => s.date));
    return Object.values(monthlyGroups);
  };

  const generateEnhancedScenarios = (
    predictions: BusinessPrediction[],
    businessHealth: BusinessHealthMetrics,
    forecastResults: Map<string, ForecastResult>
  ): BusinessScenario[] => {
    // Return simplified scenarios for now to avoid complexity
    return [
      {
        id: 'enhanced_optimistic',
        name: 'Enhanced Optimistic',
        title: 'AI-Driven Growth Strategy',
        description: 'Leverage ML insights for aggressive growth',
        confidence: 0.75,
        assumptions: {
          marketGrowth: 1.2,
          customerRetention: 0.9,
          operationalEfficiency: 1.15
        },
        predictions: predictions.map(p => ({
          type: p.type,
          prediction: p.prediction * 1.25,
          unit: p.unit
        })),
        potentialImpact: 0.25,
        riskLevel: 'medium' as const,
        recommendations: ['Implement AI recommendations', 'Scale successful channels', 'Monitor key metrics']
      }
    ];
  };


  return {
    isAnalyzing,
    analysisProgress,
    lastAnalysis,
    error,
    runEnhancedPredictiveAnalysis
  };
};

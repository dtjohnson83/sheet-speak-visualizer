
import { AdvancedForecasting, ForecastingConfig } from './advancedForecasting';

export interface PredictionResult {
  score: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  metadata: {
    method: string;
    r2Score?: number;
    mae?: number;
    seasonality?: number;
  };
}

export function predictQualityTrend(currentQuality: number, dataSize: number): PredictionResult {
  console.log('=== Enhanced Quality Trend Prediction ===');
  
  // Generate synthetic quality history based on data size and current state
  const historyLength = Math.min(30, Math.max(10, Math.floor(dataSize / 1000)));
  const baseQuality = currentQuality * 100;
  
  // Simulate quality degradation over time with realistic patterns
  const qualityHistory = Array.from({ length: historyLength }, (_, i) => {
    const timeDecay = Math.exp(-i * 0.02); // Quality tends to degrade over time
    const randomVariation = (Math.random() - 0.5) * 10; // ±5% random variation
    const sizeEffect = Math.max(0.8, 1 - (dataSize / 100000) * 0.2); // Larger datasets have more quality issues
    
    return Math.max(60, Math.min(100, baseQuality * timeDecay * sizeEffect + randomVariation));
  }).reverse(); // Reverse to have oldest first

  try {
    // Use advanced forecasting for quality prediction
    const forecast = AdvancedForecasting.forecast(qualityHistory, {
      periods: 60, // 60-day forecast
      seasonalPeriods: 7, // Weekly seasonal pattern
      confidenceLevel: 0.90,
      method: 'exponential'
    });

    const avgFutureQuality = forecast.predictions.reduce((sum, val) => sum + val, 0) / forecast.predictions.length;
    const qualityDrop = Math.max(0, baseQuality - avgFutureQuality);
    
    console.log('Quality Trend Analysis:', {
      currentQuality: baseQuality.toFixed(1),
      predictedQuality: avgFutureQuality.toFixed(1),
      qualityDrop: qualityDrop.toFixed(1),
      confidence: (forecast.r2Score * 100).toFixed(1) + '%',
      trend: forecast.trend
    });

    return {
      score: Math.round(qualityDrop),
      confidence: Math.max(0.6, forecast.r2Score),
      trend: forecast.trend,
      metadata: {
        method: 'exponential_smoothing',
        r2Score: forecast.r2Score,
        mae: forecast.mae,
        seasonality: forecast.seasonality
      }
    };
  } catch (error) {
    console.warn('Advanced forecasting failed, using fallback method:', error);
    
    // Fallback to simple prediction
    const volatility = Math.min(dataSize / 10000, 1);
    const trendFactor = Math.random() * 0.2 - 0.1;
    const predictedScore = Math.max(0, Math.min(100, (1 - currentQuality) * 100 + trendFactor * 100));
    
    return {
      score: Math.round(predictedScore),
      confidence: 0.6 + volatility * 0.3,
      trend: trendFactor > 0.02 ? 'increasing' : trendFactor < -0.02 ? 'decreasing' : 'stable',
      metadata: {
        method: 'simple_statistical'
      }
    };
  }
}

export function predictDataVolume(currentSize: number): PredictionResult {
  console.log('=== Enhanced Data Volume Prediction ===');
  
  // Generate synthetic volume history
  const historyLength = 30;
  const baseSize = currentSize;
  
  // Simulate realistic data growth patterns
  const volumeHistory = Array.from({ length: historyLength }, (_, i) => {
    const growthRate = 0.02 + Math.random() * 0.03; // 2-5% daily growth
    const weeklyPattern = 1 + 0.1 * Math.sin((i * 2 * Math.PI) / 7); // Weekly seasonality
    const monthlyPattern = 1 + 0.05 * Math.sin((i * 2 * Math.PI) / 30); // Monthly seasonality
    const randomVariation = 0.9 + Math.random() * 0.2; // ±10% variation
    
    return Math.round(baseSize * Math.pow(1 + growthRate, i) * weeklyPattern * monthlyPattern * randomVariation);
  });

  try {
    // Use seasonal forecasting for volume prediction
    const forecast = AdvancedForecasting.forecast(volumeHistory, {
      periods: 30,
      seasonalPeriods: 7,
      confidenceLevel: 0.85,
      method: 'seasonal'
    });

    const futureVolume = forecast.predictions[29]; // 30-day prediction
    const growthRate = ((futureVolume - currentSize) / currentSize) * 100;
    
    console.log('Volume Growth Analysis:', {
      currentSize: currentSize.toLocaleString(),
      predictedSize: futureVolume.toLocaleString(),
      growthRate: growthRate.toFixed(1) + '%',
      confidence: (forecast.r2Score * 100).toFixed(1) + '%',
      trend: forecast.trend
    });

    return {
      score: Math.round(futureVolume),
      confidence: Math.max(0.7, forecast.r2Score),
      trend: forecast.trend,
      metadata: {
        method: 'seasonal_decomposition',
        r2Score: forecast.r2Score,
        mae: forecast.mae,
        seasonality: forecast.seasonality
      }
    };
  } catch (error) {
    console.warn('Advanced volume forecasting failed, using fallback method:', error);
    
    // Fallback to simple prediction
    const growthRate = 0.1 + Math.random() * 0.3;
    const predictedVolume = Math.round(currentSize * (1 + growthRate));
    
    return {
      score: predictedVolume,
      confidence: 0.7,
      trend: 'increasing',
      metadata: {
        method: 'simple_growth_rate'
      }
    };
  }
}

export function predictCustomerLifetimeValue(
  customerData: Array<{ revenue: number; tenure: number; activity: number }>
): PredictionResult {
  console.log('=== Customer Lifetime Value Prediction ===');
  
  if (customerData.length < 10) {
    return {
      score: 0,
      confidence: 0.3,
      trend: 'stable',
      metadata: { method: 'insufficient_data' }
    };
  }

  // Extract revenue time series
  const revenueValues = customerData.map(c => c.revenue).filter(r => r > 0);
  
  if (revenueValues.length < 5) {
    return {
      score: 0,
      confidence: 0.3,
      trend: 'stable',
      metadata: { method: 'insufficient_revenue_data' }
    };
  }

  try {
    const forecast = AdvancedForecasting.forecast(revenueValues, {
      periods: 12, // 12-month CLV prediction
      seasonalPeriods: 4, // Quarterly pattern
      confidenceLevel: 0.80,
      method: 'exponential'
    });

    const predictedCLV = forecast.predictions.reduce((sum, val) => sum + val, 0);
    const avgTenure = customerData.reduce((sum, c) => sum + c.tenure, 0) / customerData.length;
    const avgActivity = customerData.reduce((sum, c) => sum + c.activity, 0) / customerData.length;
    
    // Adjust CLV based on tenure and activity patterns
    const tenureMultiplier = Math.min(2, 1 + (avgTenure / 365)); // Max 2x for long tenure
    const activityMultiplier = Math.max(0.5, avgActivity); // Min 0.5x for low activity
    
    const adjustedCLV = predictedCLV * tenureMultiplier * activityMultiplier;
    
    console.log('CLV Prediction:', {
      baseCLV: predictedCLV.toFixed(2),
      adjustedCLV: adjustedCLV.toFixed(2),
      avgTenure: avgTenure.toFixed(0) + ' days',
      avgActivity: (avgActivity * 100).toFixed(1) + '%',
      confidence: (forecast.r2Score * 100).toFixed(1) + '%'
    });

    return {
      score: Math.round(adjustedCLV),
      confidence: forecast.r2Score,
      trend: forecast.trend,
      metadata: {
        method: 'advanced_clv_forecasting',
        r2Score: forecast.r2Score,
        mae: forecast.mae,
        tenureMultiplier,
        activityMultiplier,
        baseCustomers: customerData.length
      }
    };
  } catch (error) {
    console.warn('CLV forecasting failed, using simple average method:', error);
    
    const avgRevenue = revenueValues.reduce((sum, val) => sum + val, 0) / revenueValues.length;
    const simpleCLV = avgRevenue * 12; // Simple 12-month projection
    
    return {
      score: Math.round(simpleCLV),
      confidence: 0.6,
      trend: 'stable',
      metadata: {
        method: 'simple_average_projection'
      }
    };
  }
}

export function predictMarketTrend(
  marketData: number[],
  externalFactors?: { economicIndex?: number; seasonality?: number; competition?: number }
): PredictionResult {
  console.log('=== Market Trend Prediction ===');
  
  if (marketData.length < 12) {
    return {
      score: 0,
      confidence: 0.3,
      trend: 'stable',
      metadata: { method: 'insufficient_market_data' }
    };
  }

  try {
    // Use ARIMA-style forecasting for market trends
    const forecast = AdvancedForecasting.forecast(marketData, {
      periods: 90, // 90-day market forecast
      seasonalPeriods: 30, // Monthly seasonality
      confidenceLevel: 0.75,
      method: 'arima-simple'
    });

    let trendScore = forecast.predictions[89]; // 90-day prediction
    
    // Apply external factor adjustments if provided
    if (externalFactors) {
      const economicAdjustment = externalFactors.economicIndex ? 
        (externalFactors.economicIndex - 50) / 100 : 0; // Normalize around 50
      const seasonalAdjustment = externalFactors.seasonality || 0;
      const competitionAdjustment = externalFactors.competition ? 
        -(externalFactors.competition - 50) / 200 : 0; // Competition reduces trend
      
      const totalAdjustment = economicAdjustment + seasonalAdjustment + competitionAdjustment;
      trendScore *= (1 + totalAdjustment);
    }

    console.log('Market Trend Analysis:', {
      currentValue: marketData[marketData.length - 1].toFixed(2),
      predictedValue: trendScore.toFixed(2),
      trend: forecast.trend,
      confidence: (forecast.r2Score * 100).toFixed(1) + '%',
      externalFactorsApplied: !!externalFactors
    });

    return {
      score: Math.round(trendScore),
      confidence: forecast.r2Score,
      trend: forecast.trend,
      metadata: {
        method: 'arima_with_external_factors',
        r2Score: forecast.r2Score,
        mae: forecast.mae,
        seasonality: forecast.seasonality,
        externalFactors: externalFactors || {}
      }
    };
  } catch (error) {
    console.warn('Market trend forecasting failed, using trend analysis:', error);
    
    // Fallback to simple trend analysis
    const recentTrend = marketData.slice(-6); // Last 6 data points
    const oldTrend = marketData.slice(-12, -6); // Previous 6 data points
    
    const recentAvg = recentTrend.reduce((sum, val) => sum + val, 0) / recentTrend.length;
    const oldAvg = oldTrend.reduce((sum, val) => sum + val, 0) / oldTrend.length;
    
    const trendDirection = recentAvg > oldAvg * 1.05 ? 'increasing' : 
                          recentAvg < oldAvg * 0.95 ? 'decreasing' : 'stable';
    
    return {
      score: Math.round(recentAvg),
      confidence: 0.6,
      trend: trendDirection,
      metadata: {
        method: 'simple_trend_analysis'
      }
    };
  }
}

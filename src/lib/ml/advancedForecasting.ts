
export interface ForecastingConfig {
  periods: number;
  seasonalPeriods?: number;
  confidenceLevel: number;
  method: 'linear' | 'exponential' | 'seasonal' | 'arima-simple';
}

export interface ForecastResult {
  predictions: number[];
  confidenceIntervals: { lower: number[]; upper: number[] };
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: number;
  r2Score: number;
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  metadata: {
    method: string;
    dataPoints: number;
    outliers: number[];
    trendStrength: number;
    seasonalStrength: number;
  };
}

export interface SeasonalDecomposition {
  trend: number[];
  seasonal: number[];
  residual: number[];
  strength: {
    trend: number;
    seasonal: number;
  };
}

export class AdvancedForecasting {
  
  static decomposeTimeSeries(values: number[], seasonalPeriods = 12): SeasonalDecomposition {
    const n = values.length;
    const trend = this.calculateTrend(values);
    const seasonal = this.calculateSeasonalComponent(values, seasonalPeriods);
    const residual = values.map((val, i) => val - trend[i] - seasonal[i % seasonalPeriods]);
    
    const trendStrength = this.calculateVarianceExplained(values, trend);
    const seasonalStrength = this.calculateVarianceExplained(
      values.map((val, i) => val - trend[i]), 
      seasonal
    );
    
    return {
      trend,
      seasonal,
      residual,
      strength: {
        trend: trendStrength,
        seasonal: seasonalStrength
      }
    };
  }

  static forecast(values: number[], config: ForecastingConfig): ForecastResult {
    console.log('=== Advanced Forecasting Started ===');
    console.log('Config:', config);
    console.log('Input data points:', values.length);
    
    // Remove outliers
    const cleanedData = this.removeOutliers(values);
    const outliers = values.map((val, i) => this.isOutlier(values, val) ? i : -1).filter(i => i >= 0);
    
    let predictions: number[];
    let confidenceIntervals: { lower: number[]; upper: number[] };
    let metadata: any;

    switch (config.method) {
      case 'exponential':
        ({ predictions, confidenceIntervals, metadata } = this.exponentialSmoothing(cleanedData, config));
        break;
      case 'seasonal':
        ({ predictions, confidenceIntervals, metadata } = this.seasonalForecast(cleanedData, config));
        break;
      case 'arima-simple':
        ({ predictions, confidenceIntervals, metadata } = this.simplifiedARIMA(cleanedData, config));
        break;
      default:
        ({ predictions, confidenceIntervals, metadata } = this.linearForecast(cleanedData, config));
    }

    const trend = this.determineTrend(cleanedData);
    const seasonality = this.calculateSeasonality(cleanedData, config.seasonalPeriods || 12);
    const r2Score = this.calculateR2Score(cleanedData, predictions.slice(0, cleanedData.length));
    const mae = this.calculateMAE(cleanedData, predictions.slice(0, cleanedData.length));
    const mape = this.calculateMAPE(cleanedData, predictions.slice(0, cleanedData.length));

    const decomposition = this.decomposeTimeSeries(cleanedData, config.seasonalPeriods);

    console.log('Forecast Results:', {
      predictionsCount: predictions.length,
      trend,
      seasonality: seasonality.toFixed(3),
      r2Score: r2Score.toFixed(3),
      mae: mae.toFixed(2),
      mape: mape.toFixed(2),
      outliersRemoved: outliers.length
    });

    return {
      predictions,
      confidenceIntervals,
      trend,
      seasonality,
      r2Score,
      mae,
      mape,
      metadata: {
        method: config.method,
        dataPoints: cleanedData.length,
        outliers,
        trendStrength: decomposition.strength.trend,
        seasonalStrength: decomposition.strength.seasonal,
        ...metadata
      }
    };
  }

  private static linearForecast(values: number[], config: ForecastingConfig) {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const regression = this.linearRegression(x, values);
    
    const predictions = Array.from({ length: config.periods }, (_, i) => 
      regression.slope * (n + i) + regression.intercept
    );

    const residuals = values.map((val, i) => val - (regression.slope * i + regression.intercept));
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length;
    const stdError = Math.sqrt(mse);
    const tValue = this.getTValue(config.confidenceLevel, n - 2);

    const confidenceIntervals = {
      lower: predictions.map(pred => pred - tValue * stdError),
      upper: predictions.map(pred => pred + tValue * stdError)
    };

    return {
      predictions,
      confidenceIntervals,
      metadata: {
        slope: regression.slope,
        intercept: regression.intercept,
        mse,
        stdError
      }
    };
  }

  private static exponentialSmoothing(values: number[], config: ForecastingConfig) {
    const alpha = 0.3; // Smoothing parameter
    const beta = 0.1;  // Trend parameter
    
    let level = values[0];
    let trend = values[1] - values[0];
    const smoothed = [level];

    // Apply exponential smoothing
    for (let i = 1; i < values.length; i++) {
      const prevLevel = level;
      level = alpha * values[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      smoothed.push(level);
    }

    // Generate forecasts
    const predictions = [];
    let currentLevel = level;
    let currentTrend = trend;

    for (let i = 0; i < config.periods; i++) {
      const forecast = currentLevel + currentTrend * (i + 1);
      predictions.push(forecast);
    }

    // Calculate confidence intervals based on historical errors
    const errors = values.slice(1).map((val, i) => Math.abs(val - smoothed[i + 1]));
    const avgError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    const tValue = this.getTValue(config.confidenceLevel, values.length - 1);

    const confidenceIntervals = {
      lower: predictions.map(pred => pred - tValue * avgError),
      upper: predictions.map(pred => pred + tValue * avgError)
    };

    return {
      predictions,
      confidenceIntervals,
      metadata: {
        alpha,
        beta,
        finalLevel: level,
        finalTrend: trend,
        avgError
      }
    };
  }

  private static seasonalForecast(values: number[], config: ForecastingConfig) {
    const seasonalPeriods = config.seasonalPeriods || 12;
    const decomposition = this.decomposeTimeSeries(values, seasonalPeriods);
    
    // Forecast trend component
    const trendForecast = this.linearForecast(decomposition.trend, {
      ...config,
      periods: config.periods
    });

    // Apply seasonal pattern
    const predictions = trendForecast.predictions.map((trendVal, i) => {
      const seasonalIndex = i % seasonalPeriods;
      return trendVal + decomposition.seasonal[seasonalIndex];
    });

    // Enhanced confidence intervals considering seasonal variation
    const seasonalVariation = this.calculateStandardDeviation(decomposition.seasonal);
    const residualVariation = this.calculateStandardDeviation(decomposition.residual);
    const totalVariation = Math.sqrt(seasonalVariation * seasonalVariation + residualVariation * residualVariation);
    
    const tValue = this.getTValue(config.confidenceLevel, values.length - 1);
    const confidenceIntervals = {
      lower: predictions.map(pred => pred - tValue * totalVariation),
      upper: predictions.map(pred => pred + tValue * totalVariation)
    };

    return {
      predictions,
      confidenceIntervals,
      metadata: {
        seasonalPeriods,
        seasonalStrength: decomposition.strength.seasonal,
        trendStrength: decomposition.strength.trend,
        seasonalVariation,
        residualVariation
      }
    };
  }

  private static simplifiedARIMA(values: number[], config: ForecastingConfig) {
    // Simplified ARIMA(1,1,1) implementation
    const diff = values.slice(1).map((val, i) => val - values[i]);
    
    // AR(1) component
    const ar1Coeff = this.calculateAutocorrelation(diff, 1);
    
    // MA(1) component - simplified
    const residuals = diff.slice(1).map((val, i) => val - ar1Coeff * diff[i]);
    const ma1Coeff = this.calculateAutocorrelation(residuals, 1);

    // Generate forecasts
    const predictions = [];
    let lastValue = values[values.length - 1];
    let lastDiff = diff[diff.length - 1];
    let lastResidual = residuals[residuals.length - 1] || 0;

    for (let i = 0; i < config.periods; i++) {
      const forecastDiff = ar1Coeff * lastDiff + ma1Coeff * lastResidual;
      const forecast = lastValue + forecastDiff;
      predictions.push(forecast);
      
      lastValue = forecast;
      lastDiff = forecastDiff;
      lastResidual = 0; // Assume no error for future predictions
    }

    // Calculate confidence intervals
    const forecastErrors = residuals.map(Math.abs);
    const avgError = forecastErrors.reduce((sum, err) => sum + err, 0) / forecastErrors.length;
    const tValue = this.getTValue(config.confidenceLevel, values.length - 1);

    const confidenceIntervals = {
      lower: predictions.map((pred, i) => pred - tValue * avgError * Math.sqrt(i + 1)),
      upper: predictions.map((pred, i) => pred + tValue * avgError * Math.sqrt(i + 1))
    };

    return {
      predictions,
      confidenceIntervals,
      metadata: {
        ar1Coeff,
        ma1Coeff,
        avgError,
        differencing: 1
      }
    };
  }

  // Utility methods
  private static removeOutliers(values: number[]): number[] {
    const q1 = this.percentile(values, 25);
    const q3 = this.percentile(values, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.map(val => {
      if (val < lowerBound || val > upperBound) {
        return q1 + (q3 - q1) * 0.5; // Replace with median of Q1-Q3
      }
      return val;
    });
  }

  private static isOutlier(values: number[], value: number): boolean {
    const q1 = this.percentile(values, 25);
    const q3 = this.percentile(values, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    return value < lowerBound || value > upperBound;
  }

  private static calculateTrend(values: number[]): number[] {
    const windowSize = Math.min(Math.floor(values.length / 4), 12);
    return values.map((_, i) => {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(values.length, start + windowSize);
      const window = values.slice(start, end);
      return window.reduce((sum, val) => sum + val, 0) / window.length;
    });
  }

  private static calculateSeasonalComponent(values: number[], periods: number): number[] {
    const seasonal = new Array(periods).fill(0);
    const counts = new Array(periods).fill(0);

    for (let i = 0; i < values.length; i++) {
      const seasonIndex = i % periods;
      seasonal[seasonIndex] += values[i];
      counts[seasonIndex]++;
    }

    // Average seasonal components
    for (let i = 0; i < periods; i++) {
      seasonal[i] = counts[i] > 0 ? seasonal[i] / counts[i] : 0;
    }

    // Center seasonal components (sum to zero)
    const mean = seasonal.reduce((sum, val) => sum + val, 0) / periods;
    return seasonal.map(val => val - mean);
  }

  private static linearRegression(x: number[], y: number[]) {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private static calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < n; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator > 0 ? numerator / denominator : 0;
  }

  private static determineTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    const { slope } = this.linearRegression(
      Array.from({ length: values.length }, (_, i) => i),
      values
    );

    const threshold = Math.abs(values[values.length - 1] - values[0]) * 0.05 / values.length;
    
    if (slope > threshold) return 'increasing';
    if (slope < -threshold) return 'decreasing';
    return 'stable';
  }

  private static calculateSeasonality(values: number[], periods: number): number {
    if (values.length < periods * 2) return 0;
    
    let maxCorr = 0;
    for (let lag = 1; lag <= Math.min(periods, Math.floor(values.length / 2)); lag++) {
      const corr = Math.abs(this.calculateAutocorrelation(values, lag));
      maxCorr = Math.max(maxCorr, corr);
    }
    
    return maxCorr;
  }

  private static calculateVarianceExplained(actual: number[], predicted: number[]): number {
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const residualSumSquares = actual.reduce((sum, val, i) => 
      sum + Math.pow(val - (predicted[i] || 0), 2), 0);
    
    return totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;
  }

  private static calculateR2Score(actual: number[], predicted: number[]): number {
    return this.calculateVarianceExplained(actual, predicted);
  }

  private static calculateMAE(actual: number[], predicted: number[]): number {
    const n = Math.min(actual.length, predicted.length);
    return actual.slice(0, n).reduce((sum, val, i) => 
      sum + Math.abs(val - predicted[i]), 0) / n;
  }

  private static calculateMAPE(actual: number[], predicted: number[]): number {
    const n = Math.min(actual.length, predicted.length);
    const sum = actual.slice(0, n).reduce((sum, val, i) => {
      if (Math.abs(val) < 0.0001) return sum; // Avoid division by zero
      return sum + Math.abs((val - predicted[i]) / val);
    }, 0);
    return (sum / n) * 100;
  }

  private static calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return sorted[lower];
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  private static getTValue(confidenceLevel: number, degreesOfFreedom: number): number {
    // Simplified t-value lookup for common confidence levels
    const alpha = 1 - confidenceLevel;
    
    if (degreesOfFreedom >= 30) {
      // Use normal approximation for large samples
      if (alpha <= 0.01) return 2.576;
      if (alpha <= 0.05) return 1.96;
      if (alpha <= 0.1) return 1.645;
      return 1.96; // Default to 95%
    }
    
    // Simplified t-table values for small samples
    const tTable: { [key: number]: { [key: number]: number } } = {
      1: { 0.1: 6.314, 0.05: 12.706, 0.01: 63.657 },
      2: { 0.1: 2.920, 0.05: 4.303, 0.01: 9.925 },
      5: { 0.1: 2.015, 0.05: 2.571, 0.01: 4.032 },
      10: { 0.1: 1.812, 0.05: 2.228, 0.01: 3.169 },
      20: { 0.1: 1.725, 0.05: 2.086, 0.01: 2.845 }
    };
    
    const df = Math.min(20, Math.max(1, Math.floor(degreesOfFreedom)));
    const closestDf = Object.keys(tTable).map(Number).reduce((prev, curr) => 
      Math.abs(curr - df) < Math.abs(prev - df) ? curr : prev
    );
    
    return tTable[closestDf][alpha] || 1.96;
  }
}

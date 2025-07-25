// Data Validation and Statistical Validation System for Predictive Analytics
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
  qualityScore: number;
}

export interface StatisticalBounds {
  r2Score: { min: number; max: number };
  confidence: { min: number; max: number };
  mae: { min: number; max: number };
  mape: { min: number; max: number };
}

export class DataValidationEngine {
  private static STATISTICAL_BOUNDS: StatisticalBounds = {
    r2Score: { min: 0, max: 1 },
    confidence: { min: 0, max: 1 },
    mae: { min: 0, max: Infinity },
    mape: { min: 0, max: 100 }
  };

  static validateStatisticalMetrics(metrics: {
    r2Score?: number;
    confidence?: number;
    mae?: number;
    mape?: number;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate R² Score
    if (metrics.r2Score !== undefined) {
      if (metrics.r2Score < this.STATISTICAL_BOUNDS.r2Score.min || 
          metrics.r2Score > this.STATISTICAL_BOUNDS.r2Score.max) {
        errors.push(`R² Score must be between 0 and 1, got ${metrics.r2Score}`);
      }
      if (metrics.r2Score < 0.3) {
        warnings.push(`Low R² Score (${metrics.r2Score.toFixed(3)}) indicates poor model fit`);
      }
    }

    // Validate Confidence
    if (metrics.confidence !== undefined) {
      if (metrics.confidence < this.STATISTICAL_BOUNDS.confidence.min || 
          metrics.confidence > this.STATISTICAL_BOUNDS.confidence.max) {
        errors.push(`Confidence must be between 0 and 1, got ${metrics.confidence}`);
      }
      if (metrics.confidence < 0.5) {
        warnings.push(`Low confidence (${(metrics.confidence * 100).toFixed(1)}%) indicates uncertain predictions`);
      }
    }

    // Validate MAE
    if (metrics.mae !== undefined && metrics.mae < 0) {
      errors.push(`MAE cannot be negative, got ${metrics.mae}`);
    }

    // Validate MAPE
    if (metrics.mape !== undefined) {
      if (metrics.mape < 0 || metrics.mape > 100) {
        errors.push(`MAPE must be between 0 and 100, got ${metrics.mape}`);
      }
      if (metrics.mape > 50) {
        warnings.push(`High MAPE (${metrics.mape.toFixed(1)}%) indicates poor prediction accuracy`);
      }
    }

    const isValid = errors.length === 0;
    const confidence = isValid ? Math.max(0.1, 1 - warnings.length * 0.2) : 0;
    const qualityScore = isValid ? Math.max(0.3, 1 - (errors.length * 0.5 + warnings.length * 0.1)) : 0;

    return {
      isValid,
      errors,
      warnings,
      confidence,
      qualityScore
    };
  }

  static validateDataQuality(data: DataRow[], columns: ColumnInfo[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check data size
    if (data.length < 10) {
      errors.push(`Insufficient data: ${data.length} rows (minimum 10 required)`);
    } else if (data.length < 30) {
      warnings.push(`Small dataset: ${data.length} rows may limit prediction accuracy`);
    }

    // Check for numeric columns
    const numericColumns = columns.filter(col => col.type === 'numeric');
    if (numericColumns.length === 0) {
      errors.push('No numeric columns found for analysis');
    }

    // Analyze data completeness
    let totalMissingValues = 0;
    let totalValues = 0;

    numericColumns.forEach(column => {
      const values = data.map(row => row[column.name]);
      const validValues = values.filter(val => val !== null && val !== undefined && !isNaN(Number(val)));
      const missingCount = values.length - validValues.length;
      
      totalMissingValues += missingCount;
      totalValues += values.length;

      const missingPercentage = (missingCount / values.length) * 100;
      if (missingPercentage > 50) {
        errors.push(`Column '${column.name}' has ${missingPercentage.toFixed(1)}% missing values`);
      } else if (missingPercentage > 20) {
        warnings.push(`Column '${column.name}' has ${missingPercentage.toFixed(1)}% missing values`);
      }

      // Check for data variability
      if (validValues.length > 0) {
        const numericValues = validValues.map(v => Number(v));
        const uniqueValues = new Set(numericValues).size;
        if (uniqueValues === 1) {
          warnings.push(`Column '${column.name}' has no variability (all values are the same)`);
        }
      }
    });

    // Overall completeness
    const completeness = totalValues > 0 ? 1 - (totalMissingValues / totalValues) : 0;
    if (completeness < 0.7) {
      errors.push(`Low data completeness: ${(completeness * 100).toFixed(1)}%`);
    }

    const isValid = errors.length === 0;
    const confidence = Math.max(0.1, completeness - warnings.length * 0.1);
    const qualityScore = Math.max(0.1, completeness * (1 - errors.length * 0.3 - warnings.length * 0.1));

    return {
      isValid,
      errors,
      warnings,
      confidence,
      qualityScore
    };
  }

  static calculateAdaptiveConfidence(
    dataQuality: ValidationResult,
    modelMetrics: ValidationResult,
    sampleSize: number,
    trendStability: number
  ): number {
    // Base confidence from data quality
    let confidence = dataQuality.qualityScore * 0.4;
    
    // Add model performance factor
    if (modelMetrics.isValid) {
      confidence += modelMetrics.qualityScore * 0.3;
    }
    
    // Sample size factor
    const sampleSizeFactor = Math.min(1, sampleSize / 100);
    confidence += sampleSizeFactor * 0.2;
    
    // Trend stability factor
    confidence += Math.max(0, trendStability) * 0.1;
    
    // Penalize for warnings and errors
    confidence -= (dataQuality.warnings.length + modelMetrics.warnings.length) * 0.05;
    confidence -= (dataQuality.errors.length + modelMetrics.errors.length) * 0.15;
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  static provideFallbackValues(originalValue: number, fallbackType: 'prediction' | 'confidence' | 'trend'): number {
    switch (fallbackType) {
      case 'prediction':
        return Math.max(0, originalValue * 0.8); // Conservative estimate
      case 'confidence':
        return 0.3; // Low confidence
      case 'trend':
        return 0; // Neutral trend
      default:
        return 0;
    }
  }
}
// Data Quality Assessment Engine
import { DataRow } from '@/pages/Index';
import { EnhancedColumnInfo, DataQualityProfile, QualityIssue } from '@/types/dataModel';

export interface QualityAssessmentOptions {
  includeDistributionAnalysis?: boolean;
  outlierDetectionMethod?: 'iqr' | 'zscore' | 'isolation';
  missingValueThreshold?: number;
  duplicateCheckColumns?: string[];
}

/**
 * Comprehensive data quality assessment engine
 */
export class DataQualityEngine {
  
  /**
   * Assess overall dataset quality
   */
  static assessDatasetQuality(
    data: DataRow[], 
    columns: EnhancedColumnInfo[],
    options: QualityAssessmentOptions = {}
  ): DataQualityProfile {
    const issues: QualityIssue[] = [];
    
    // Assess each dimension of data quality
    const completenessScore = this.assessCompleteness(data, columns, issues);
    const validityScore = this.assessValidity(data, columns, issues);
    const consistencyScore = this.assessConsistency(data, columns, issues);
    const accuracyScore = this.assessAccuracy(data, columns, issues, options);
    
    // Calculate overall score (weighted average)
    const overallScore = (
      completenessScore * 0.3 +
      validityScore * 0.3 +
      consistencyScore * 0.2 +
      accuracyScore * 0.2
    );
    
    const recommendations = this.generateRecommendations(issues, overallScore);
    
    return {
      completeness: completenessScore,
      validity: validityScore,
      consistency: consistencyScore,
      accuracy: accuracyScore,
      overallScore,
      issues,
      recommendations,
      lastAssessed: new Date()
    };
  }
  
  /**
   * Assess data completeness (missing values)
   */
  private static assessCompleteness(
    data: DataRow[], 
    columns: EnhancedColumnInfo[], 
    issues: QualityIssue[]
  ): number {
    let totalCells = 0;
    let missingCells = 0;
    
    columns.forEach(column => {
      const columnValues = data.map(row => row[column.name]);
      const nullCount = columnValues.filter(v => v === null || v === undefined || v === '').length;
      
      totalCells += columnValues.length;
      missingCells += nullCount;
      
      const missingPercentage = nullCount / columnValues.length;
      
      if (missingPercentage > 0.1) {
        issues.push({
          type: 'missing_values',
          severity: missingPercentage > 0.5 ? 'critical' : missingPercentage > 0.25 ? 'high' : 'medium',
          description: `Column '${column.name}' has ${(missingPercentage * 100).toFixed(1)}% missing values`,
          affectedRows: columnValues.map((v, i) => v === null || v === undefined || v === '' ? i : -1).filter(i => i !== -1),
          suggestedFix: 'Consider data imputation or source validation'
        });
      }
    });
    
    return totalCells > 0 ? (totalCells - missingCells) / totalCells : 1;
  }
  
  /**
   * Assess data validity (format and type consistency)
   */
  private static assessValidity(
    data: DataRow[], 
    columns: EnhancedColumnInfo[], 
    issues: QualityIssue[]
  ): number {
    let totalValidations = 0;
    let validValues = 0;
    
    columns.forEach(column => {
      const columnValues = data.map(row => row[column.name])
        .filter(v => v !== null && v !== undefined && v !== '');
      
      if (columnValues.length === 0) return;
      
      totalValidations += columnValues.length;
      
      switch (column.type) {
        case 'numeric':
          const numericValid = columnValues.filter(v => {
            const num = Number(v);
            return !isNaN(num) && isFinite(num);
          }).length;
          
          validValues += numericValid;
          
          if (numericValid < columnValues.length) {
            issues.push({
              type: 'invalid_format',
              severity: 'high',
              description: `Column '${column.name}' contains ${columnValues.length - numericValid} invalid numeric values`,
              affectedRows: [],
              suggestedFix: 'Check data parsing and source format'
            });
          }
          break;
          
        case 'date':
          const dateValid = columnValues.filter(v => {
            const date = new Date(v);
            return !isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100;
          }).length;
          
          validValues += dateValid;
          
          if (dateValid < columnValues.length) {
            issues.push({
              type: 'invalid_format',
              severity: 'high',
              description: `Column '${column.name}' contains ${columnValues.length - dateValid} invalid date values`,
              affectedRows: [],
              suggestedFix: 'Standardize date format or check source data'
            });
          }
          break;
          
        default:
          // For text and categorical, assume all non-empty values are valid
          validValues += columnValues.length;
      }
    });
    
    return totalValidations > 0 ? validValues / totalValidations : 1;
  }
  
  /**
   * Assess data consistency (internal logical consistency)
   */
  private static assessConsistency(
    data: DataRow[], 
    columns: EnhancedColumnInfo[], 
    issues: QualityIssue[]
  ): number {
    let consistencyScore = 1;
    
    // Check for inconsistent categorical values (case sensitivity, spacing)
    columns.filter(col => col.type === 'categorical').forEach(column => {
      const values = data.map(row => row[column.name])
        .filter(v => v !== null && v !== undefined && v !== '');
      
      const normalizedValues = new Map<string, string[]>();
      
      values.forEach(value => {
        const normalized = String(value).toLowerCase().trim();
        if (!normalizedValues.has(normalized)) {
          normalizedValues.set(normalized, []);
        }
        normalizedValues.get(normalized)!.push(String(value));
      });
      
      // Find inconsistent representations
      normalizedValues.forEach((variants, normalized) => {
        if (variants.length > 1) {
          const uniqueVariants = [...new Set(variants)];
          if (uniqueVariants.length > 1) {
            issues.push({
              type: 'inconsistent_type',
              severity: 'medium',
              description: `Column '${column.name}' has inconsistent categorical values: ${uniqueVariants.join(', ')}`,
              affectedRows: [],
              suggestedFix: 'Standardize categorical value formatting'
            });
            consistencyScore -= 0.1;
          }
        }
      });
    });
    
    // Check for logical inconsistencies between related columns
    // (This would require domain knowledge or user-defined rules)
    
    return Math.max(0, consistencyScore);
  }
  
  /**
   * Assess data accuracy (outliers and anomalies)
   */
  private static assessAccuracy(
    data: DataRow[], 
    columns: EnhancedColumnInfo[], 
    issues: QualityIssue[],
    options: QualityAssessmentOptions
  ): number {
    let accuracyScore = 1;
    
    columns.filter(col => col.type === 'numeric').forEach(column => {
      const values = data.map(row => row[column.name])
        .filter(v => v !== null && v !== undefined && v !== '')
        .map(v => Number(v))
        .filter(v => !isNaN(v) && isFinite(v));
      
      if (values.length < 10) return; // Skip outlier detection for small datasets
      
      const outliers = this.detectOutliers(values, options.outlierDetectionMethod || 'iqr');
      
      if (outliers.length > 0) {
        const outlierPercentage = outliers.length / values.length;
        
        if (outlierPercentage > 0.05) { // More than 5% outliers
          issues.push({
            type: 'outlier',
            severity: outlierPercentage > 0.2 ? 'high' : 'medium',
            description: `Column '${column.name}' has ${outliers.length} potential outliers (${(outlierPercentage * 100).toFixed(1)}%)`,
            affectedRows: [],
            suggestedFix: 'Review outliers for data accuracy'
          });
          
          accuracyScore -= outlierPercentage * 0.5;
        }
      }
    });
    
    return Math.max(0, accuracyScore);
  }
  
  /**
   * Detect outliers using various methods
   */
  private static detectOutliers(values: number[], method: 'iqr' | 'zscore' | 'isolation'): number[] {
    switch (method) {
      case 'iqr':
        return this.detectOutliersIQR(values);
      case 'zscore':
        return this.detectOutliersZScore(values);
      case 'isolation':
        // Simplified isolation forest (would need more sophisticated implementation)
        return this.detectOutliersIQR(values);
      default:
        return this.detectOutliersIQR(values);
    }
  }
  
  /**
   * IQR method for outlier detection
   */
  private static detectOutliersIQR(values: number[]): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  }
  
  /**
   * Z-score method for outlier detection
   */
  private static detectOutliersZScore(values: number[], threshold: number = 3): number[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return values.filter(v => Math.abs((v - mean) / stdDev) > threshold);
  }
  
  /**
   * Generate recommendations based on quality assessment
   */
  private static generateRecommendations(issues: QualityIssue[], overallScore: number): string[] {
    const recommendations: string[] = [];
    
    if (overallScore < 0.7) {
      recommendations.push('Overall data quality is below acceptable threshold. Consider comprehensive data cleaning.');
    }
    
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push('Address critical data quality issues before proceeding with analysis.');
    }
    
    const missingValueIssues = issues.filter(issue => issue.type === 'missing_values');
    if (missingValueIssues.length > 0) {
      recommendations.push('Implement data imputation strategies for columns with significant missing values.');
    }
    
    const formatIssues = issues.filter(issue => issue.type === 'invalid_format');
    if (formatIssues.length > 0) {
      recommendations.push('Standardize data formats and validate data parsing logic.');
    }
    
    const consistencyIssues = issues.filter(issue => issue.type === 'inconsistent_type');
    if (consistencyIssues.length > 0) {
      recommendations.push('Standardize categorical values and implement data validation rules.');
    }
    
    const outlierIssues = issues.filter(issue => issue.type === 'outlier');
    if (outlierIssues.length > 0) {
      recommendations.push('Review and validate outlier values; consider outlier treatment methods.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Data quality is good. Consider advanced analytics and visualization.');
    }
    
    return recommendations;
  }
}
// Enhanced Column Type Detection with Statistics and Quality Assessment
import { DataRow } from '@/pages/Index';
import { EnhancedColumnInfo, ColumnStatistics, QualityIssue, ColumnConstraint } from '@/types/dataModel';
import { detectColumnTypeWithName } from '@/lib/columnTypeDetection';

export interface ColumnAnalysisResult {
  column: EnhancedColumnInfo;
  qualityIssues: QualityIssue[];
  suggestions: string[];
}

/**
 * Enhanced column detection that includes statistics, quality assessment, and semantic analysis
 */
export class EnhancedColumnDetector {
  
  /**
   * Analyze all columns in a dataset
   */
  static analyzeDataset(data: DataRow[]): ColumnAnalysisResult[] {
    if (!data || data.length === 0) return [];
    
    const columnNames = Object.keys(data[0]);
    return columnNames.map(columnName => this.analyzeColumn(columnName, data));
  }
  
  /**
   * Analyze a single column with enhanced statistics and quality assessment
   */
  static analyzeColumn(columnName: string, data: DataRow[]): ColumnAnalysisResult {
    const values = data.map(row => row[columnName]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    // Basic type detection
    const basicType = detectColumnTypeWithName(columnName, values);
    
    // Calculate statistics
    const statistics = this.calculateColumnStatistics(values, basicType);
    
    // Detect semantic type
    const semanticType = this.detectSemanticType(columnName, values, basicType);
    
    // Assess data quality
    const qualityAssessment = this.assessDataQuality(columnName, values, basicType);
    
    // Generate constraints
    const constraints = this.generateConstraints(columnName, values, basicType, statistics);
    
    // Create enhanced column info
    const column: EnhancedColumnInfo = {
      name: columnName,
      type: basicType,
      values: values,
      
      // Enhanced metadata
      statistics,
      constraints,
      semanticType,
      displayName: this.generateDisplayName(columnName),
      description: this.generateDescription(columnName, semanticType, basicType),
      unit: this.detectUnit(columnName, values),
      format: this.detectFormat(columnName, values, basicType),
      
      // Quality information
      qualityScore: qualityAssessment.score,
      qualityIssues: qualityAssessment.issues.map(issue => issue.description),
      
      // Version tracking
      version: 1,
      lastModified: new Date()
    };
    
    const suggestions = this.generateSuggestions(column, qualityAssessment);
    
    return {
      column,
      qualityIssues: qualityAssessment.issues,
      suggestions
    };
  }
  
  /**
   * Calculate comprehensive column statistics
   */
  private static calculateColumnStatistics(values: any[], type: string): ColumnStatistics {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const nullCount = values.length - nonNullValues.length;
    const uniqueValues = new Set(nonNullValues);
    
    const stats: ColumnStatistics = {
      nullCount,
      uniqueCount: uniqueValues.size,
      distribution: {}
    };
    
    // Calculate distribution
    nonNullValues.forEach(value => {
      const key = String(value);
      stats.distribution![key] = (stats.distribution![key] || 0) + 1;
    });
    
    // Type-specific statistics
    if (type === 'numeric') {
      const numericValues = nonNullValues
        .map(v => Number(v))
        .filter(v => !isNaN(v) && isFinite(v));
      
      if (numericValues.length > 0) {
        stats.min = Math.min(...numericValues);
        stats.max = Math.max(...numericValues);
        stats.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        
        // Calculate median
        const sorted = [...numericValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        stats.median = sorted.length % 2 === 0 
          ? (sorted[mid - 1] + sorted[mid]) / 2 
          : sorted[mid];
        
        // Detect outliers using IQR method
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        stats.outliers = numericValues.filter(v => v < lowerBound || v > upperBound);
      }
    }
    
    // Calculate mode
    let maxCount = 0;
    let mode = null;
    Object.entries(stats.distribution).forEach(([value, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });
    stats.mode = mode;
    
    return stats;
  }
  
  /**
   * Detect semantic type based on column name and values
   */
  private static detectSemanticType(
    columnName: string, 
    values: any[], 
    basicType: string
  ): 'identifier' | 'measure' | 'dimension' | 'temporal' | 'geospatial' {
    const lowerName = columnName.toLowerCase();
    
    // Identifier patterns
    if (lowerName.includes('id') || lowerName.includes('key') || 
        lowerName.includes('uuid') || lowerName.includes('guid')) {
      return 'identifier';
    }
    
    // Temporal patterns
    if (basicType === 'date' || lowerName.includes('date') || 
        lowerName.includes('time') || lowerName.includes('timestamp')) {
      return 'temporal';
    }
    
    // Geospatial patterns
    if (lowerName.includes('lat') || lowerName.includes('lon') || 
        lowerName.includes('coordinate') || lowerName.includes('location') ||
        lowerName.includes('address') || lowerName.includes('country') ||
        lowerName.includes('city') || lowerName.includes('state')) {
      return 'geospatial';
    }
    
    // Measure patterns (quantitative data)
    if (basicType === 'numeric' && (
        lowerName.includes('amount') || lowerName.includes('price') ||
        lowerName.includes('cost') || lowerName.includes('revenue') ||
        lowerName.includes('quantity') || lowerName.includes('count') ||
        lowerName.includes('rate') || lowerName.includes('percent')
    )) {
      return 'measure';
    }
    
    // Default to dimension for categorical and text data
    return 'dimension';
  }
  
  /**
   * Assess data quality and identify issues
   */
  private static assessDataQuality(
    columnName: string, 
    values: any[], 
    type: string
  ): { score: number; issues: QualityIssue[] } {
    const issues: QualityIssue[] = [];
    let score = 100;
    
    const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
    const nullPercentage = nullCount / values.length;
    
    // Check for missing values
    if (nullPercentage > 0.1) {
      issues.push({
        type: 'missing_values',
        severity: nullPercentage > 0.5 ? 'critical' : nullPercentage > 0.25 ? 'high' : 'medium',
        description: `${(nullPercentage * 100).toFixed(1)}% missing values`,
        affectedRows: values.map((v, i) => v === null || v === undefined || v === '' ? i : -1).filter(i => i !== -1),
        suggestedFix: 'Consider data imputation or source data validation'
      });
      score -= nullPercentage * 40;
    }
    
    // Type-specific quality checks
    if (type === 'numeric') {
      const numericValues = values
        .filter(v => v !== null && v !== undefined && v !== '')
        .map(v => Number(v));
      
      const invalidCount = numericValues.filter(v => isNaN(v) || !isFinite(v)).length;
      if (invalidCount > 0) {
        issues.push({
          type: 'invalid_format',
          severity: 'high',
          description: `${invalidCount} invalid numeric values`,
          affectedRows: [],
          suggestedFix: 'Review data source and parsing logic'
        });
        score -= 20;
      }
    }
    
    // Check for duplicates in identifier columns
    if (columnName.toLowerCase().includes('id')) {
      const uniqueValues = new Set(values.filter(v => v !== null && v !== undefined && v !== ''));
      const nonNullCount = values.length - nullCount;
      if (uniqueValues.size < nonNullCount) {
        issues.push({
          type: 'duplicate',
          severity: 'high',
          description: `Duplicate values in identifier column`,
          affectedRows: [],
          suggestedFix: 'Ensure unique identifiers'
        });
        score -= 25;
      }
    }
    
    return { score: Math.max(0, score), issues };
  }
  
  /**
   * Generate constraints based on data analysis
   */
  private static generateConstraints(
    columnName: string,
    values: any[],
    type: string,
    statistics: ColumnStatistics
  ): ColumnConstraint[] {
    const constraints: ColumnConstraint[] = [];
    
    // Required constraint for columns with few nulls
    if (statistics.nullCount < values.length * 0.05) {
      constraints.push({
        type: 'required',
        rule: 'not_null',
        message: 'This field is required'
      });
    }
    
    // Unique constraint for ID columns
    if (columnName.toLowerCase().includes('id') && statistics.uniqueCount === values.length - statistics.nullCount) {
      constraints.push({
        type: 'unique',
        rule: 'unique',
        message: 'This field must be unique'
      });
    }
    
    // Range constraints for numeric data
    if (type === 'numeric' && statistics.min !== undefined && statistics.max !== undefined) {
      constraints.push({
        type: 'range',
        rule: `${statistics.min}-${statistics.max}`,
        message: `Value must be between ${statistics.min} and ${statistics.max}`
      });
    }
    
    return constraints;
  }
  
  /**
   * Generate display name from column name
   */
  private static generateDisplayName(columnName: string): string {
    return columnName
      .replace(/[_-]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
  
  /**
   * Generate column description
   */
  private static generateDescription(
    columnName: string, 
    semanticType: string, 
    basicType: string
  ): string {
    const displayName = this.generateDisplayName(columnName);
    const typeDesc = {
      identifier: 'unique identifier',
      measure: 'quantitative measure',
      dimension: 'categorical dimension',
      temporal: 'time-based value',
      geospatial: 'location-based data'
    }[semanticType];
    
    return `${displayName} - ${typeDesc} (${basicType} type)`;
  }
  
  /**
   * Detect unit of measurement
   */
  private static detectUnit(columnName: string, values: any[]): string | undefined {
    const lowerName = columnName.toLowerCase();
    
    // Common unit patterns
    const unitPatterns = {
      'price|cost|amount|revenue|salary': '$',
      'weight': 'kg',
      'height|length|distance': 'm',
      'temperature': '°C',
      'percent|rate': '%',
      'age': 'years',
      'count|quantity': 'units'
    };
    
    for (const [pattern, unit] of Object.entries(unitPatterns)) {
      if (new RegExp(pattern).test(lowerName)) {
        return unit;
      }
    }
    
    return undefined;
  }
  
  /**
   * Detect display format
   */
  private static detectFormat(columnName: string, values: any[], type: string): string | undefined {
    if (type === 'numeric') {
      const lowerName = columnName.toLowerCase();
      if (lowerName.includes('price') || lowerName.includes('cost') || lowerName.includes('amount')) {
        return 'currency';
      }
      if (lowerName.includes('percent') || lowerName.includes('rate')) {
        return 'percentage';
      }
      return 'number';
    }
    
    if (type === 'date') {
      return 'date';
    }
    
    return undefined;
  }
  
  /**
   * Generate improvement suggestions
   */
  private static generateSuggestions(
    column: EnhancedColumnInfo, 
    qualityAssessment: { score: number; issues: QualityIssue[] }
  ): string[] {
    const suggestions: string[] = [];
    
    if (qualityAssessment.score < 80) {
      suggestions.push('Consider improving data quality before analysis');
    }
    
    if (column.statistics?.nullCount && column.statistics.nullCount > 0) {
      suggestions.push('Address missing values through imputation or data source improvement');
    }
    
    if (column.semanticType === 'identifier' && column.statistics?.uniqueCount !== column.values.length) {
      suggestions.push('Ensure identifier uniqueness for reliable data relationships');
    }
    
    if (column.type === 'numeric' && column.statistics?.outliers && column.statistics.outliers.length > 0) {
      suggestions.push('Review outliers for data accuracy or consider outlier treatment');
    }
    
    return suggestions;
  }
}
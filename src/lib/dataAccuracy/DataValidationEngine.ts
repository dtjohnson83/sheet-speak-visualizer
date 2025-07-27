import { DataRow, ColumnInfo } from '@/pages/Index';
import { analyzeDatasetInsights } from '@/lib/analysis/statisticalAnalysis';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  aggregations: Map<string, any>;
  statisticalSummary: any;
}

export interface RegionalAggregation {
  region: string;
  count: number;
  total?: number;
  average?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export class DataValidationEngine {
  static validateAndPrecompute(
    data: DataRow[], 
    columns: ColumnInfo[], 
    fileName?: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const aggregations = new Map<string, any>();

    // Basic data validation
    if (data.length === 0) {
      errors.push('Dataset is empty');
      return { isValid: false, errors, warnings, aggregations, statisticalSummary: null };
    }

    if (columns.length === 0) {
      errors.push('No columns found in dataset');
      return { isValid: false, errors, warnings, aggregations, statisticalSummary: null };
    }

    // Generate statistical summary for fact-checking
    const statisticalSummary = analyzeDatasetInsights(data, columns);

    // Pre-compute regional aggregations if geography data exists
    const geographyColumns = this.identifyGeographyColumns(columns);
    if (geographyColumns.length > 0) {
      const regionalAggregations = this.computeRegionalAggregations(data, geographyColumns, columns);
      aggregations.set('regional', regionalAggregations);
    }

    // Pre-compute temporal aggregations if date columns exist
    const dateColumns = this.identifyDateColumns(columns);
    if (dateColumns.length > 0) {
      const temporalAggregations = this.computeTemporalAggregations(data, dateColumns, columns);
      aggregations.set('temporal', temporalAggregations);
    }

    // Compute column-level statistics for validation
    const columnStatistics = this.computeColumnStatistics(data, columns);
    aggregations.set('columns', columnStatistics);

    // Data quality checks
    const qualityIssues = this.performQualityChecks(data, columns);
    warnings.push(...qualityIssues);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      aggregations,
      statisticalSummary
    };
  }

  static factCheckClaim(claim: string, validationResult: ValidationResult): boolean {
    // Extract numerical values from claims and compare against pre-computed aggregations
    const numberPattern = /\d+(?:\.\d+)?/g;
    const numbers = claim.match(numberPattern);
    
    if (!numbers) return true; // No numerical claims to check

    // Check against regional data if claim mentions regions
    if (claim.toLowerCase().includes('region') && validationResult.aggregations.has('regional')) {
      const regionalData = validationResult.aggregations.get('regional');
      // Implement specific regional validation logic
      return this.validateRegionalClaim(claim, regionalData);
    }

    return true; // Default to valid if no specific checks apply
  }

  private static identifyGeographyColumns(columns: ColumnInfo[]): ColumnInfo[] {
    const geographyKeywords = ['region', 'country', 'state', 'city', 'location', 'area', 'zone'];
    return columns.filter(col => 
      geographyKeywords.some(keyword => 
        col.name.toLowerCase().includes(keyword)
      )
    );
  }

  private static identifyDateColumns(columns: ColumnInfo[]): ColumnInfo[] {
    return columns.filter(col => 
      col.type === 'date' || 
      col.name.toLowerCase().includes('date') ||
      col.name.toLowerCase().includes('time')
    );
  }

  private static computeRegionalAggregations(
    data: DataRow[], 
    geographyColumns: ColumnInfo[], 
    allColumns: ColumnInfo[]
  ): RegionalAggregation[] {
    const numericColumns = allColumns.filter(col => col.type === 'numeric');
    const primaryGeoColumn = geographyColumns[0];
    
    if (!primaryGeoColumn || numericColumns.length === 0) return [];

    const regionMap = new Map<string, { values: number[], count: number }>();

    data.forEach(row => {
      const region = row[primaryGeoColumn.name]?.toString() || 'Unknown';
      
      if (!regionMap.has(region)) {
        regionMap.set(region, { values: [], count: 0 });
      }

      const regionData = regionMap.get(region)!;
      regionData.count += 1;

      // Aggregate numeric values for this region
      numericColumns.forEach(col => {
        const value = parseFloat(row[col.name]);
        if (!isNaN(value)) {
          regionData.values.push(value);
        }
      });
    });

    return Array.from(regionMap.entries()).map(([region, data]) => {
      const total = data.values.reduce((sum, val) => sum + val, 0);
      const average = data.values.length > 0 ? total / data.values.length : 0;
      
      // Simple trend calculation (could be enhanced)
      const midpoint = Math.floor(data.values.length / 2);
      const firstHalf = data.values.slice(0, midpoint);
      const secondHalf = data.values.slice(midpoint);
      
      const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length : 0;
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length : 0;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';

      return {
        region,
        count: data.count,
        total,
        average,
        trend
      };
    });
  }

  private static computeTemporalAggregations(
    data: DataRow[], 
    dateColumns: ColumnInfo[], 
    allColumns: ColumnInfo[]
  ): any[] {
    // Simplified temporal aggregation - could be enhanced
    return [];
  }

  private static computeColumnStatistics(data: DataRow[], columns: ColumnInfo[]): Map<string, any> {
    const stats = new Map<string, any>();

    columns.forEach(col => {
      const values = data.map(row => row[col.name]).filter(v => v !== null && v !== undefined);
      
      if (col.type === 'numeric') {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          stats.set(col.name, {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            average: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
            total: numericValues.reduce((sum, val) => sum + val, 0),
            count: numericValues.length
          });
        }
      } else {
        const uniqueValues = new Set(values);
        stats.set(col.name, {
          uniqueCount: uniqueValues.size,
          totalCount: values.length,
          mostCommon: this.getMostCommonValue(values)
        });
      }
    });

    return stats;
  }

  private static getMostCommonValue(values: any[]): any {
    const counts = new Map<any, number>();
    values.forEach(val => {
      counts.set(val, (counts.get(val) || 0) + 1);
    });
    
    let maxCount = 0;
    let mostCommon = null;
    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = value;
      }
    });

    return mostCommon;
  }

  private static performQualityChecks(data: DataRow[], columns: ColumnInfo[]): string[] {
    const warnings: string[] = [];

    // Check for high missing value rates
    columns.forEach(col => {
      const totalValues = data.length;
      const nonNullValues = data.filter(row => {
        const value = row[col.name];
        return value !== null && value !== undefined && value !== '';
      }).length;

      const completeness = nonNullValues / totalValues;
      if (completeness < 0.5) {
        warnings.push(`Column '${col.name}' has ${Math.round((1 - completeness) * 100)}% missing values`);
      }
    });

    return warnings;
  }

  private static validateRegionalClaim(claim: string, regionalData: RegionalAggregation[]): boolean {
    // Extract potential region names and numerical claims from the text
    // This is a simplified implementation - could be enhanced with NLP
    
    // For now, just check if the claim mentions valid regions
    const mentionedRegions = regionalData.filter(region => 
      claim.toLowerCase().includes(region.region.toLowerCase())
    );

    return mentionedRegions.length > 0;
  }
}

import { useState, useCallback, useEffect } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface DataQualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  validity: number;
  overall: number;
}

export interface QualityIssue {
  id: string;
  type: 'missing' | 'duplicate' | 'invalid' | 'inconsistent' | 'outlier';
  column: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  count: number;
  examples: any[];
  recommendation: string;
}

export interface QualityTrend {
  date: string;
  score: number;
  issues: number;
}

export const useDataQualityAgent = () => {
  const [metrics, setMetrics] = useState<DataQualityMetrics>({
    completeness: 0,
    consistency: 0,
    accuracy: 0,
    validity: 0,
    overall: 0
  });

  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trends, setTrends] = useState<QualityTrend[]>([]);

  const analyzeDataQuality = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[]
  ) => {
    console.log('Starting data quality analysis...');
    setIsAnalyzing(true);

    try {
      const qualityIssues: QualityIssue[] = [];
      let totalCells = data.length * columns.length;
      let validCells = 0;
      let completeCells = 0;

      // Analyze each column
      for (const column of columns) {
        const columnData = data.map(row => row[column.name]);
        const nonNullData = columnData.filter(val => val !== null && val !== undefined && val !== '');
        
        // Completeness check
        const completeness = nonNullData.length / data.length;
        completeCells += nonNullData.length;
        
        if (completeness < 0.95) {
          qualityIssues.push({
            id: `missing_${column.name}_${Date.now()}`,
            type: 'missing',
            column: column.name,
            severity: completeness < 0.8 ? 'high' : completeness < 0.9 ? 'medium' : 'low',
            description: `${((1 - completeness) * 100).toFixed(1)}% missing values`,
            count: data.length - nonNullData.length,
            examples: columnData.filter((val, idx) => (val === null || val === undefined || val === '') && idx < 5),
            recommendation: 'Fill missing values with appropriate defaults or remove incomplete records'
          });
        }

        // Type validation
        if (column.type === 'numeric') {
          const invalidNumbers = nonNullData.filter(val => isNaN(Number(val)));
          validCells += nonNullData.length - invalidNumbers.length;
          
          if (invalidNumbers.length > 0) {
            qualityIssues.push({
              id: `invalid_${column.name}_${Date.now()}`,
              type: 'invalid',
              column: column.name,
              severity: invalidNumbers.length > nonNullData.length * 0.1 ? 'high' : 'medium',
              description: `${invalidNumbers.length} non-numeric values in numeric column`,
              count: invalidNumbers.length,
              examples: invalidNumbers.slice(0, 5),
              recommendation: 'Convert invalid values to numbers or remove them'
            });
          }
        } else {
          validCells += nonNullData.length;
        }

        // Duplicate detection (for key columns)
        if (column.name.toLowerCase().includes('id') || column.name.toLowerCase().includes('key')) {
          const uniqueValues = new Set(nonNullData);
          const duplicateCount = nonNullData.length - uniqueValues.size;
          
          if (duplicateCount > 0) {
            qualityIssues.push({
              id: `duplicate_${column.name}_${Date.now()}`,
              type: 'duplicate',
              column: column.name,
              severity: duplicateCount > nonNullData.length * 0.05 ? 'high' : 'medium',
              description: `${duplicateCount} duplicate values in identifier column`,
              count: duplicateCount,
              examples: [],
              recommendation: 'Remove or consolidate duplicate records'
            });
          }
        }
      }

      // Calculate overall metrics
      const completeness = completeCells / totalCells;
      const validity = validCells / totalCells;
      const consistency = 1 - (qualityIssues.filter(i => i.type === 'inconsistent').length / data.length);
      const accuracy = 1 - (qualityIssues.filter(i => i.type === 'outlier').length / data.length);
      const overall = (completeness + validity + consistency + accuracy) / 4;

      const newMetrics: DataQualityMetrics = {
        completeness: completeness * 100,
        consistency: consistency * 100,
        accuracy: accuracy * 100,
        validity: validity * 100,
        overall: overall * 100
      };

      setMetrics(newMetrics);
      setIssues(qualityIssues);

      // Update trends
      const newTrend: QualityTrend = {
        date: new Date().toISOString().split('T')[0],
        score: overall * 100,
        issues: qualityIssues.length
      };

      setTrends(prev => {
        const updated = [...prev, newTrend];
        return updated.slice(-30); // Keep last 30 days
      });

      console.log('Data quality analysis completed:', {
        metrics: newMetrics,
        issues: qualityIssues.length,
        trends: trends.length + 1
      });

    } catch (error) {
      console.error('Data quality analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [trends.length]);

  const getQualityScore = useCallback(() => {
    return metrics.overall;
  }, [metrics.overall]);

  const getIssuesBySeverity = useCallback((severity: 'low' | 'medium' | 'high') => {
    return issues.filter(issue => issue.severity === severity);
  }, [issues]);

  const getTrendData = useCallback(() => {
    return trends;
  }, [trends]);

  return {
    metrics,
    issues,
    isAnalyzing,
    trends,
    analyzeDataQuality,
    getQualityScore,
    getIssuesBySeverity,
    getTrendData
  };
};

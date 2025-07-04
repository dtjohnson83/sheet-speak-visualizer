import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DataQualityIssue, DataQualityScore, DataQualityReport } from '@/components/agents/data-quality/types';

export const useDataQualityAnalysis = (data: DataRow[], columns: ColumnInfo[]) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState<DataQualityScore | null>(null);
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const analyzeDataQuality = useCallback(async (onReportGenerated?: (report: DataQualityReport) => void) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const detectedIssues: DataQualityIssue[] = [];
      let totalCompleteness = 0;
      let totalConsistency = 0;
      let totalUniqueness = 0;
      
      // Analyze each column
      columns.forEach(column => {
        const columnData = data.map(row => row[column.name]);
        const totalRows = columnData.length;
        
        // Completeness check
        const nullCount = columnData.filter(value => 
          value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '')
        ).length;
        const completenessScore = ((totalRows - nullCount) / totalRows) * 100;
        totalCompleteness += completenessScore;
        
        if (completenessScore < 95) {
          detectedIssues.push({
            type: 'completeness',
            severity: completenessScore < 80 ? 'high' : completenessScore < 90 ? 'medium' : 'low',
            column: column.name,
            description: `Column has ${nullCount} missing values (${(100 - completenessScore).toFixed(1)}% missing)`,
            affectedRows: nullCount,
            percentage: 100 - completenessScore
          });
        }
        
        // Uniqueness check (for potential ID columns)
        const nonNullValues = columnData.filter(value => value !== null && value !== undefined && value !== '');
        const uniqueValues = new Set(nonNullValues).size;
        const uniquenessScore = nonNullValues.length > 0 ? (uniqueValues / nonNullValues.length) * 100 : 100;
        totalUniqueness += uniquenessScore;
        
        if (uniquenessScore < 100 && column.name.toLowerCase().includes('id')) {
          const duplicates = nonNullValues.length - uniqueValues;
          detectedIssues.push({
            type: 'uniqueness',
            severity: duplicates > totalRows * 0.1 ? 'high' : duplicates > totalRows * 0.05 ? 'medium' : 'low',
            column: column.name,
            description: `Potential ID column has ${duplicates} duplicate values`,
            affectedRows: duplicates,
            percentage: (duplicates / totalRows) * 100
          });
        }
        
        // Consistency checks for numeric data
        if (column.type === 'numeric') {
          const numericValues = columnData.filter(value => !isNaN(Number(value)) && value !== null && value !== '');
          const nonNumericCount = totalRows - nullCount - numericValues.length;
          const consistencyScore = ((totalRows - nullCount - nonNumericCount) / (totalRows - nullCount)) * 100;
          totalConsistency += consistencyScore;
          
          if (nonNumericCount > 0) {
            detectedIssues.push({
              type: 'consistency',
              severity: nonNumericCount > (totalRows - nullCount) * 0.1 ? 'high' : 'medium',
              column: column.name,
              description: `Numeric column contains ${nonNumericCount} non-numeric values`,
              affectedRows: nonNumericCount,
              percentage: (nonNumericCount / (totalRows - nullCount)) * 100
            });
          }
        } else {
          totalConsistency += 100; // Non-numeric columns get full consistency score
        }
        
        // Date consistency checks
        if (column.type === 'date') {
          const invalidDates = columnData.filter(value => {
            if (value === null || value === undefined || value === '') return false;
            const date = new Date(value);
            return isNaN(date.getTime());
          }).length;
          
          if (invalidDates > 0) {
            detectedIssues.push({
              type: 'consistency',
              severity: invalidDates > (totalRows - nullCount) * 0.05 ? 'high' : 'medium',
              column: column.name,
              description: `Date column contains ${invalidDates} invalid date values`,
              affectedRows: invalidDates,
              percentage: (invalidDates / (totalRows - nullCount)) * 100
            });
          }
        }
      });
      
      // Calculate average scores
      const avgCompleteness = totalCompleteness / columns.length;
      const avgConsistency = totalConsistency / columns.length;
      const avgUniqueness = totalUniqueness / columns.length;
      const avgAccuracy = 95; // Simplified accuracy score
      const avgTimeliness = 90; // Simplified timeliness score
      
      const overallScore = (avgCompleteness + avgConsistency + avgUniqueness + avgAccuracy + avgTimeliness) / 5;
      
      const newQualityScore = {
        overall: overallScore,
        completeness: avgCompleteness,
        consistency: avgConsistency,
        accuracy: avgAccuracy,
        uniqueness: avgUniqueness,
        timeliness: avgTimeliness
      };
      
      setQualityScore(newQualityScore);
      
      const sortedIssues = detectedIssues.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
      
      setIssues(sortedIssues);
      setLastAnalysis(new Date());
      
      // Generate report for parent component
      if (onReportGenerated) {
        onReportGenerated({
          timestamp: new Date().toISOString(),
          datasetInfo: {
            rows: data.length,
            columns: columns.length
          },
          qualityScore: newQualityScore,
          issues: sortedIssues,
          summary: {
            totalIssues: sortedIssues.length,
            highSeverityIssues: sortedIssues.filter(i => i.severity === 'high').length,
            affectedColumns: new Set(sortedIssues.map(i => i.column)).size
          }
        });
      }
      
    } catch (error) {
      console.error('Error analyzing data quality:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [data, columns]);

  return {
    isAnalyzing,
    qualityScore,
    issues,
    lastAnalysis,
    analyzeDataQuality
  };
};
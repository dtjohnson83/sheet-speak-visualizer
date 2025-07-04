import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DataQualityIssue, DataQualityScore, DataQualityReport } from '@/components/agents/data-quality/types';

interface QualityTrend {
  date: string;
  overall: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
  timeliness: number;
  issues: number;
}

export const useDataQualityAnalysis = (data: DataRow[], columns: ColumnInfo[]) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [qualityScore, setQualityScore] = useState<DataQualityScore | null>(null);
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [qualityTrends, setQualityTrends] = useState<QualityTrend[]>([]);
  const [autoFixSuggestions, setAutoFixSuggestions] = useState<Array<{
    issueIndex: number;
    fixType: 'remove_duplicates' | 'fill_missing' | 'standardize_format';
    description: string;
  }>>([]);

  const analyzeDataQuality = useCallback(async (onReportGenerated?: (report: DataQualityReport) => void) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAutoFixSuggestions([]);
    
    try {
      const detectedIssues: DataQualityIssue[] = [];
      const suggestions: Array<{
        issueIndex: number;
        fixType: 'remove_duplicates' | 'fill_missing' | 'standardize_format';
        description: string;
      }> = [];
      
      // Enhanced weighted scoring system
      const weights = {
        completeness: 0.25,
        consistency: 0.25,
        accuracy: 0.2,
        uniqueness: 0.15,
        timeliness: 0.15
      };
      
      let totalCompleteness = 0;
      let totalConsistency = 0;
      let totalUniqueness = 0;
      let totalAccuracy = 0;
      
      // Progress tracking
      const totalSteps = columns.length;
      
      // Analyze each column with progress updates
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const columnData = data.map(row => row[column.name]);
        const totalRows = columnData.length;
        
        // Update progress
        setAnalysisProgress(Math.round((i / totalSteps) * 70)); // 70% for column analysis
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
        
        // Enhanced completeness check
        const nullCount = columnData.filter(value => 
          value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '')
        ).length;
        const completenessScore = ((totalRows - nullCount) / totalRows) * 100;
        totalCompleteness += completenessScore;
        
        if (completenessScore < 95) {
          const issueIndex = detectedIssues.length;
          detectedIssues.push({
            type: 'completeness',
            severity: completenessScore < 80 ? 'high' : completenessScore < 90 ? 'medium' : 'low',
            column: column.name,
            description: `Column has ${nullCount} missing values (${(100 - completenessScore).toFixed(1)}% missing)`,
            affectedRows: nullCount,
            percentage: 100 - completenessScore
          });
          
          // Add auto-fix suggestion
          if (nullCount > 0 && nullCount < totalRows * 0.3) {
            suggestions.push({
              issueIndex,
              fixType: 'fill_missing',
              description: `Suggest filling missing values with median/mode for ${column.name}`
            });
          }
        }
        
        // Enhanced uniqueness check with statistical analysis
        const nonNullValues = columnData.filter(value => value !== null && value !== undefined && value !== '');
        const uniqueValues = new Set(nonNullValues).size;
        const uniquenessScore = nonNullValues.length > 0 ? (uniqueValues / nonNullValues.length) * 100 : 100;
        totalUniqueness += uniquenessScore;
        
        // Check for potential ID columns or unique constraints
        const isLikelyIdColumn = column.name.toLowerCase().includes('id') || 
                               column.name.toLowerCase().includes('key') ||
                               column.name.toLowerCase().includes('identifier');
        
        if (uniquenessScore < 100 && (isLikelyIdColumn || uniquenessScore < 95)) {
          const duplicates = nonNullValues.length - uniqueValues;
          const issueIndex = detectedIssues.length;
          detectedIssues.push({
            type: 'uniqueness',
            severity: duplicates > totalRows * 0.1 ? 'high' : duplicates > totalRows * 0.05 ? 'medium' : 'low',
            column: column.name,
            description: isLikelyIdColumn 
              ? `ID column has ${duplicates} duplicate values`
              : `Column has ${duplicates} duplicate values (${(100 - uniquenessScore).toFixed(1)}% duplicates)`,
            affectedRows: duplicates,
            percentage: (duplicates / totalRows) * 100
          });
          
          // Add auto-fix suggestion for duplicates
          if (duplicates > 0) {
            suggestions.push({
              issueIndex,
              fixType: 'remove_duplicates',
              description: `Remove ${duplicates} duplicate values from ${column.name}`
            });
          }
        }
        
        // Enhanced consistency checks
        let consistencyScore = 100;
        let accuracyScore = 100;
        
        if (column.type === 'numeric') {
          const numericValues = columnData.filter(value => !isNaN(Number(value)) && value !== null && value !== '');
          const nonNumericCount = totalRows - nullCount - numericValues.length;
          consistencyScore = totalRows > nullCount ? ((totalRows - nullCount - nonNumericCount) / (totalRows - nullCount)) * 100 : 100;
          
          // Statistical outlier detection
          if (numericValues.length > 0) {
            const numbers = numericValues.map(v => Number(v));
            const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
            const std = Math.sqrt(numbers.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numbers.length);
            const outliers = numbers.filter(n => Math.abs(n - mean) > 3 * std).length;
            
            if (outliers > numbers.length * 0.05) {
              accuracyScore -= (outliers / numbers.length) * 100;
              detectedIssues.push({
                type: 'accuracy',
                severity: outliers > numbers.length * 0.1 ? 'high' : 'medium',
                column: column.name,
                description: `${outliers} potential outliers detected (values beyond 3 standard deviations)`,
                affectedRows: outliers,
                percentage: (outliers / numbers.length) * 100
              });
            }
          }
          
          if (nonNumericCount > 0) {
            const issueIndex = detectedIssues.length;
            detectedIssues.push({
              type: 'consistency',
              severity: nonNumericCount > (totalRows - nullCount) * 0.1 ? 'high' : 'medium',
              column: column.name,
              description: `Numeric column contains ${nonNumericCount} non-numeric values`,
              affectedRows: nonNumericCount,
              percentage: (nonNumericCount / (totalRows - nullCount)) * 100
            });
            
            suggestions.push({
              issueIndex,
              fixType: 'standardize_format',
              description: `Standardize format for ${nonNumericCount} non-numeric values in ${column.name}`
            });
          }
        }
        
        // Enhanced date consistency checks
        if (column.type === 'date') {
          const invalidDates = columnData.filter(value => {
            if (value === null || value === undefined || value === '') return false;
            const date = new Date(value);
            return isNaN(date.getTime());
          }).length;
          
          if (invalidDates > 0) {
            consistencyScore -= (invalidDates / (totalRows - nullCount)) * 100;
            const issueIndex = detectedIssues.length;
            detectedIssues.push({
              type: 'consistency',
              severity: invalidDates > (totalRows - nullCount) * 0.05 ? 'high' : 'medium',
              column: column.name,
              description: `Date column contains ${invalidDates} invalid date values`,
              affectedRows: invalidDates,
              percentage: (invalidDates / (totalRows - nullCount)) * 100
            });
            
            suggestions.push({
              issueIndex,
              fixType: 'standardize_format',
              description: `Standardize date format for ${invalidDates} invalid dates in ${column.name}`
            });
          }
        }
        
        totalConsistency += consistencyScore;
        totalAccuracy += accuracyScore;
      }
      
      setAnalysisProgress(80); // 80% complete
      
      // Calculate weighted scores
      const avgCompleteness = totalCompleteness / columns.length;
      const avgConsistency = totalConsistency / columns.length;
      const avgUniqueness = totalUniqueness / columns.length;
      const avgAccuracy = totalAccuracy / columns.length;
      const avgTimeliness = 90; // Simplified timeliness score
      
      // Apply weighted scoring
      const overallScore = (
        avgCompleteness * weights.completeness +
        avgConsistency * weights.consistency +
        avgAccuracy * weights.accuracy +
        avgUniqueness * weights.uniqueness +
        avgTimeliness * weights.timeliness
      );
      
      const newQualityScore = {
        overall: overallScore,
        completeness: avgCompleteness,
        consistency: avgConsistency,
        accuracy: avgAccuracy,
        uniqueness: avgUniqueness,
        timeliness: avgTimeliness
      };
      
      setAnalysisProgress(90); // 90% complete
      
      setQualityScore(newQualityScore);
      
      const sortedIssues = detectedIssues.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
      
      setIssues(sortedIssues);
      setAutoFixSuggestions(suggestions);
      setLastAnalysis(new Date());
      setAnalysisProgress(100); // Complete
      
      // Update quality trends
      const newTrend: QualityTrend = {
        date: new Date().toISOString(),
        overall: overallScore,
        completeness: avgCompleteness,
        consistency: avgConsistency,
        accuracy: avgAccuracy,
        uniqueness: avgUniqueness,
        timeliness: avgTimeliness,
        issues: sortedIssues.length
      };
      
      setQualityTrends(prev => {
        const updated = [...prev, newTrend];
        // Keep only last 30 days of trends
        return updated.slice(-30);
      });
      
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
      setAnalysisProgress(0);
    }
  }, [data, columns]);

  return {
    isAnalyzing,
    analysisProgress,
    qualityScore,
    issues,
    lastAnalysis,
    qualityTrends,
    autoFixSuggestions,
    analyzeDataQuality
  };
};
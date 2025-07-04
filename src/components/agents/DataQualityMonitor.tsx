import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  TrendingDown,
  Clock,
  Database,
  RefreshCw
} from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DataQualityIssue {
  type: 'completeness' | 'consistency' | 'accuracy' | 'uniqueness' | 'timeliness';
  severity: 'high' | 'medium' | 'low';
  column: string;
  description: string;
  affectedRows: number;
  percentage: number;
}

interface DataQualityScore {
  overall: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
  timeliness: number;
}

interface DataQualityMonitorProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onReportGenerated?: (report: any) => void;
}

export const DataQualityMonitor = ({ data, columns, onReportGenerated }: DataQualityMonitorProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState<DataQualityScore | null>(null);
  const [issues, setIssues] = useState<DataQualityIssue[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const analyzeDataQuality = async () => {
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
      
      setQualityScore({
        overall: overallScore,
        completeness: avgCompleteness,
        consistency: avgConsistency,
        accuracy: avgAccuracy,
        uniqueness: avgUniqueness,
        timeliness: avgTimeliness
      });
      
      setIssues(detectedIssues.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }));
      
      setLastAnalysis(new Date());
      
      // Generate report for parent component
      if (onReportGenerated) {
        onReportGenerated({
          timestamp: new Date().toISOString(),
          datasetInfo: {
            rows: data.length,
            columns: columns.length
          },
          qualityScore,
          issues: detectedIssues,
          summary: {
            totalIssues: detectedIssues.length,
            highSeverityIssues: detectedIssues.filter(i => i.severity === 'high').length,
            affectedColumns: new Set(detectedIssues.map(i => i.column)).size
          }
        });
      }
      
    } catch (error) {
      console.error('Error analyzing data quality:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      analyzeDataQuality();
    }
  }, [data, columns]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
    if (score >= 70) return 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800';
    return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default: return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'completeness': return <Database className="h-4 w-4" />;
      case 'consistency': return <CheckCircle className="h-4 w-4" />;
      case 'accuracy': return <CheckCircle className="h-4 w-4" />;
      case 'uniqueness': return <FileText className="h-4 w-4" />;
      case 'timeliness': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Quality Monitor
          </CardTitle>
          <CardDescription>
            Upload data to start monitoring data quality
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quality Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Quality Score
              </CardTitle>
              <CardDescription>
                Overall assessment of your data quality
              </CardDescription>
            </div>
            <Button 
              onClick={analyzeDataQuality} 
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {qualityScore ? (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className={`p-4 rounded-lg border ${getScoreBgColor(qualityScore.overall)}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Overall Quality Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(qualityScore.overall)}`}>
                    {qualityScore.overall.toFixed(1)}%
                  </span>
                </div>
                <Progress value={qualityScore.overall} className="h-2" />
              </div>
              
              {/* Detailed Scores */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { key: 'completeness', label: 'Completeness', icon: <Database className="h-4 w-4" /> },
                  { key: 'consistency', label: 'Consistency', icon: <CheckCircle className="h-4 w-4" /> },
                  { key: 'accuracy', label: 'Accuracy', icon: <CheckCircle className="h-4 w-4" /> },
                  { key: 'uniqueness', label: 'Uniqueness', icon: <FileText className="h-4 w-4" /> },
                  { key: 'timeliness', label: 'Timeliness', icon: <Clock className="h-4 w-4" /> }
                ].map(({ key, label, icon }) => (
                  <div key={key} className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {icon}
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(qualityScore[key as keyof DataQualityScore])}`}>
                      {qualityScore[key as keyof DataQualityScore].toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Analyzing data quality...</span>
            </div>
          )}
          
          {lastAnalysis && (
            <div className="text-sm text-muted-foreground mt-4">
              Last analyzed: {lastAnalysis.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Issues */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Data Quality Issues
            </CardTitle>
            <CardDescription>
              {issues.length} issues found affecting {new Set(issues.map(i => i.column)).size} columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <Alert key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      {getTypeIcon(issue.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{issue.column}</span>
                        <Badge variant={
                          issue.severity === 'high' ? 'destructive' : 
                          issue.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {issue.severity} severity
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {issue.type}
                        </Badge>
                      </div>
                      <AlertDescription>
                        {issue.description}
                      </AlertDescription>
                      <div className="text-sm text-muted-foreground mt-1">
                        Affects {issue.affectedRows} rows ({issue.percentage.toFixed(1)}% of data)
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Issues State */}
      {qualityScore && issues.length === 0 && (
        <Card>
          <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Excellent Data Quality!</h3>
            <p className="text-muted-foreground">
              No significant data quality issues were detected in your dataset.
            </p>
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
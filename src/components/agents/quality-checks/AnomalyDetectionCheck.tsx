import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface AnomalyIssue {
  column: string;
  outliers: Array<{
    value: string;
    zScore?: number;
    iqrPosition?: string;
  }>;
  method: 'z-score' | 'iqr';
  threshold: number;
}

interface AnomalyDetectionCheckProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const AnomalyDetectionCheck = ({ data, columns }: AnomalyDetectionCheckProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [issues, setIssues] = useState<AnomalyIssue[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Auto-run the check when component mounts or data changes
  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      runAnomalyDetection();
    }
  }, [data, columns]);

  const calculateZScore = (value: number, mean: number, stdDev: number) => {
    return stdDev === 0 ? 0 : (value - mean) / stdDev;
  };

  const calculateIQR = (values: number[]) => {
    const sorted = values.sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    return { q1, q3, iqr, lowerBound: q1 - 1.5 * iqr, upperBound: q3 + 1.5 * iqr };
  };

  const runAnomalyDetection = () => {
    const anomalyIssues: AnomalyIssue[] = [];
    let totalOutliers = 0;
    let totalValues = 0;

    columns.forEach(column => {
      if (column.type !== 'numeric') return;

      const columnData = data.map(row => row[column.name]);
      const numericValues = columnData
        .filter(value => value !== null && value !== undefined && value !== '' && !isNaN(Number(value)))
        .map(Number);

      if (numericValues.length < 10) return; // Need sufficient data for meaningful anomaly detection

      totalValues += numericValues.length;

      // Z-Score method
      const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
      const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length;
      const stdDev = Math.sqrt(variance);

      const zScoreOutliers = columnData
        .map((value, index) => ({ value, index }))
        .filter(({ value }) => {
          const num = Number(value);
          if (isNaN(num)) return false;
          const zScore = calculateZScore(num, mean, stdDev);
          return Math.abs(zScore) > 3; // |z-score| > 3 is considered extreme outlier
        })
        .map(({ value }) => ({
          value: String(value),
          zScore: calculateZScore(Number(value), mean, stdDev)
        }));

      if (zScoreOutliers.length > 0) {
        anomalyIssues.push({
          column: column.name,
          outliers: zScoreOutliers,
          method: 'z-score',
          threshold: 3
        });
        totalOutliers += zScoreOutliers.length;
      }

      // IQR method (only if z-score didn't find outliers)
      if (zScoreOutliers.length === 0) {
        const { lowerBound, upperBound } = calculateIQR(numericValues);
        
        const iqrOutliers = columnData
          .filter(value => {
            const num = Number(value);
            return !isNaN(num) && (num < lowerBound || num > upperBound);
          })
          .map(value => ({
            value: String(value),
            iqrPosition: Number(value) < lowerBound ? 'below Q1' : 'above Q3'
          }));

        if (iqrOutliers.length > 0) {
          anomalyIssues.push({
            column: column.name,
            outliers: iqrOutliers,
            method: 'iqr',
            threshold: 1.5
          });
          totalOutliers += iqrOutliers.length;
        }
      }
    });

    setIssues(anomalyIssues);
    setScore(totalValues > 0 ? ((totalValues - totalOutliers) / totalValues) * 100 : 100);
    setLastCheck(new Date());
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 95) return 'bg-green-50 border-green-200';
    if (score >= 90) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = () => {
    if (score === null) return <TrendingUp className="h-5 w-5 text-gray-400" />;
    if (score >= 95) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (score === null) return <Badge variant="secondary">Not Checked</Badge>;
    if (score >= 95) return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
    return <Badge variant="destructive">Outliers Found</Badge>;
  };

  return (
    <Card className={`w-full transition-all ${score !== null ? getScoreBgColor(score) : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Anomaly Detection</CardTitle>
              <CardDescription>
                Identifies statistical outliers using Z-scores and IQR methods
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {score !== null && (
              <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                {score.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={runAnomalyDetection} variant="outline" size="sm">
            {score === null ? 'Run Check' : 'Refresh'}
          </Button>
          
          {issues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {issues.reduce((sum, issue) => sum + issue.outliers.length, 0)} Outliers
            </Button>
          )}
        </div>

        {score !== null && issues.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No statistical outliers detected</p>
          </div>
        )}

        {isExpanded && issues.length > 0 && (
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <Alert key={index}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{issue.column}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{issue.outliers.length} outliers</Badge>
                        <Badge variant="secondary" className="capitalize">{issue.method}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Method: {issue.method === 'z-score' ? 'Z-Score (|z| > 3)' : 'IQR (1.5×IQR rule)'}
                    </p>
                    <div className="text-xs text-gray-500">
                      <div className="font-medium mb-1">Outlier values:</div>
                      <div className="grid grid-cols-2 gap-1">
                        {issue.outliers.slice(0, 6).map((outlier, i) => (
                          <div key={i} className="text-xs">
                            {outlier.value}
                            {outlier.zScore && ` (z=${outlier.zScore.toFixed(2)})`}
                            {outlier.iqrPosition && ` (${outlier.iqrPosition})`}
                          </div>
                        ))}
                        {issue.outliers.length > 6 && (
                          <div className="text-xs italic">
                            +{issue.outliers.length - 6} more...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {lastCheck && (
          <div className="text-xs text-gray-500 mt-4">
            Last checked: {lastCheck.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
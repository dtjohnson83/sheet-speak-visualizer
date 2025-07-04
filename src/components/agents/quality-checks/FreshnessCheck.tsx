import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Clock, Settings } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface FreshnessIssue {
  column: string;
  staleRecords: number;
  oldestRecord: string;
  thresholdDays: number;
}

interface FreshnessCheckProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const FreshnessCheck = ({ data, columns }: FreshnessCheckProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [issues, setIssues] = useState<FreshnessIssue[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [thresholdDays, setThresholdDays] = useState(30);

  const runFreshnessCheck = () => {
    const freshnessIssues: FreshnessIssue[] = [];
    let totalStaleRecords = 0;
    let totalRecords = 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    columns.forEach(column => {
      const columnName = column.name.toLowerCase();
      
      // Look for date columns that might indicate record freshness
      if (column.type === 'date' || 
          columnName.includes('date') || 
          columnName.includes('created') || 
          columnName.includes('updated') || 
          columnName.includes('modified') ||
          columnName.includes('timestamp')) {
        
        const columnData = data.map(row => row[column.name]);
        const validDates = columnData
          .filter(value => value !== null && value !== undefined && value !== '')
          .map(value => new Date(value))
          .filter(date => !isNaN(date.getTime()));

        if (validDates.length === 0) return;

        totalRecords += validDates.length;

        const staleRecords = validDates.filter(date => date < cutoffDate);
        const oldestRecord = validDates.length > 0 ? 
          new Date(Math.min(...validDates.map(d => d.getTime()))) : null;

        if (staleRecords.length > 0) {
          freshnessIssues.push({
            column: column.name,
            staleRecords: staleRecords.length,
            oldestRecord: oldestRecord?.toLocaleDateString() || 'Unknown',
            thresholdDays
          });
          totalStaleRecords += staleRecords.length;
        }
      }
    });

    setIssues(freshnessIssues);
    setScore(totalRecords > 0 ? ((totalRecords - totalStaleRecords) / totalRecords) * 100 : 100);
    setLastCheck(new Date());
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = () => {
    if (score === null) return <Clock className="h-5 w-5 text-gray-400" />;
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (score === null) return <Badge variant="secondary">Not Checked</Badge>;
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Fresh</Badge>;
    return <Badge variant="destructive">Stale Data</Badge>;
  };

  return (
    <Card className={`w-full transition-all ${score !== null ? getScoreBgColor(score) : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Freshness Check</CardTitle>
              <CardDescription>
                Flags records older than the configured threshold
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
          <div className="flex gap-2">
            <Button onClick={runFreshnessCheck} variant="outline" size="sm">
              {score === null ? 'Run Check' : 'Refresh'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          {issues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {issues.reduce((sum, issue) => sum + issue.staleRecords, 0)} Stale Records
            </Button>
          )}
        </div>

        {showSettings && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="threshold">Freshness Threshold (days)</Label>
              <Input
                id="threshold"
                type="number"
                value={thresholdDays}
                onChange={(e) => setThresholdDays(Number(e.target.value))}
                min="1"
                max="365"
                className="w-32"
              />
              <p className="text-xs text-gray-600">
                Records older than {thresholdDays} days will be flagged as stale
              </p>
            </div>
          </div>
        )}

        {score !== null && issues.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">All records are within the freshness threshold</p>
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
                      <Badge variant="outline">{issue.staleRecords} stale records</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Records older than {issue.thresholdDays} days
                    </p>
                    <div className="text-xs text-gray-500">
                      Oldest record: {issue.oldestRecord}
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
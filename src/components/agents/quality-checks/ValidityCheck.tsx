import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface ValidityIssue {
  column: string;
  rule: string;
  violations: number;
  examples: string[];
}

interface ValidityCheckProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const ValidityCheck = ({ data, columns }: ValidityCheckProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [issues, setIssues] = useState<ValidityIssue[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Auto-run the check when component mounts or data changes
  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      runValidityCheck();
    }
  }, [data, columns]);

  const runValidityCheck = () => {
    const validityIssues: ValidityIssue[] = [];
    let totalViolations = 0;
    let totalChecks = 0;

    columns.forEach(column => {
      const columnData = data.map(row => row[column.name]);
      const nonNullData = columnData.filter(value => value !== null && value !== undefined && value !== '');

      // Age validation (must be positive and reasonable)
      if (column.name.toLowerCase().includes('age')) {
        const violations = nonNullData.filter(value => {
          const num = Number(value);
          return isNaN(num) || num < 0 || num > 150;
        });
        
        if (violations.length > 0) {
          validityIssues.push({
            column: column.name,
            rule: 'Age must be between 0 and 150',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // Date validation
      if (column.type === 'date' || column.name.toLowerCase().includes('date')) {
        const violations = nonNullData.filter(value => {
          const date = new Date(value);
          return isNaN(date.getTime()) || date.getFullYear() < 1900 || date.getFullYear() > 2100;
        });
        
        if (violations.length > 0) {
          validityIssues.push({
            column: column.name,
            rule: 'Dates must be valid and between 1900-2100',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // Price/Amount validation (must be non-negative)
      if (column.name.toLowerCase().includes('price') || 
          column.name.toLowerCase().includes('amount') ||
          column.name.toLowerCase().includes('cost') ||
          column.name.toLowerCase().includes('salary')) {
        const violations = nonNullData.filter(value => {
          const num = Number(value);
          return isNaN(num) || num < 0;
        });
        
        if (violations.length > 0) {
          validityIssues.push({
            column: column.name,
            rule: 'Financial values must be non-negative',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // Percentage validation (0-100)
      if (column.name.toLowerCase().includes('percent') ||
          column.name.toLowerCase().includes('rate') ||
          column.name.toLowerCase().includes('%')) {
        const violations = nonNullData.filter(value => {
          const num = Number(value);
          return isNaN(num) || num < 0 || num > 100;
        });
        
        if (violations.length > 0) {
          validityIssues.push({
            column: column.name,
            rule: 'Percentages must be between 0 and 100',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }
    });

    setIssues(validityIssues);
    setScore(totalChecks > 0 ? ((totalChecks - totalViolations) / totalChecks) * 100 : 100);
    setLastCheck(new Date());
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 95) return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
    if (score >= 80) return 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800';
    return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
  };

  const getStatusIcon = () => {
    if (score === null) return <Shield className="h-5 w-5 text-muted-foreground" />;
    if (score >= 95) return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  const getStatusBadge = () => {
    if (score === null) return <Badge variant="secondary">Not Checked</Badge>;
    if (score >= 95) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Pass</Badge>;
    return <Badge variant="destructive">Fail</Badge>;
  };

  return (
    <Card className={`w-full transition-all ${score !== null ? getScoreBgColor(score) : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Validity Check</CardTitle>
              <CardDescription>
                Ensures all values fall within expected ranges and types
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
          <Button onClick={runValidityCheck} variant="outline" size="sm">
            {score === null ? 'Run Check' : 'Refresh'}
          </Button>
          
          {issues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {issues.length} Issue{issues.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {score !== null && issues.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">All values pass validity checks</p>
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
                      <Badge variant="outline">{issue.violations} violations</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.rule}</p>
                    {issue.examples.length > 0 && (
                      <div className="text-xs text-muted-foreground/80">
                        Examples: {issue.examples.join(', ')}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {lastCheck && (
          <div className="text-xs text-muted-foreground/80 mt-4">
            Last checked: {lastCheck.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, FileCheck } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface ConformityIssue {
  column: string;
  rule: string;
  violations: number;
  examples: string[];
}

interface ConformityCheckProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const ConformityCheck = ({ data, columns }: ConformityCheckProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [issues, setIssues] = useState<ConformityIssue[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Auto-run the check when component mounts or data changes
  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      runConformityCheck();
    }
  }, [data, columns]);

  const runConformityCheck = () => {
    const conformityIssues: ConformityIssue[] = [];
    let totalViolations = 0;
    let totalChecks = 0;

    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[1-9][\d]{0,15}$|^\(\d{3}\)\s\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$/,
      zipCode: /^\d{5}(-\d{4})?$/,
      stateCode: /^[A-Z]{2}$/,
      isbn: /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
      url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
    };

    columns.forEach(column => {
      const columnData = data.map(row => row[column.name]);
      const nonNullData = columnData.filter(value => value !== null && value !== undefined && value !== '');
      
      if (nonNullData.length === 0) return;

      const columnName = column.name.toLowerCase();

      // Email validation
      if (columnName.includes('email') || columnName.includes('mail')) {
        const violations = nonNullData.filter(value => !patterns.email.test(String(value)));
        if (violations.length > 0) {
          conformityIssues.push({
            column: column.name,
            rule: 'Must be valid email format',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // Phone validation
      if (columnName.includes('phone') || columnName.includes('tel')) {
        const violations = nonNullData.filter(value => !patterns.phone.test(String(value).replace(/[^\d\+\(\)\-\s]/g, '')));
        if (violations.length > 0) {
          conformityIssues.push({
            column: column.name,
            rule: 'Must be valid phone number format',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // ZIP code validation
      if (columnName.includes('zip') || columnName.includes('postal')) {
        const violations = nonNullData.filter(value => !patterns.zipCode.test(String(value)));
        if (violations.length > 0) {
          conformityIssues.push({
            column: column.name,
            rule: 'Must be valid ZIP code format (12345 or 12345-6789)',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // State code validation
      if (columnName.includes('state') && columnName.includes('code')) {
        const violations = nonNullData.filter(value => !patterns.stateCode.test(String(value)));
        if (violations.length > 0) {
          conformityIssues.push({
            column: column.name,
            rule: 'Must be 2-letter state code (e.g., CA, NY)',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // URL validation
      if (columnName.includes('url') || columnName.includes('website') || columnName.includes('link')) {
        const violations = nonNullData.filter(value => !patterns.url.test(String(value)));
        if (violations.length > 0) {
          conformityIssues.push({
            column: column.name,
            rule: 'Must be valid URL format',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // ISBN validation
      if (columnName.includes('isbn')) {
        const violations = nonNullData.filter(value => !patterns.isbn.test(String(value)));
        if (violations.length > 0) {
          conformityIssues.push({
            column: column.name,
            rule: 'Must be valid ISBN format',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }

      // Naming convention checks (camelCase, snake_case, etc.)
      if (columnName.includes('name') || columnName.includes('title')) {
        const violations = nonNullData.filter(value => {
          const str = String(value);
          return str.length < 2 || /^\s|\s$/.test(str) || /\s{2,}/.test(str);
        });
        if (violations.length > 0) {
          conformityIssues.push({
            column: column.name,
            rule: 'Names should be properly formatted (no leading/trailing spaces, no double spaces)',
            violations: violations.length,
            examples: violations.slice(0, 3).map(String)
          });
        }
        totalViolations += violations.length;
        totalChecks += nonNullData.length;
      }
    });

    setIssues(conformityIssues);
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
    if (score === null) return <FileCheck className="h-5 w-5 text-muted-foreground" />;
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
              <CardTitle className="text-lg">Conformity Check</CardTitle>
              <CardDescription>
                Validates fields follow expected formats and conventions
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
          <Button onClick={runConformityCheck} variant="outline" size="sm">
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
            <p className="text-sm text-muted-foreground">All fields follow expected formats</p>
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
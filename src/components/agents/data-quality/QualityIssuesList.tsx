import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { DataQualityIssue } from './types';
import { getSeverityIcon, getTypeIcon } from './utils';

interface QualityIssuesListProps {
  issues: DataQualityIssue[];
}

export const QualityIssuesList = ({ issues }: QualityIssuesListProps) => {
  if (issues.length === 0) {
    return null;
  }

  return (
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
  );
};
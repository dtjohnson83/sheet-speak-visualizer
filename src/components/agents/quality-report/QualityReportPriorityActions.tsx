import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { QualityIssue } from './QualityReportTypes';
import { getCategoryIcon, getSeverityBadge } from './QualityReportUtils';

interface QualityReportPriorityActionsProps {
  highPriorityIssues: QualityIssue[];
}

export const QualityReportPriorityActions = ({ highPriorityIssues }: QualityReportPriorityActionsProps) => {
  return (
    <div className="space-y-6">
      {highPriorityIssues.length > 0 ? (
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{highPriorityIssues.length} high-priority issues</strong> require immediate attention to ensure data integrity.
            </AlertDescription>
          </Alert>
          
          {highPriorityIssues.map((issue, index) => (
            <Card key={index} className="border-destructive/20 bg-destructive/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(issue.category)}
                    <span className="font-medium">{issue.column || 'General'}</span>
                    {getSeverityBadge(issue.severity)}
                  </div>
                  <Badge variant="outline">Priority {issue.priority}/10</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Issue:</strong> {issue.description}</p>
                  <p className="text-sm"><strong>Action Required:</strong> {issue.recommendation}</p>
                  {issue.affectedRows && (
                    <p className="text-xs text-gray-600">
                      Impact: {issue.affectedRows} rows ({issue.percentage?.toFixed(1)}% of data)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No High-Priority Issues</h3>
              <p className="text-gray-600">
                Great! Your data doesn't have any critical issues requiring immediate attention.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
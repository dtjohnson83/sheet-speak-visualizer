import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { QualityIssue } from './QualityReportTypes';
import { getSeverityIcon, getSeverityBadge, getCategoryIcon } from './QualityReportUtils';

interface QualityReportIssuesListProps {
  issues: QualityIssue[];
}

export const QualityReportIssuesList = ({ issues }: QualityReportIssuesListProps) => {
  return (
    <div className="space-y-6">
      {issues.length > 0 ? (
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(issue.severity)}
                    {getCategoryIcon(issue.category)}
                    <span className="font-medium">{issue.column || 'General'}</span>
                    {getSeverityBadge(issue.severity)}
                    <Badge variant="outline" className="capitalize">{issue.category}</Badge>
                  </div>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">{issue.description}</p>
                  <p className="text-sm text-blue-600"><strong>Recommendation:</strong> {issue.recommendation}</p>
                  {issue.affectedRows && (
                    <p className="text-xs text-gray-500">
                      {issue.affectedRows} rows affected ({issue.percentage?.toFixed(1)}%)
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
              <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
              <p className="text-gray-600">
                Your data quality is excellent across all dimensions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Database } from 'lucide-react';

interface QualityEmptyStateProps {
  hasData: boolean;
  hasIssues: boolean;
}

export const QualityEmptyState = ({ hasData, hasIssues }: QualityEmptyStateProps) => {
  if (!hasData) {
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

  if (!hasIssues) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-700 dark:text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Excellent Data Quality!</h3>
            <p className="text-muted-foreground">
              No significant data quality issues were detected in your dataset.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
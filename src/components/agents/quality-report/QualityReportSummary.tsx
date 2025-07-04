import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { QualityIssue } from './QualityReportTypes';

interface QualityReportSummaryProps {
  issues: QualityIssue[];
  highPriorityIssues: QualityIssue[];
  mediumPriorityIssues: QualityIssue[];
  lowPriorityIssues: QualityIssue[];
}

export const QualityReportSummary = ({ 
  issues, 
  highPriorityIssues, 
  mediumPriorityIssues, 
  lowPriorityIssues 
}: QualityReportSummaryProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5" />
            <span className="font-medium">Total Issues</span>
          </div>
          <div className="text-2xl font-bold">{issues.length}</div>
        </Card>
        
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-medium">High Priority</span>
          </div>
          <div className="text-2xl font-bold text-destructive">{highPriorityIssues.length}</div>
        </Card>
        
        <Card className="p-4 bg-orange-500/10 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span className="font-medium">Medium Priority</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{mediumPriorityIssues.length}</div>
        </Card>
        
        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Low Priority</span>
          </div>
          <div className="text-2xl font-bold text-blue-500">{lowPriorityIssues.length}</div>
        </Card>
      </div>

      {issues.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Excellent Data Quality!</h3>
              <p className="text-gray-600">
                No significant data quality issues were detected in your dataset.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
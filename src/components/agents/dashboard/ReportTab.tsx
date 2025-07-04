import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { DataQualityReport } from '../DataQualityReport';

interface ReportTabProps {
  reportData: any;
  fileName: string;
  onGoToMonitor: () => void;
}

export const ReportTab = ({ reportData, fileName, onGoToMonitor }: ReportTabProps) => {
  if (!reportData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Report Generated</h3>
            <p className="text-gray-600 mb-4">
              Run the data quality monitor first to generate a report.
            </p>
            <Button onClick={onGoToMonitor}>
              Go to Monitor
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <DataQualityReport 
        reportData={reportData} 
        fileName={fileName}
      />
    </div>
  );
};
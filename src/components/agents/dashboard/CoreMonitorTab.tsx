import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataQualityMonitor } from '../DataQualityMonitor';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface CoreMonitorTabProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onReportGenerated: (report: any) => void;
}

export const CoreMonitorTab = ({ data, columns, onReportGenerated }: CoreMonitorTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Core Quality Metrics</CardTitle>
          <CardDescription>
            Traditional quality dimensions (completeness, consistency, accuracy, uniqueness, timeliness)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataQualityMonitor 
            data={data} 
            columns={columns} 
            onReportGenerated={onReportGenerated}
          />
        </CardContent>
      </Card>
    </div>
  );
};
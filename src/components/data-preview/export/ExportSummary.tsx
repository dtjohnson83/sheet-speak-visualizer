import { Card } from '@/components/ui/card';

interface ExportSummaryData {
  totalRows: number;
  totalColumns: number;
  memoryUsage: number;
}

interface ExportSummaryProps {
  summary: ExportSummaryData;
  selectedColumnsCount: number;
  exportFormat: string;
}

export const ExportSummary = ({ summary, selectedColumnsCount, exportFormat }: ExportSummaryProps) => {
  return (
    <Card className="p-4 bg-gray-50 dark:bg-gray-800">
      <div className="space-y-2">
        <div className="font-medium text-sm">Export Summary</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Rows:</span>
            <span className="ml-2 font-medium">{summary.totalRows.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Columns:</span>
            <span className="ml-2 font-medium">{selectedColumnsCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Format:</span>
            <span className="ml-2 font-medium">{exportFormat.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-gray-600">Est. Size:</span>
            <span className="ml-2 font-medium">{(summary.memoryUsage / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
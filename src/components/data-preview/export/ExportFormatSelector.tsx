import { Card } from '@/components/ui/card';
import { FileText, FileSpreadsheet } from 'lucide-react';

interface ExportFormatSelectorProps {
  exportFormat: 'csv' | 'excel';
  onFormatChange: (format: 'csv' | 'excel') => void;
}

export const ExportFormatSelector = ({ exportFormat, onFormatChange }: ExportFormatSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold">Export Format</label>
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className={`p-4 cursor-pointer transition-colors ${exportFormat === 'csv' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          onClick={() => onFormatChange('csv')}
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <div className="font-medium">CSV</div>
              <div className="text-sm text-gray-600">Comma-separated values</div>
            </div>
          </div>
        </Card>
        <Card 
          className={`p-4 cursor-pointer transition-colors ${exportFormat === 'excel' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          onClick={() => onFormatChange('excel')}
        >
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div>
              <div className="font-medium">Excel</div>
              <div className="text-sm text-gray-600">Excel workbook (.xlsx)</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
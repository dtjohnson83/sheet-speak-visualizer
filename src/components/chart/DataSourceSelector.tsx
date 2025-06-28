
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet } from 'lucide-react';
import { WorksheetData } from '@/types/worksheet';

interface DataSourceSelectorProps {
  worksheets: WorksheetData[];
  selectedWorksheet: WorksheetData | null;
  onWorksheetChange: (worksheet: WorksheetData | null) => void;
}

export const DataSourceSelector = ({
  worksheets,
  selectedWorksheet,
  onWorksheetChange
}: DataSourceSelectorProps) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Chart Data Source</label>
          <Select 
            value={selectedWorksheet?.id || ''} 
            onValueChange={(id) => {
              const worksheet = worksheets.find(ws => ws.id === id);
              onWorksheetChange(worksheet || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select data source for this chart..." />
            </SelectTrigger>
            <SelectContent>
              {worksheets.map((worksheet) => (
                <SelectItem key={worksheet.id} value={worksheet.id}>
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>{worksheet.fileName} - {worksheet.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {worksheet.data.length} rows
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedWorksheet && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{selectedWorksheet.data.length} rows</p>
            <p>{selectedWorksheet.columns.length} columns</p>
          </div>
        )}
      </div>
    </div>
  );
};

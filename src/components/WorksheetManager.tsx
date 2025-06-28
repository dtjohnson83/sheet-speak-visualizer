
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, X, Database } from 'lucide-react';
import { WorksheetData } from '@/types/worksheet';

interface WorksheetManagerProps {
  worksheets: WorksheetData[];
  selectedWorksheet: WorksheetData | null;
  onSelectWorksheet: (worksheet: WorksheetData) => void;
  onRemoveWorksheet: (worksheetId: string) => void;
}

export const WorksheetManager = ({
  worksheets,
  selectedWorksheet,
  onSelectWorksheet,
  onRemoveWorksheet
}: WorksheetManagerProps) => {
  if (worksheets.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Data Sources</h3>
          <Badge variant="secondary">{worksheets.length} sheet{worksheets.length !== 1 ? 's' : ''}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Active Data Source</label>
          <Select 
            value={selectedWorksheet?.id || ''} 
            onValueChange={(id) => {
              const worksheet = worksheets.find(ws => ws.id === id);
              if (worksheet) onSelectWorksheet(worksheet);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a data source..." />
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

        <div className="space-y-2">
          <label className="block text-sm font-medium">Loaded Worksheets</label>
          <div className="flex flex-wrap gap-2">
            {worksheets.map((worksheet) => (
              <div key={worksheet.id} className="flex items-center space-x-1">
                <Badge 
                  variant={selectedWorksheet?.id === worksheet.id ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => onSelectWorksheet(worksheet)}
                >
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  {worksheet.name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveWorksheet(worksheet.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedWorksheet && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{selectedWorksheet.fileName} - {selectedWorksheet.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedWorksheet.data.length} rows, {selectedWorksheet.columns.length} columns
              </p>
            </div>
            <div className="flex space-x-2">
              {selectedWorksheet.columns.slice(0, 3).map((col) => (
                <Badge key={col.name} variant="outline" className="text-xs">
                  {col.name} ({col.type})
                </Badge>
              ))}
              {selectedWorksheet.columns.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedWorksheet.columns.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

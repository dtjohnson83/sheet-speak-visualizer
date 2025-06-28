
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, ArrowRight, Download } from 'lucide-react';

interface WorksheetInfo {
  name: string;
  rowCount: number;
  data: any[];
}

interface WorksheetSelectorProps {
  worksheets: WorksheetInfo[];
  fileName: string;
  onWorksheetSelected: (worksheet: WorksheetInfo) => void;
  onLoadAllSheets?: () => void;
  onCancel: () => void;
  allowMultiple?: boolean;
}

export const WorksheetSelector = ({ 
  worksheets, 
  fileName, 
  onWorksheetSelected, 
  onLoadAllSheets,
  onCancel,
  allowMultiple = false
}: WorksheetSelectorProps) => {
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('');
  const [selectedWorksheets, setSelectedWorksheets] = useState<Set<string>>(new Set());

  const handleSelect = () => {
    if (allowMultiple) {
      // Load all selected worksheets
      selectedWorksheets.forEach(worksheetName => {
        const worksheet = worksheets.find(ws => ws.name === worksheetName);
        if (worksheet) {
          onWorksheetSelected(worksheet);
        }
      });
    } else {
      // Load single worksheet
      const worksheet = worksheets.find(ws => ws.name === selectedWorksheet);
      if (worksheet) {
        onWorksheetSelected(worksheet);
      }
    }
  };

  const handleLoadAll = () => {
    if (onLoadAllSheets) {
      onLoadAllSheets();
    }
  };

  const toggleWorksheetSelection = (worksheetName: string, checked: boolean) => {
    const newSelection = new Set(selectedWorksheets);
    if (checked) {
      newSelection.add(worksheetName);
    } else {
      newSelection.delete(worksheetName);
    }
    setSelectedWorksheets(newSelection);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <FileSpreadsheet className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Select Worksheets</h3>
        <p className="text-sm text-gray-600">
          {fileName} contains {worksheets.length} worksheets. Choose which ones to load:
        </p>
      </div>

      {allowMultiple ? (
        <div className="space-y-4">
          <div className="space-y-2">
            {worksheets.map((worksheet) => (
              <div key={worksheet.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={worksheet.name}
                  checked={selectedWorksheets.has(worksheet.name)}
                  onCheckedChange={(checked) => toggleWorksheetSelection(worksheet.name, !!checked)}
                />
                <label htmlFor={worksheet.name} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{worksheet.name}</span>
                    <span className="text-xs text-gray-500">
                      {worksheet.rowCount} rows
                    </span>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handleLoadAll}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Load All
            </Button>
            <Button 
              onClick={handleSelect} 
              disabled={selectedWorksheets.size === 0}
              className="flex-1"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Load Selected ({selectedWorksheets.size})
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Select value={selectedWorksheet} onValueChange={setSelectedWorksheet}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a worksheet..." />
            </SelectTrigger>
            <SelectContent>
              {worksheets.map((worksheet) => (
                <SelectItem key={worksheet.name} value={worksheet.name}>
                  <div className="flex justify-between items-center w-full">
                    <span>{worksheet.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {worksheet.rowCount} rows
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSelect} 
              disabled={!selectedWorksheet}
              className="flex-1"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

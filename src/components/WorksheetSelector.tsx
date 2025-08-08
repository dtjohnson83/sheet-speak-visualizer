
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, ArrowRight } from 'lucide-react';

interface WorksheetInfo {
  name: string;
  rowCount: number;
  data: any[];
}

interface WorksheetSelectorProps {
  worksheets: WorksheetInfo[];
  fileName: string;
  onWorksheetSelected: (worksheet: WorksheetInfo) => void;
  onCancel: () => void;
}

export const WorksheetSelector = ({ worksheets, fileName, onWorksheetSelected, onCancel }: WorksheetSelectorProps) => {
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('');

  const handleSelect = () => {
    const worksheet = worksheets.find(ws => ws.name === selectedWorksheet);
    if (worksheet) {
      onWorksheetSelected(worksheet);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <FileSpreadsheet className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Select Worksheet</h3>
        <p className="text-sm text-gray-600">
          {fileName} contains {worksheets.length} worksheets. Choose which one to visualize:
        </p>
      </div>

      <div className="space-y-4">
        <label htmlFor="worksheet-select" className="text-sm font-medium">Worksheet</label>
        <Select value={selectedWorksheet} onValueChange={setSelectedWorksheet}>
          <SelectTrigger id="worksheet-select" name="worksheet">
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
    </Card>
  );
};

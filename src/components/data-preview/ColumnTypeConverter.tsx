
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface ColumnTypeConverterProps {
  columns: ColumnInfo[];
  data: DataRow[];
  onDataUpdated: (newData: DataRow[], newColumns: ColumnInfo[]) => void;
}

export const ColumnTypeConverter = ({ columns, data, onDataUpdated }: ColumnTypeConverterProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [targetType, setTargetType] = useState<'numeric' | 'date' | 'categorical' | 'text'>('date');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const convertToDate = (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    
    try {
      const num = Number(value);
      // Check if it's an Excel date serial number
      if (!isNaN(num) && num >= 1 && num <= 100000 && Number.isInteger(num)) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
        return date.toISOString();
      }
      
      // Try to parse as regular date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (error) {
      console.warn('Failed to convert value to date:', value);
    }
    
    return null;
  };

  const convertColumnType = () => {
    if (!selectedColumn || !targetType) return;

    const column = columns.find(col => col.name === selectedColumn);
    if (!column) return;

    let convertedCount = 0;
    let failedCount = 0;

    const newData = data.map(row => {
      const value = row[selectedColumn];
      let convertedValue = value;

      if (targetType === 'date') {
        const dateValue = convertToDate(value);
        if (dateValue !== null) {
          convertedValue = dateValue;
          convertedCount++;
        } else if (value !== null && value !== undefined && value !== '') {
          failedCount++;
        }
      }

      return {
        ...row,
        [selectedColumn]: convertedValue
      };
    });

    const newColumns = columns.map(col => 
      col.name === selectedColumn 
        ? { ...col, type: targetType, values: newData.map(row => row[selectedColumn]).filter(v => v !== null && v !== undefined && v !== '') }
        : col
    );

    onDataUpdated(newData, newColumns);
    setIsOpen(false);
    setSelectedColumn('');

    toast({
      title: "Column converted",
      description: `Converted ${convertedCount} values to ${targetType}${failedCount > 0 ? `, ${failedCount} values could not be converted` : ''}`,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numeric': return 'bg-blue-100 text-blue-800';
      case 'date': return 'bg-green-100 text-green-800';
      case 'categorical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Convert Types
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Column Type</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Column</label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a column to convert" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.name} value={column.name}>
                    <div className="flex items-center space-x-2">
                      <span>{column.name}</span>
                      <Badge className={getTypeColor(column.type)}>
                        {column.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Target Type</label>
            <Select value={targetType} onValueChange={(value: any) => setTargetType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="numeric">Numeric</SelectItem>
                <SelectItem value="categorical">Categorical</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedColumn && targetType === 'date' && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p><strong>Date conversion:</strong></p>
              <ul className="list-disc list-inside mt-1">
                <li>Excel serial numbers will be converted to dates</li>
                <li>Valid date strings will be converted to ISO format</li>
                <li>Invalid values will remain unchanged</li>
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={convertColumnType} disabled={!selectedColumn}>
              Convert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

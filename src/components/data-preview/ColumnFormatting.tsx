
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';

export interface ColumnFormat {
  columnName: string;
  type: 'numeric' | 'date' | 'text' | 'categorical';
  format: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  dateFormat?: string;
  showThousandsSeparator?: boolean;
}

interface ColumnFormattingProps {
  columns: ColumnInfo[];
  formats: ColumnFormat[];
  onFormatsChange: (formats: ColumnFormat[]) => void;
}

const DEFAULT_DATE_FORMATS = [
  { value: 'YYYY-MM-DD', label: '2024-12-25' },
  { value: 'MM/DD/YYYY', label: '12/25/2024' },
  { value: 'DD/MM/YYYY', label: '25/12/2024' },
  { value: 'MMM DD, YYYY', label: 'Dec 25, 2024' },
  { value: 'MMMM DD, YYYY', label: 'December 25, 2024' },
  { value: 'DD MMM YYYY', label: '25 Dec 2024' },
  { value: 'YYYY-MM-DD HH:MM', label: '2024-12-25 14:30' },
  { value: 'MM/DD/YYYY HH:MM', label: '12/25/2024 14:30' }
];

export const ColumnFormatting = ({ columns, formats, onFormatsChange }: ColumnFormattingProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  const getColumnFormat = (columnName: string): ColumnFormat => {
    const existing = formats.find(f => f.columnName === columnName);
    if (existing) return existing;
    
    const column = columns.find(c => c.name === columnName);
    return {
      columnName,
      type: column?.type || 'text',
      format: 'default',
      decimals: 2,
      showThousandsSeparator: true,
      dateFormat: 'YYYY-MM-DD'
    };
  };

  const updateColumnFormat = (columnName: string, updates: Partial<ColumnFormat>) => {
    const currentFormat = getColumnFormat(columnName);
    const updatedFormat = { ...currentFormat, ...updates };
    
    const newFormats = formats.filter(f => f.columnName !== columnName);
    newFormats.push(updatedFormat);
    
    onFormatsChange(newFormats);
  };

  const formatableColumns = columns.filter(col => 
    col.type === 'numeric' || col.type === 'date' || col.type === 'text'
  );

  if (formatableColumns.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Format Columns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Column Formatting</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select Column</Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a column to format" />
              </SelectTrigger>
              <SelectContent>
                {formatableColumns.map(column => (
                  <SelectItem key={column.name} value={column.name}>
                    {column.name} ({column.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedColumn && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Format Settings for {selectedColumn}</h4>
              
              {(() => {
                const format = getColumnFormat(selectedColumn);
                const column = columns.find(c => c.name === selectedColumn);
                
                if (column?.type === 'numeric') {
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Decimal Places</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={format.decimals || 2}
                          onChange={(e) => updateColumnFormat(selectedColumn, { 
                            decimals: parseInt(e.target.value) || 0 
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Thousands Separator</Label>
                        <Select
                          value={format.showThousandsSeparator ? 'yes' : 'no'}
                          onValueChange={(value) => updateColumnFormat(selectedColumn, { 
                            showThousandsSeparator: value === 'yes' 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Show (1,234.56)</SelectItem>
                            <SelectItem value="no">Hide (1234.56)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Prefix</Label>
                        <Input
                          placeholder="e.g., $"
                          value={format.prefix || ''}
                          onChange={(e) => updateColumnFormat(selectedColumn, { 
                            prefix: e.target.value 
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Suffix</Label>
                        <Input
                          placeholder="e.g., %"
                          value={format.suffix || ''}
                          onChange={(e) => updateColumnFormat(selectedColumn, { 
                            suffix: e.target.value 
                          })}
                        />
                      </div>
                    </div>
                  );
                }
                
                if (column?.type === 'date') {
                  return (
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select
                        value={format.dateFormat || 'YYYY-MM-DD'}
                        onValueChange={(value) => updateColumnFormat(selectedColumn, { 
                          dateFormat: value 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_DATE_FORMATS.map(fmt => (
                            <SelectItem key={fmt.value} value={fmt.value}>
                              {fmt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                
                return (
                  <div className="text-sm text-gray-500">
                    No formatting options available for this column type.
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnInfo } from '@/pages/Index';

interface ColumnSelectorProps {
  columns: ColumnInfo[];
  selectedColumns: string[];
  onColumnToggle: (columnName: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export const ColumnSelector = ({
  columns,
  selectedColumns,
  onColumnToggle,
  onSelectAll
}: ColumnSelectorProps) => {
  const allSelected = selectedColumns.length === columns.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Select Columns</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
          <Label className="text-sm">Select All</Label>
        </div>
      </div>
      
      <Card className="p-3 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {columns.map((column) => (
            <div key={column.name} className="flex items-center space-x-2">
              <Checkbox
                id={`col-${column.name}`}
                checked={selectedColumns.includes(column.name)}
                onCheckedChange={(checked) => onColumnToggle(column.name, !!checked)}
              />
              <Label 
                htmlFor={`col-${column.name}`} 
                className="text-sm truncate flex-1 cursor-pointer"
                title={column.name}
              >
                {column.name}
                <span className="text-xs text-gray-500 ml-1">({column.type})</span>
              </Label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
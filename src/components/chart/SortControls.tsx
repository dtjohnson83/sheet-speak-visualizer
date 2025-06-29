
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';

interface SortControlsProps {
  sortColumn: string;
  setSortColumn: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
  columns: ColumnInfo[];
}

export const SortControls = ({
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  columns
}: SortControlsProps) => {
  // Helper function to display column names nicely
  const formatColumnDisplay = (col: ColumnInfo) => {
    // Check if column has worksheet info (for joined datasets)
    const hasWorksheetInfo = 'worksheet' in col && col.worksheet;
    if (hasWorksheetInfo) {
      return `${col.name} (${col.type}) - ${(col as any).worksheet}`;
    }
    return `${col.name} (${col.type})`;
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <Select value={sortColumn} onValueChange={setSortColumn}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {columns.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {formatColumnDisplay(col)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
        <label className="block text-sm font-medium mb-2">Sort Direction</label>
        <Button
          variant="outline"
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          disabled={!sortColumn || sortColumn === 'none'}
          className="flex items-center justify-center space-x-2"
        >
          {sortDirection === 'asc' ? (
            <>
              <ArrowUp className="h-4 w-4" />
              <span>Asc</span>
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4" />
              <span>Desc</span>
            </>
          )}
        </Button>
      </div>
    </>
  );
};


import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';
import { useEffect } from 'react';

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
  // Debug logging
  console.log('SortControls received columns:', columns.map(col => ({ name: col.name, type: col.type, worksheet: col.worksheet || 'default' })));
  console.log('SortControls current state:', { sortColumn, sortDirection });

  // Helper function to display column names nicely
  const formatColumnDisplay = (col: ColumnInfo) => {
    if (col.worksheet) {
      return `${col.name} (${col.type}) - ${col.worksheet}`;
    }
    return `${col.name} (${col.type})`;
  };

  const handleSortDirectionToggle = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    console.log('Toggling sort direction from', sortDirection, 'to', newDirection);
    setSortDirection(newDirection);
  };

  const handleSortColumnChange = (value: string) => {
    console.log('Sort column changed to:', value);
    setSortColumn(value);
  };

  // Effect to log when sort state changes
  useEffect(() => {
    console.log('Sort state updated:', { sortColumn, sortDirection });
  }, [sortColumn, sortDirection]);

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <Select value={sortColumn} onValueChange={handleSortColumnChange}>
          <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
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
          onClick={handleSortDirectionToggle}
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

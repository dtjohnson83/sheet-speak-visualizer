
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
  console.log('SortControls render:', { sortColumn, sortDirection, columnsCount: columns.length });

  const formatColumnDisplay = (col: ColumnInfo) => {
    if (col.worksheet) {
      return `${col.name} (${col.type}) - ${col.worksheet}`;
    }
    return `${col.name} (${col.type})`;
  };

  const handleSortDirectionToggle = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    console.log('Sort direction toggle:', sortDirection, '->', newDirection);
    setSortDirection(newDirection);
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      console.log('Sort direction after toggle:', newDirection);
    }, 100);
  };

  const handleSortColumnChange = (value: string) => {
    console.log('Sort column change:', value);
    setSortColumn(value);
    // If selecting "none", reset to a default direction
    if (value === 'none') {
      setSortDirection('desc');
    }
  };

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
          className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {sortDirection === 'asc' ? (
            <>
              <ArrowUp className="h-4 w-4" />
              <span>Ascending</span>
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4" />
              <span>Descending</span>
            </>
          )}
        </Button>
      </div>
    </>
  );
};

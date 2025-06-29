
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';

interface SortConfigurationProps {
  sortColumn: string;
  setSortColumn: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
  columns: ColumnInfo[];
}

export const SortConfiguration = ({
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  columns
}: SortConfigurationProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <Select value={sortColumn} onValueChange={setSortColumn}>
          <SelectTrigger className="bg-white dark:bg-gray-800">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50 max-h-60 overflow-y-auto">
            <SelectItem value="none">None</SelectItem>
            {columns.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {col.name} ({col.type})
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

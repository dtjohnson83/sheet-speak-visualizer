
import { ColumnInfo } from '@/pages/Index';
import { SortControls } from '../SortControls';

interface SortControlsSectionProps {
  sortColumn: string;
  setSortColumn: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
  columns: ColumnInfo[];
}

export const SortControlsSection = ({
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  columns
}: SortControlsSectionProps) => {
  return (
    <SortControls
      sortColumn={sortColumn}
      setSortColumn={setSortColumn}
      sortDirection={sortDirection}
      setSortDirection={setSortDirection}
      columns={columns}
    />
  );
};

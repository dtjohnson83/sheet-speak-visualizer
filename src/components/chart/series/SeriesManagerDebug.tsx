
import { ColumnInfo } from '@/pages/Index';

interface SeriesManagerDebugProps {
  numericColumns: ColumnInfo[];
  yColumn: string;
  availableColumns: ColumnInfo[];
  seriesLength: number;
}

export const SeriesManagerDebug = ({ 
  numericColumns, 
  yColumn, 
  availableColumns, 
  seriesLength 
}: SeriesManagerDebugProps) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
      <div>Debug Info:</div>
      <div>Total numeric columns: {numericColumns.length}</div>
      <div>Y-column: {yColumn || 'None'}</div>
      <div>Available for series: {availableColumns.length}</div>
      <div>Current series: {seriesLength}/1</div>
    </div>
  );
};

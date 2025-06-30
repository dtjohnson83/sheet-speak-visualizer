
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ColumnInfo } from '@/pages/Index';

interface SeriesManagerInfoProps {
  canAddSeries: boolean;
  numericColumns: ColumnInfo[];
  yColumn: string;
  seriesLength: number;
}

export const SeriesManagerInfo = ({ 
  canAddSeries, 
  numericColumns, 
  yColumn, 
  seriesLength 
}: SeriesManagerInfoProps) => {
  if (canAddSeries || numericColumns.length === 0 || seriesLength > 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <p className="text-sm text-blue-700 dark:text-blue-300">
        {numericColumns.length === 1 && yColumn 
          ? "You need at least 2 numeric columns to add additional series."
          : seriesLength >= 1
          ? "Maximum of one additional series reached. Remove the current series to add a different one."
          : "All available numeric columns are already in use. Remove a series to add a different one."
        }
      </p>
    </div>
  );
};


import { ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';

export const getAvailableSeriesColumns = (
  numericColumns: ColumnInfo[], 
  yColumn: string, 
  series: SeriesConfig[]
) => {
  const available = numericColumns.filter(col => 
    col.name !== yColumn && !series.some(s => s.column === col.name)
  );
  
  console.log('SeriesManager - Available columns calculation:', {
    totalNumericColumns: numericColumns.length,
    numericColumnNames: numericColumns.map(c => c.name),
    yColumn,
    existingSeriesColumns: series.map(s => s.column),
    availableColumns: available.map(c => c.name),
    availableCount: available.length
  });
  
  return available;
};

export const canAddNewSeries = (availableColumns: ColumnInfo[], seriesLength: number) => {
  // Allow up to 5 additional series or until we run out of columns
  const maxSeries = 5;
  return availableColumns.length > 0 && seriesLength < maxSeries;
};

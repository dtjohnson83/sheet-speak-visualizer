import { ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';

export interface ColumnMappingResult {
  xColumn: string;
  yColumn: string;
  series: SeriesConfig[];
  mapped: boolean;
  missingColumns: string[];
}

/**
 * Validates if the configured columns exist in the available data columns
 */
export const validateColumns = (
  configuredXColumn: string,
  configuredYColumn: string,
  availableColumns: ColumnInfo[]
): { xExists: boolean; yExists: boolean; missingColumns: string[] } => {
  const xExists = availableColumns.some(col => col.name?.trim() === configuredXColumn?.trim());
  const yExists = availableColumns.some(col => col.name?.trim() === configuredYColumn?.trim());
  
  const missingColumns = [];
  if (!xExists && configuredXColumn) missingColumns.push(configuredXColumn);
  if (!yExists && configuredYColumn) missingColumns.push(configuredYColumn);
  
  return { xExists, yExists, missingColumns };
};

/**
 * Automatically maps columns when configured columns don't exist
 * Uses intelligent fallbacks based on column types and chart requirements
 */
export const autoMapColumns = (
  configuredXColumn: string,
  configuredYColumn: string,
  configuredSeries: SeriesConfig[],
  availableColumns: ColumnInfo[],
  chartType: string
): ColumnMappingResult => {
  const validation = validateColumns(configuredXColumn, configuredYColumn, availableColumns);
  
  // If both columns exist, no mapping needed
  if (validation.xExists && validation.yExists) {
    return {
      xColumn: configuredXColumn,
      yColumn: configuredYColumn,
      series: configuredSeries,
      mapped: false,
      missingColumns: []
    };
  }

  // Find suitable replacements
  const categoricalColumns = availableColumns.filter(col => 
    col.type === 'categorical' || col.type === 'text' || col.type === 'date'
  );
  const numericColumns = availableColumns.filter(col => col.type === 'numeric');

  // Auto-select columns based on chart type requirements
  let newXColumn = configuredXColumn;
  let newYColumn = configuredYColumn;
  
  // For X-axis: prefer categorical/text/date columns, fallback to first available
  if (!validation.xExists && categoricalColumns.length > 0) {
    newXColumn = categoricalColumns[0].name;
  } else if (!validation.xExists && availableColumns.length > 0) {
    newXColumn = availableColumns[0].name;
  }

  // For Y-axis: prefer numeric columns for most chart types
  if (!validation.yExists && chartType !== 'histogram') {
    if (numericColumns.length > 0) {
      newYColumn = numericColumns[0].name;
    } else if (availableColumns.length > 1) {
      // Fallback to second column if first is used for X
      const fallbackColumn = availableColumns.find(col => col.name !== newXColumn);
      newYColumn = fallbackColumn?.name || availableColumns[1]?.name || '';
    }
  }

  // Update series to use new Y column if it was mapped
  let newSeries = configuredSeries;
  if (!validation.yExists && newYColumn) {
    newSeries = configuredSeries.map(series => ({
      ...series,
      column: series.column === configuredYColumn ? newYColumn : series.column
    }));
    
    // If no series were configured and we have a new Y column, create a default series
    if (newSeries.length === 0) {
      newSeries = [{
        id: 'auto-mapped',
        column: newYColumn,
        color: '#8884d8',
        type: 'bar' as const,
        aggregationMethod: 'sum' as const,
        yAxisId: 'left'
      }];
    }
  }

  return {
    xColumn: newXColumn,
    yColumn: newYColumn,
    series: newSeries,
    mapped: true,
    missingColumns: validation.missingColumns
  };
};

/**
 * Generates a helpful error message for missing columns
 */
export const generateColumnErrorMessage = (
  missingColumns: string[],
  availableColumns: ColumnInfo[]
): string => {
  const availableNames = availableColumns.map(col => col.name).filter(Boolean);
  
  if (missingColumns.length === 1) {
    return `Column "${missingColumns[0]}" not found. Available columns: ${availableNames.join(', ')}`;
  } else {
    return `Columns ${missingColumns.map(c => `"${c}"`).join(', ')} not found. Available columns: ${availableNames.join(', ')}`;
  }
};
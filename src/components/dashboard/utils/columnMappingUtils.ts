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

  // Enhanced column categorization for Graph ML
  const categoricalColumns = availableColumns.filter(col => 
    col.type === 'categorical' || col.type === 'text' || col.type === 'date'
  );
  const numericColumns = availableColumns.filter(col => col.type === 'numeric');

  // Graph-aware column detection
  const entityColumns = availableColumns.filter(col => 
    col.name.toLowerCase().includes('id') || 
    col.name.toLowerCase().includes('name') || 
    col.name.toLowerCase().includes('entity') ||
    col.name.toLowerCase().includes('node') ||
    col.type === 'categorical'
  );

  const relationshipColumns = availableColumns.filter(col => 
    col.name.toLowerCase().includes('weight') || 
    col.name.toLowerCase().includes('strength') || 
    col.name.toLowerCase().includes('score') || 
    col.name.toLowerCase().includes('count') || 
    col.name.toLowerCase().includes('frequency') ||
    col.type === 'numeric'
  );

  // Auto-select columns based on chart type requirements
  let newXColumn = configuredXColumn;
  let newYColumn = configuredYColumn;
  
  // Graph visualization types get priority for entity/relationship columns
  if (chartType === 'network' || chartType === 'network3d' || chartType === 'entity-relationship') {
    if (!validation.xExists) {
      newXColumn = entityColumns[0]?.name || categoricalColumns[0]?.name || availableColumns[0]?.name || '';
    }
    if (!validation.yExists) {
      newYColumn = entityColumns[1]?.name || relationshipColumns[0]?.name || numericColumns[0]?.name || '';
    }
  } else if (chartType === 'bar3d' || chartType === 'scatter3d' || chartType === 'surface3d') {
    // 3D charts need specific column mapping
    if (!validation.xExists) {
      // For 3D charts, prefer numeric for X-axis first, then categorical
      if (chartType === 'scatter3d' || chartType === 'surface3d') {
        // Scatter3D and Surface3D need all numeric axes
        newXColumn = numericColumns[0]?.name || relationshipColumns[0]?.name || categoricalColumns[0]?.name || availableColumns[0]?.name || '';
      } else {
        // Bar3D can use categorical for X-axis
        newXColumn = categoricalColumns[0]?.name || entityColumns[0]?.name || availableColumns[0]?.name || '';
      }
    }
    if (!validation.yExists) {
      // For 3D charts, require numeric for Y-axis (height/value)
      newYColumn = numericColumns[0]?.name || relationshipColumns[0]?.name || '';
      if (!newYColumn && availableColumns.length > 1) {
        // Fallback: try to find any numeric-like column
        const numericLikeColumn = availableColumns.find(col => 
          col.name !== newXColumn && 
          (col.type === 'numeric' || /\d/.test(String(availableColumns[0]?.[col.name])))
        );
        newYColumn = numericLikeColumn?.name || '';
      }
    }
    // For 3D charts, we also need to ensure we have a Z column
    // This would be handled by the chart component itself when zColumn is not provided
  } else {
    // For X-axis: prefer entity/categorical columns, fallback to first available
    if (!validation.xExists) {
      if (entityColumns.length > 0) {
        newXColumn = entityColumns[0].name;
      } else if (categoricalColumns.length > 0) {
        newXColumn = categoricalColumns[0].name;
      } else if (availableColumns.length > 0) {
        newXColumn = availableColumns[0].name;
      }
    }

    // For Y-axis: prefer relationship/numeric columns for most chart types
    if (!validation.yExists && chartType !== 'histogram') {
      if (relationshipColumns.length > 0) {
        newYColumn = relationshipColumns[0].name;
      } else if (numericColumns.length > 0) {
        newYColumn = numericColumns[0].name;
      } else if (availableColumns.length > 1) {
        // Fallback to second column if first is used for X
        const fallbackColumn = availableColumns.find(col => col.name !== newXColumn);
        newYColumn = fallbackColumn?.name || availableColumns[1]?.name || '';
      }
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

import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';

import { ColumnFormat } from '@/lib/columnFormatting';
import { prepareHeatmapData } from './chart/heatmapProcessor';
import { prepareTreemapData } from './chart/treemapProcessor';
import { prepareStackedBarData } from './chart/stackedBarProcessor';
import { prepareScatterData } from './chart/scatterProcessor';
import { prepareStandardChartData } from './chart/standardChartProcessor';
import { prepareHistogramData } from './chart/histogramProcessor';

export const prepareChartData = (
  data: DataRow[],
  columns: ColumnInfo[],
  chartType: string,
  xColumn: string,
  yColumn: string,
  series: SeriesConfig[],
  sortColumn: string,
  sortDirection: 'asc' | 'desc',
  stackColumn: string,
  
  supportsMultipleSeries: boolean,
  numericColumns: ColumnInfo[],
  aggregationMethod: AggregationMethod = 'sum',
  valueColumn?: string,
  columnFormats?: ColumnFormat[],
  topXLimit?: number | null,
  histogramBins?: number
): DataRow[] => {
  console.log('prepareChartData - Input params:', {
    dataLength: data.length,
    chartType,
    xColumn: xColumn?.trim(),
    yColumn: yColumn?.trim(),
    series,
    aggregationMethod,
    dataSample: data.slice(0, 2)
  });

  // Clean column names
  const cleanXColumn = xColumn?.trim() || '';
  const cleanYColumn = yColumn?.trim() || '';

  if (!cleanXColumn || (!cleanYColumn && chartType !== 'histogram')) {
    console.log('prepareChartData - Missing required columns');
    return [];
  }

  const xCol = columns.find(col => col.name?.trim() === cleanXColumn);
  const yCol = columns.find(col => col.name?.trim() === cleanYColumn);

  if (!xCol || (!yCol && chartType !== 'histogram')) {
    console.warn('prepareChartData - Column definitions not found', { 
      requestedX: cleanXColumn,
      requestedY: cleanYColumn,
      foundX: !!xCol,
      foundY: !!yCol,
      chartType,
      availableColumns: columns.map(c => c.name),
      columnTypes: columns.map(c => ({ name: c.name, type: c.type }))
    });
    return [];
  }

  let processedData: DataRow[] = [];

  // Filter out invalid data rows
  const validData = data.filter(row => {
    if (chartType === 'histogram') return true;
    
    const xValue = row[cleanXColumn];
    const yValue = row[cleanYColumn];
    
    // Skip rows with null/undefined values
    if (xValue === null || xValue === undefined || yValue === null || yValue === undefined) {
      return false;
    }
    
    // For numeric columns, ensure the value can be parsed
    if (yCol?.type === 'numeric') {
      const val = parseFloat(yValue);
      if (isNaN(val)) return false;
    }
    
    return true;
  });

  console.log('prepareChartData - Valid data after filtering:', {
    originalLength: data.length,
    validLength: validData.length,
    sampleValid: validData.slice(0, 2)
  });

  switch (chartType) {
    case 'heatmap':
      processedData = prepareHeatmapData(validData, cleanXColumn, cleanYColumn, valueColumn, numericColumns, aggregationMethod, sortColumn, sortDirection);
      break;

    case 'treemap':
      processedData = prepareTreemapData(validData, cleanXColumn, cleanYColumn, aggregationMethod, sortColumn, sortDirection);
      break;

    case 'stacked-bar':
      processedData = prepareStackedBarData(validData, cleanXColumn, cleanYColumn, stackColumn, aggregationMethod, sortColumn, sortDirection);
      break;

    case 'histogram':
      processedData = prepareHistogramData(validData, cleanXColumn, histogramBins || 10);
      break;

    case 'scatter':
      if (xCol.type === 'numeric' && yCol.type === 'numeric') {
        processedData = prepareScatterData(validData, cleanXColumn, cleanYColumn, xCol, yCol, series, supportsMultipleSeries, sortColumn, sortDirection);
      }
      break;

    case 'scatter3d':
    case 'surface3d':
      // 3D charts need all original columns preserved (no aggregation)
      console.log('🎯 Processing 3D chart data:', {
        chartType,
        dataLength: validData.length,
        xColumn: cleanXColumn,
        yColumn: cleanYColumn,
        sampleData: validData.slice(0, 2),
        allColumns: Object.keys(validData[0] || {})
      });
      processedData = prepareScatterData(validData, cleanXColumn, cleanYColumn, xCol, yCol, series, supportsMultipleSeries, sortColumn, sortDirection);
      console.log('🎯 3D chart data processed:', {
        resultLength: processedData.length,
        sampleResult: processedData.slice(0, 2)
      });
      break;

    case 'pie':
    case 'bar':
    default:
      processedData = prepareStandardChartData(validData, cleanXColumn, cleanYColumn, xCol, yCol, series, aggregationMethod, sortColumn, sortDirection, chartType, columnFormats);
  }

  console.log('prepareChartData - Final result:', {
    resultLength: Array.isArray(processedData) ? processedData.length : 'Not array',
    sampleResult: Array.isArray(processedData) ? processedData.slice(0, 2) : processedData
  });

  return processedData;
};

// Add the processChartData export as an alias for compatibility
export const processChartData = (
  data: DataRow[],
  columns: ColumnInfo[],
  config: {
    xColumn: string;
    yColumn: string;
    chartType: string;
    series: SeriesConfig[];
    valueColumn?: string;
  }
): DataRow[] => {
  const result = prepareChartData(
    data,
    columns,
    config.chartType,
    config.xColumn,
    config.yColumn,
    config.series,
    'none',
    'desc',
    '',
    false,
    columns.filter(col => col.type === 'numeric'),
    'sum',
    config.valueColumn
  );
  
  return Array.isArray(result) ? result : [];
};


import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { SankeyData } from '@/lib/chartDataUtils';
import { ColumnFormat } from '@/lib/columnFormatting';
import { prepareSankeyData } from './chart/sankeyProcessor';
import { prepareHeatmapData } from './chart/heatmapProcessor';
import { prepareTreemapData } from './chart/treemapProcessor';
import { preparePieData } from './chart/pieProcessor';
import { prepareStackedBarData } from './chart/stackedBarProcessor';
import { prepareScatterData } from './chart/scatterProcessor';
import { prepareStandardChartData } from './chart/standardChartProcessor';
import { prepareHistogramData } from './chart/histogramProcessor';
import { applyTopXLimit } from './chart/topXProcessor';

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
  sankeyTargetColumn: string,
  supportsMultipleSeries: boolean,
  numericColumns: ColumnInfo[],
  aggregationMethod: AggregationMethod = 'sum',
  valueColumn?: string,
  columnFormats?: ColumnFormat[],
  topXLimit?: number | null,
  histogramBins?: number
): DataRow[] | SankeyData => {
  if (!xColumn || (!yColumn && chartType !== 'histogram')) return [];

  const xCol = columns.find(col => col.name === xColumn);
  const yCol = columns.find(col => col.name === yColumn);

  if (!xCol || (!yCol && chartType !== 'histogram')) return [];

  console.log('Preparing chart data for:', { 
    xColumn, 
    yColumn, 
    chartType, 
    series, 
    aggregationMethod, 
    valueColumn, 
    columnFormats, 
    topXLimit, 
    histogramBins,
    sortColumn,
    sortDirection
  });

  let processedData: DataRow[] | SankeyData = [];

  switch (chartType) {
    case 'sankey':
      processedData = prepareSankeyData(data, xColumn, yColumn, valueColumn!, aggregationMethod, sortColumn, sortDirection);
      break;

    case 'heatmap':
      processedData = prepareHeatmapData(data, xColumn, yColumn, valueColumn, numericColumns, aggregationMethod, sortColumn, sortDirection);
      break;

    case 'treemap':
      processedData = prepareTreemapData(data, xColumn, yColumn, aggregationMethod, sortColumn, sortDirection);
      break;

    case 'pie':
      processedData = preparePieData(data, xColumn, yColumn, aggregationMethod, sortColumn, sortDirection);
      break;

    case 'stacked-bar':
      processedData = prepareStackedBarData(data, xColumn, yColumn, stackColumn, aggregationMethod, sortColumn, sortDirection);
      break;

    case 'histogram':
      processedData = prepareHistogramData(data, xColumn, histogramBins || 10);
      break;

    case 'scatter':
      if (xCol.type === 'numeric' && yCol.type === 'numeric') {
        processedData = prepareScatterData(data, xColumn, yColumn, xCol, yCol, series, supportsMultipleSeries, sortColumn, sortDirection);
      }
      break;

    case 'horizontal-bar':
    default:
      processedData = prepareStandardChartData(data, xColumn, yColumn, xCol, yCol, series, aggregationMethod, sortColumn, sortDirection, chartType, columnFormats);
  }

  // Apply top X limiting for supported chart types (only for array data, not SankeyData)
  if (Array.isArray(processedData) && topXLimit && topXLimit > 0) {
    const limitSupportedCharts = ['bar', 'horizontal-bar', 'pie', 'stacked-bar', 'treemap'];
    if (limitSupportedCharts.includes(chartType)) {
      // Use the yColumn as the default sort column for limiting if no specific sort column is set
      const sortColumnForLimit = sortColumn === 'none' ? yColumn : sortColumn;
      console.log('Applying top X limit:', { topXLimit, sortColumnForLimit, sortDirection });
      processedData = applyTopXLimit(processedData, topXLimit, sortColumnForLimit, sortDirection);
    }
  }

  return processedData;
};

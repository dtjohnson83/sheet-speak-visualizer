
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
  columnFormats?: ColumnFormat[]
): DataRow[] | SankeyData => {
  if (!xColumn || !yColumn) return [];

  const xCol = columns.find(col => col.name === xColumn);
  const yCol = columns.find(col => col.name === yColumn);

  if (!xCol || !yCol) return [];

  console.log('Preparing chart data for:', { xColumn, yColumn, chartType, series, aggregationMethod, valueColumn, columnFormats });

  switch (chartType) {
    case 'sankey':
      return prepareSankeyData(data, xColumn, yColumn, valueColumn!, aggregationMethod, sortColumn, sortDirection);

    case 'heatmap':
      return prepareHeatmapData(data, xColumn, yColumn, valueColumn, numericColumns, aggregationMethod, sortColumn, sortDirection);

    case 'treemap':
      return prepareTreemapData(data, xColumn, yColumn, aggregationMethod, sortColumn, sortDirection);

    case 'pie':
      return preparePieData(data, xColumn, yColumn, aggregationMethod, sortColumn, sortDirection);

    case 'stacked-bar':
      return prepareStackedBarData(data, xColumn, yColumn, stackColumn, aggregationMethod, sortColumn, sortDirection);

    case 'scatter':
      if (xCol.type === 'numeric' && yCol.type === 'numeric') {
        return prepareScatterData(data, xColumn, yColumn, xCol, yCol, series, supportsMultipleSeries, sortColumn, sortDirection);
      }
      break;

    default:
      return prepareStandardChartData(data, xColumn, yColumn, xCol, yCol, series, aggregationMethod, sortColumn, sortDirection, chartType, columnFormats);
  }

  return prepareStandardChartData(data, xColumn, yColumn, xCol, yCol, series, aggregationMethod, sortColumn, sortDirection, chartType, columnFormats);
};

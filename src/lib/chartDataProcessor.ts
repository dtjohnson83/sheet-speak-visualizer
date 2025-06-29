
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { SankeyData, sortData } from '@/lib/chartDataUtils';
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
  valueColumn?: string
): DataRow[] | SankeyData => {
  if (!xColumn || !yColumn) return [];

  const xCol = columns.find(col => col.name === xColumn);
  const yCol = columns.find(col => col.name === yColumn);

  if (!xCol || !yCol) return [];

  console.log('prepareChartData called with sort settings:', { 
    sortColumn, 
    sortDirection, 
    chartType,
    dataLength: data.length
  });

  // Apply sorting to data first if specified - this is crucial!
  let sortedData = data;
  if (sortColumn && sortColumn !== 'none') {
    console.log('Applying sort before chart processing:', { sortColumn, sortDirection });
    sortedData = sortData(data, sortColumn, sortDirection);
    console.log('Data after sorting:', {
      originalLength: data.length,
      sortedLength: sortedData.length,
      firstSortedValues: sortedData.slice(0, 3).map(row => ({ 
        [sortColumn]: row[sortColumn],
        [xColumn]: row[xColumn],
        [yColumn]: row[yColumn]
      }))
    });
  } else {
    console.log('No sorting applied - sortColumn:', sortColumn);
  }

  switch (chartType) {
    case 'sankey':
      return prepareSankeyData(sortedData, xColumn, yColumn, valueColumn!, aggregationMethod, sortColumn, sortDirection);

    case 'heatmap':
      return prepareHeatmapData(sortedData, xColumn, yColumn, valueColumn, numericColumns, aggregationMethod, sortColumn, sortDirection);

    case 'treemap':
      return prepareTreemapData(sortedData, xColumn, yColumn, aggregationMethod, sortColumn, sortDirection);

    case 'pie':
      return preparePieData(sortedData, xColumn, yColumn, aggregationMethod, sortColumn, sortDirection);

    case 'stacked-bar':
      return prepareStackedBarData(sortedData, xColumn, yColumn, stackColumn, aggregationMethod, sortColumn, sortDirection);

    case 'scatter':
      if (xCol.type === 'numeric' && yCol.type === 'numeric') {
        return prepareScatterData(sortedData, xColumn, yColumn, xCol, yCol, series, supportsMultipleSeries, sortColumn, sortDirection);
      }
      break;

    default:
      return prepareStandardChartData(sortedData, xColumn, yColumn, xCol, yCol, series, aggregationMethod, sortColumn, sortDirection, chartType);
  }

  return prepareStandardChartData(sortedData, xColumn, yColumn, xCol, yCol, series, aggregationMethod, sortColumn, sortDirection, chartType);
};

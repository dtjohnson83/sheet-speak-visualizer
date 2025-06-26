
import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { prepareChartData } from '@/lib/chartDataProcessor';
import { SankeyData } from '@/lib/chartDataUtils';
import {
  BarChartRenderer,
  LineChartRenderer,
  PieChartRenderer,
  ScatterChartRenderer,
  TreemapRenderer,
  StackedBarRenderer,
  HeatmapRenderer,
  SankeyRenderer
} from '../chart/ChartRenderers';

export interface SeriesConfig {
  id: string;
  column: string;
  color: string;
  type: 'bar' | 'line';
}

export interface TileChartRendererProps {
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  sankeyTargetColumn?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  series: SeriesConfig[];
  showDataLabels?: boolean;
  data: DataRow[];
  columns: ColumnInfo[];
  chartColors: string[];
}

export const TileChartRenderer = ({
  chartType,
  xColumn,
  yColumn,
  stackColumn,
  sankeyTargetColumn,
  sortColumn,
  sortDirection,
  series,
  showDataLabels,
  data,
  columns,
  chartColors
}: TileChartRendererProps) => {
  const numericColumns = columns.filter(col => col.type === 'numeric');

  const chartData = prepareChartData(
    data,
    columns,
    chartType as any,
    xColumn,
    yColumn,
    series,
    sortColumn || 'none',
    sortDirection || 'desc',
    stackColumn,
    sankeyTargetColumn,
    ['bar', 'line', 'scatter'].includes(chartType),
    numericColumns
  );

  if (!xColumn || !yColumn || (Array.isArray(chartData) && chartData.length === 0)) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <p>No data to display</p>
      </div>
    );
  }

  const commonProps = {
    data: chartData as DataRow[],
    xColumn,
    yColumn,
    series,
    chartColors,
    showDataLabels: showDataLabels || false
  };

  switch (chartType) {
    case 'heatmap':
      return <HeatmapRenderer data={chartData as Array<{ x: string; y: string; value: number }>} chartColors={chartColors} />;
    case 'stacked-bar':
      return <StackedBarRenderer {...commonProps} stackColumn={stackColumn} originalData={data} />;
    case 'treemap':
      return <TreemapRenderer data={chartData as DataRow[]} chartColors={chartColors} />;
    case 'sankey':
      return <SankeyRenderer data={chartData as SankeyData} chartColors={chartColors} />;
    case 'bar':
      return <BarChartRenderer {...commonProps} />;
    case 'line':
      return <LineChartRenderer {...commonProps} />;
    case 'pie':
      return <PieChartRenderer data={chartData as DataRow[]} chartColors={chartColors} />;
    case 'scatter':
      return <ScatterChartRenderer {...commonProps} />;
    default:
      return null;
  }
};

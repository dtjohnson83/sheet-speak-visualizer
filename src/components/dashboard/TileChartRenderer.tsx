
import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { KPIRenderer } from '../chart/KPIRenderer';
import { getEffectiveSeries } from './utils/seriesUtils';
import { TileBarChartRenderer } from './renderers/TileBarChartRenderer';
import { TileLineChartRenderer } from './renderers/TileLineChartRenderer';
import { TileAreaChartRenderer } from './renderers/TileAreaChartRenderer';
import { TilePieChartRenderer } from './renderers/TilePieChartRenderer';
import { TileScatterChartRenderer } from './renderers/TileScatterChartRenderer';

interface TileChartRendererProps {
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  sankeyTargetColumn?: string;
  valueColumn?: string;
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
  valueColumn, 
  sortColumn, 
  sortDirection, 
  series, 
  showDataLabels, 
  data, 
  columns, 
  chartColors 
}: TileChartRendererProps) => {
  const effectiveSeries = getEffectiveSeries(yColumn, series, chartColors);

  if (chartType === 'bar') {
    return (
      <TileBarChartRenderer
        data={data}
        xColumn={xColumn}
        stackColumn={stackColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'line') {
    return (
      <TileLineChartRenderer
        data={data}
        xColumn={xColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'area') {
    return (
      <TileAreaChartRenderer
        data={data}
        xColumn={xColumn}
        stackColumn={stackColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'pie') {
    return (
      <TilePieChartRenderer
        data={data}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'scatter') {
    return (
      <TileScatterChartRenderer
        data={data}
        xColumn={xColumn}
        valueColumn={valueColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
      />
    );
  }

  // For unsupported chart types in tiles, show a simple message
  if (chartType === 'heatmap' || chartType === 'histogram' || chartType === 'sankey' || chartType === 'treemap') {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        {chartType} charts are not supported in dashboard tiles yet.
      </div>
    );
  }
  
  if (chartType === 'kpi') {
    return (
      <KPIRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        valueColumn={valueColumn}
        series={effectiveSeries}
        chartColors={chartColors}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
      No chart type selected.
    </div>
  );
};

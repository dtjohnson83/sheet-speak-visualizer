import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { TileBarChartRenderer } from './TileBarChartRenderer';

interface TileStackedBarChartRendererProps {
  data: DataRow[];
  xColumn: string;
  stackColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const TileStackedBarChartRenderer: React.FC<TileStackedBarChartRendererProps> = ({
  data,
  xColumn,
  stackColumn,
  effectiveSeries,
  chartColors,
  showDataLabels,
  xAxisLabel,
  yAxisLabel
}) => {
  return (
    <TileBarChartRenderer
      data={data}
      xColumn={xColumn}
      stackColumn={stackColumn || 'stack'}
      effectiveSeries={effectiveSeries}
      chartColors={chartColors}
      showDataLabels={showDataLabels}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
    />
  );
};
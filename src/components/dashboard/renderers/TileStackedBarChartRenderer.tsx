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
  console.log('🏗️ TileStackedBarChartRenderer - Input:', {
    dataLength: data.length,
    xColumn,
    stackColumn,
    effectiveSeriesLength: effectiveSeries.length,
    sampleData: data.slice(0, 2),
    dataColumns: data.length > 0 ? Object.keys(data[0]) : []
  });

  // For stacked bar charts, we need to generate series from the actual data columns
  // (excluding the x-column) since the Y-column gets transformed into stack value columns
  const stackSeries: SeriesConfig[] = data.length > 0 
    ? Object.keys(data[0])
        .filter(key => key !== xColumn) // Exclude the x-axis column
        .map((column, index) => ({
          id: `stack-${column}`,
          column: column,
          color: chartColors[index % chartColors.length],
          type: 'bar' as const,
          aggregationMethod: 'sum' as const,
          yAxisId: 'left'
        }))
    : [];

  console.log('🏗️ TileStackedBarChartRenderer - Generated stack series:', {
    stackSeriesLength: stackSeries.length,
    stackColumns: stackSeries.map(s => s.column)
  });

  return (
    <TileBarChartRenderer
      data={data}
      xColumn={xColumn}
      stackColumn={stackColumn || 'stack'}
      effectiveSeries={stackSeries}
      chartColors={chartColors}
      showDataLabels={showDataLabels}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
    />
  );
};
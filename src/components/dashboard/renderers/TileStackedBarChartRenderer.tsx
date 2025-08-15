import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { TileBarChartRenderer } from './TileBarChartRenderer';
import { prepareStackedBarData } from '@/lib/chart/stackedBarProcessor';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { getThemeAwareChartColors } from '@/lib/chartTheme';
interface TileStackedBarChartRendererProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string;
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
  yColumn,
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

  // Prepare data for stacked bar: pivot stack column into separate numeric columns
  const processedData: DataRow[] = React.useMemo(() => {
    if (!data || data.length === 0 || !xColumn || !yColumn || !stackColumn) return [];
    try {
      return prepareStackedBarData(
        data,
        xColumn,
        yColumn,
        stackColumn,
        'sum' as AggregationMethod,
        'none',
        'desc'
      );
    } catch (e) {
      console.warn('TileStackedBarChartRenderer - prepareStackedBarData failed', e);
      return [];
    }
  }, [data, xColumn, yColumn, stackColumn]);

  // Generate series from all keys present across processed rows (excluding the x-axis column)
  const stackKeys = React.useMemo(() => {
    const keys = new Set<string>();
    for (const row of processedData) {
      Object.keys(row).forEach(k => {
        if (k !== xColumn) keys.add(k);
      });
    }
    return Array.from(keys);
  }, [processedData, xColumn]);

  // Use theme-aware colors for consistent dark mode support
  const themeColors = getThemeAwareChartColors();

  const stackSeries: SeriesConfig[] = stackKeys.map((column, index) => ({
    id: `stack-${column}`,
    column,
    color: themeColors[index % themeColors.length],
    type: 'bar' as const,
    aggregationMethod: 'sum' as const,
    yAxisId: 'left'
  }));

  console.log('🏗️ TileStackedBarChartRenderer - Generated stack series:', {
    stackSeriesLength: stackSeries.length,
    stackColumns: stackSeries.map(s => s.column)
  });

  return (
    <TileBarChartRenderer
      data={processedData}
      xColumn={xColumn}
      stackColumn={stackColumn || 'stack'}
      effectiveSeries={stackSeries}
      chartColors={themeColors}
      showDataLabels={showDataLabels}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
    />
  );
};
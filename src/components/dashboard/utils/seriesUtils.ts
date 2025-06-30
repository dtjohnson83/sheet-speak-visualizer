
import { SeriesConfig } from '@/hooks/useChartState';

export const getEffectiveSeries = (yColumn: string, series: SeriesConfig[], chartColors: string[]): SeriesConfig[] => {
  // Always include the base yColumn as the primary series
  const baseSeries = yColumn ? [{
    id: 'base',
    column: yColumn,
    color: chartColors[0],
    type: 'bar' as const,
    aggregationMethod: 'sum' as const
  }] : [];
  
  // Combine base series with additional series
  return [...baseSeries, ...series];
};

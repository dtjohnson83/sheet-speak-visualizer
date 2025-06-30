
import { SeriesConfig } from '@/hooks/useChartState';

export const getEffectiveSeries = (
  yColumn: string, 
  series: SeriesConfig[], 
  chartColors: string[], 
  chartType: string
): SeriesConfig[] => {
  // Map chart type to series type
  const getSeriesType = (type: string): 'bar' | 'line' | 'area' => {
    switch (type) {
      case 'area':
        return 'area';
      case 'line':
        return 'line';
      case 'bar':
      default:
        return 'bar';
    }
  };

  // Always include the base yColumn as the primary series with the correct type
  const baseSeries = yColumn ? [{
    id: 'base',
    column: yColumn,
    color: chartColors[0],
    type: getSeriesType(chartType),
    aggregationMethod: 'sum' as const,
    yAxisId: 'left'
  }] : [];
  
  // Combine base series with additional series
  return [...baseSeries, ...series];
};

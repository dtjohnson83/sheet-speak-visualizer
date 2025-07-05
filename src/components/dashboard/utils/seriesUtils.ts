
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

  // Only add base series if no series are explicitly provided (maintains backward compatibility)
  // If series are provided (e.g., from AI suggestions), use them as-is
  if (series.length === 0 && yColumn) {
    console.log('SeriesUtils - Adding base series for yColumn:', yColumn);
    const baseSeries = [{
      id: 'base',
      column: yColumn,
      color: chartColors[0],
      type: getSeriesType(chartType),
      aggregationMethod: 'sum' as const,
      yAxisId: 'left'
    }];
    return baseSeries;
  }
  
  // Use provided series as-is (respects AI suggestions and manual configurations)
  console.log('SeriesUtils - Using provided series:', series.length > 0 ? series.map(s => s.column) : 'none');
  return series;
};

import React from 'react';
import { BrandedBars } from '@/components/charts/BrandedBars';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';
import { getThemeAwareChartColors } from '@/lib/chartTheme';


interface BarChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'series' | 'stackColumn' | 'chartColors' | 'showDataLabels'> {
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const BarChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn, 
  series = [], 
  chartColors,
  showDataLabels,
  isTemporalAnimated = false,
  animationSpeed = 1000,
  xAxisLabel,
  yAxisLabel
}: BarChartRendererProps) => {
  console.log('🔴 BarChartRenderer - Rendering with:', { 
    dataLength: data?.length, 
    seriesLength: series.length,
    xColumn,
    yColumn,
    chartColors,
    showDataLabels,
    sampleData: data?.slice(0, 2)
  });
  
  // Filter out yColumn from the provided series to avoid duplication
  const filteredSeries = series.filter(s => s.column !== yColumn);
  
  // Get theme-aware colors for consistent styling
  const themeColors = getThemeAwareChartColors();
  
  // Prepare series for BrandedBars component
  const brandedSeries = filteredSeries.map((s, index) => ({
    dataKey: s.column,
    name: s.column,
    color: s.color || themeColors[(index + 1) % themeColors.length]
  }));

  return (
    <BrandedBars
      data={data}
      dataKey={yColumn}
      xAxisKey={xColumn}
      series={brandedSeries}
      showDataLabels={showDataLabels}
      animated={isTemporalAnimated}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
      formatYAxis={formatTooltipValue}
      formatTooltip={formatTooltipValue}
    />
  );
};
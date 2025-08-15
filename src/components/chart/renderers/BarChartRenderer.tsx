import React from 'react';
import { BrandedBars } from '@/components/charts/BrandedBars';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';


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
  console.log('BarChartRenderer - Rendering with data length:', data?.length, 'series:', series.length);
  
  // Filter out yColumn from the provided series to avoid duplication
  const filteredSeries = series.filter(s => s.column !== yColumn);
  
  // Prepare series for BrandedBars component
  const brandedSeries = filteredSeries.map((s, index) => ({
    dataKey: s.column,
    name: s.column,
    color: s.color || chartColors[(index + 1) % chartColors.length]
  }));

  return (
    <BrandedBars
      data={data}
      dataKey={yColumn}
      xAxisKey={xColumn}
      colors={chartColors}
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
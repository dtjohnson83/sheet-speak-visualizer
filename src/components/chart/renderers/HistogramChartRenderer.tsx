
import React from 'react';
import { BrandedBars } from '@/components/charts/BrandedBars';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';


interface HistogramChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'chartColors' | 'showDataLabels'> {
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
}

export const HistogramChartRenderer = ({ 
  data, 
  chartColors,
  showDataLabels,
  isTemporalAnimated = false,
  animationSpeed = 1000
}: HistogramChartRendererProps) => {
  return (
    <BrandedBars
      data={data}
      dataKey="frequency"
      xAxisKey="range"
      height={400}
      colors={chartColors}
      showDataLabels={showDataLabels}
      animated={isTemporalAnimated}
      formatYAxis={formatTooltipValue}
      formatTooltip={formatTooltipValue}
      xAxisLabel="Range"
      yAxisLabel="Frequency"
    />
  );
};

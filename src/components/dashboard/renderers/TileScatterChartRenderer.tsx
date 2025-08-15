
import React from 'react';
import { BrandedScatter } from '@/components/charts/BrandedScatter';
import { formatTooltipValue } from '@/lib/numberUtils';
import { SeriesConfig } from '@/hooks/useChartState';
import { DataRow } from '@/pages/Index';


interface TileScatterChartRendererProps {
  data: DataRow[];
  xColumn: string;
  valueColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
}

export const TileScatterChartRenderer = ({ 
  data, 
  xColumn, 
  valueColumn, 
  effectiveSeries, 
  chartColors 
}: TileScatterChartRendererProps) => {
  // Prepare series for BrandedScatter
  const scatterSeries = effectiveSeries.map((s, index) => ({
    dataKey: s.column,
    name: s.column,
    color: chartColors[index % chartColors.length]
  }));

  return (
    <BrandedScatter
      data={data}
      dataKey={valueColumn || 'value'}
      xAxisKey={xColumn}
      series={scatterSeries}
      colors={chartColors}
      sizeKey={valueColumn}
      height={400}
      formatXAxis={formatTooltipValue}
      formatYAxis={formatTooltipValue}
      formatTooltip={formatTooltipValue}
      domain={{
        x: ['dataMin', 'dataMax'],
        y: ['dataMin', 'dataMax']
      }}
      sizeRange={[64, 144]}
    />
  );
};

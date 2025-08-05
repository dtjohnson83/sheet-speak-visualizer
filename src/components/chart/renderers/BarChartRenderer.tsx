import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { getChartTextColor } from '@/lib/chartTheme';
import { ChartRenderersProps } from '@/types';
import { ScrollableChartContainer } from '../ScrollableChartContainer';

interface BarChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'series' | 'stackColumn' | 'chartColors' | 'showDataLabels'> {
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const BarChartRenderer = React.memo(({ 
  data, 
  xColumn, 
  yColumn,
  series, 
  stackColumn, 
  chartColors,
  showDataLabels,
  isTemporalAnimated = false,
  animationSpeed = 1000,
  xAxisLabel,
  yAxisLabel
}: BarChartRendererProps) => {
  // Always include the base yColumn as the primary series
  const baseSeries = React.useMemo(() => 
    yColumn ? [{ id: 'base', column: yColumn, type: 'bar' as const, yAxisId: 'left' }] : [], 
    [yColumn]
  );
  
  // For bar charts, force all series to be bar type to prevent mixed rendering
  const forcedBarSeries = React.useMemo(() => 
    series.map(s => ({ ...s, type: 'bar' as const })), 
    [series]
  );
  
  // Combine base series with forced bar series
  const allSeries = React.useMemo(() => 
    [...baseSeries, ...forcedBarSeries], 
    [baseSeries, forcedBarSeries]
  );
  
  // Check if we need a right Y-axis
  const needsRightYAxis = React.useMemo(() => 
    series.some(s => s.yAxisId === 'right'), 
    [series]
  );
  
  // Since this is BarChartRenderer, we never have mixed types - force pure bar chart
  const hasMixedTypes = false;
  
  // Custom label component for data labels
  const renderDataLabel = React.useCallback((props: any) => {
    const { x, y, width, height, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 5} 
        fill={getChartTextColor()} 
        textAnchor="middle" 
        dy={-6}
        fontSize="12"
      >
        {formatTooltipValue(value)}
      </text>
    );
  }, []);

  const renderLineDataLabel = React.useCallback((props: any) => {
    const { x, y, value } = props;
    return (
      <text 
        x={x} 
        y={y - 10} 
        fill={getChartTextColor()} 
        textAnchor="middle" 
        fontSize="12"
      >
        {formatTooltipValue(value)}
      </text>
    );
  }, []);
  
  return (
    <ScrollableChartContainer dataLength={data.length} minWidth={400}>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis yAxisId="left" tickFormatter={formatTooltipValue} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          {needsRightYAxis && (
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tickFormatter={formatTooltipValue}
            />
          )}
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {allSeries.map((s, index) => (
            <Bar 
              key={s.column} 
              dataKey={s.column} 
              fill={chartColors[index % chartColors.length]} 
              stackId={stackColumn ? 'stack' : undefined}
              yAxisId={s.yAxisId || 'left'}
              label={showDataLabels ? renderDataLabel : false}
              isAnimationActive={isTemporalAnimated}
              animationDuration={isTemporalAnimated ? animationSpeed : 1500}
              animationEasing="ease-out"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ScrollableChartContainer>
  );
});
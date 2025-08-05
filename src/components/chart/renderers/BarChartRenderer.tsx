import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { getChartTextColor } from '@/lib/chartTheme';
import { ChartRenderersProps } from '@/types';


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
  
  // Preserve series types instead of forcing all to be bars
  const filteredSeries = React.useMemo(() => 
    series.filter(s => s.column !== yColumn), 
    [series, yColumn]
  );
  
  // Combine base series with additional series (preserving their types)
  const allSeries = React.useMemo(() => 
    [...baseSeries, ...filteredSeries], 
    [baseSeries, filteredSeries]
  );
  
  // Check if we need a right Y-axis
  const needsRightYAxis = React.useMemo(() => 
    series.some(s => s.yAxisId === 'right'), 
    [series]
  );
  
  // Check if we have mixed chart types (bar + line/area)
  const hasMixedTypes = React.useMemo(() => 
    allSeries.some(s => s.type === 'line' || s.type === 'area'), 
    [allSeries]
  );
  
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
          {allSeries.map((s, index) => {
            if (s.type === 'line') {
              return (
                <Line 
                  key={s.column} 
                  type="monotone" 
                  dataKey={s.column} 
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  yAxisId={s.yAxisId || 'left'}
                  label={showDataLabels ? renderLineDataLabel : false}
                  isAnimationActive={isTemporalAnimated}
                  animationDuration={isTemporalAnimated ? animationSpeed : 1500}
                  animationEasing="ease-out"
                />
              );
            } else {
              return (
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
              );
            }
          })}
        </ComposedChart>
    </ResponsiveContainer>
  );
});
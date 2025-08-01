
import React from 'react';
import { ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { getChartTextColor } from '@/lib/chartTheme';
import { ChartRenderersProps } from '@/types';
import { ScrollableChartContainer } from '../ScrollableChartContainer';

interface AreaChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'series' | 'stackColumn' | 'chartColors' | 'showDataLabels'> {}

export const AreaChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn,
  series, 
  stackColumn, 
  chartColors,
  showDataLabels
}: AreaChartRendererProps) => {
  // Always include the base yColumn as the primary series
  const baseSeries = yColumn ? [{ id: 'base', column: yColumn, type: 'area' as const, yAxisId: 'left' }] : [];
  
  // Combine base series with additional series
  const allSeries = [...baseSeries, ...series];
  
  // Check if we need a right Y-axis
  const needsRightYAxis = series.some(s => s.yAxisId === 'right');
  
  // Check if we have mixed chart types
  const hasMixedTypes = allSeries.some(s => s.type === 'bar');
  
  // Custom label component for data labels
  const renderDataLabel = (props: any) => {
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
  };

  const renderBarDataLabel = (props: any) => {
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
  };
  
  return (
    <ScrollableChartContainer dataLength={data.length} minWidth={400}>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis yAxisId="left" tickFormatter={formatTooltipValue} />
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
            if (s.type === 'bar') {
              return (
                <Bar 
                  key={s.column} 
                  dataKey={s.column} 
                  fill={chartColors[index % chartColors.length]} 
                  yAxisId={s.yAxisId || 'left'}
                  label={showDataLabels ? renderBarDataLabel : false}
                />
              );
            } else {
              return (
                <Area 
                  key={s.column} 
                  type="monotone" 
                  dataKey={s.column} 
                  stackId={stackColumn ? 'stack' : undefined}
                  stroke={chartColors[index % chartColors.length]} 
                  fill={chartColors[index % chartColors.length]}
                  fillOpacity={0.6}
                  yAxisId={s.yAxisId || 'left'}
                  label={showDataLabels ? renderDataLabel : false}
                />
              );
            }
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </ScrollableChartContainer>
  );
};

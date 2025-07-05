
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface BarChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'series' | 'stackColumn' | 'chartColors' | 'showDataLabels'> {}

export const BarChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn,
  series, 
  stackColumn, 
  chartColors,
  showDataLabels
}: BarChartRendererProps) => {
  // Always include the base yColumn as the primary series
  const baseSeries = yColumn ? [{ id: 'base', column: yColumn, type: 'bar' as const, yAxisId: 'left' }] : [];
  
  // For bar charts, force all series to be bar type to prevent mixed rendering
  const forcedBarSeries = series.map(s => ({ ...s, type: 'bar' as const }));
  
  // Combine base series with forced bar series
  const allSeries = [...baseSeries, ...forcedBarSeries];
  
  // Check if we need a right Y-axis
  const needsRightYAxis = series.some(s => s.yAxisId === 'right');
  
  // Since this is BarChartRenderer, we never have mixed types - force pure bar chart
  const hasMixedTypes = false;
  
  // Custom label component for data labels
  const renderDataLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 5} 
        fill="#666" 
        textAnchor="middle" 
        dy={-6}
        fontSize="12"
      >
        {formatTooltipValue(value)}
      </text>
    );
  };

  const renderLineDataLabel = (props: any) => {
    const { x, y, value } = props;
    return (
      <text 
        x={x} 
        y={y - 10} 
        fill="#666" 
        textAnchor="middle" 
        fontSize="12"
      >
        {formatTooltipValue(value)}
      </text>
    );
  };
  
  // Use ComposedChart when we have mixed types, otherwise use BarChart
  const ChartComponent = hasMixedTypes ? ComposedChart : 
    React.lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
  
  return (
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
        {allSeries.map((s, index) => (
          <Bar 
            key={s.column} 
            dataKey={s.column} 
            fill={chartColors[index % chartColors.length]} 
            stackId={stackColumn ? 'stack' : undefined}
            yAxisId={s.yAxisId || 'left'}
            label={showDataLabels ? renderDataLabel : false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

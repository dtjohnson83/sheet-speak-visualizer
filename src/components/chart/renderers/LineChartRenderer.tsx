
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface LineChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'series' | 'chartColors' | 'showDataLabels'> {}

export const LineChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn,
  series, 
  chartColors,
  showDataLabels
}: LineChartRendererProps) => {
  // Always include the base yColumn as the primary series
  const baseSeries = yColumn ? [{ id: 'base', column: yColumn, type: 'line' as const, yAxisId: 'left' }] : [];
  
  // Combine base series with additional series, ensuring all are line type
  const allSeries = [...baseSeries, ...series.map(s => ({ ...s, type: 'line' as const }))];
  
  // Check if we need a right Y-axis
  const needsRightYAxis = series.some(s => s.yAxisId === 'right');
  
  // Custom label component for data labels
  const renderDataLabel = (props: any) => {
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
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
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
          <Line 
            key={s.column} 
            type="monotone" 
            dataKey={s.column} 
            stroke={chartColors[index % chartColors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            yAxisId={s.yAxisId || 'left'}
            label={showDataLabels ? renderDataLabel : false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

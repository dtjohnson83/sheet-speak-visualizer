
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface BarChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'series' | 'stackColumn' | 'chartColors'> {}

export const BarChartRenderer = ({ 
  data, 
  xColumn, 
  series, 
  stackColumn, 
  chartColors 
}: BarChartRendererProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} />
        <YAxis />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {series.map((s, index) => (
          <Bar 
            key={s.column} 
            dataKey={s.column} 
            fill={chartColors[index % chartColors.length]} 
            stackId={stackColumn ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

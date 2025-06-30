
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface LineChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'series' | 'chartColors'> {}

export const LineChartRenderer = ({ 
  data, 
  xColumn, 
  series, 
  chartColors 
}: LineChartRendererProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} />
        <YAxis />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {series.map((s, index) => (
          <Line 
            key={s.column} 
            type="monotone" 
            dataKey={s.column} 
            stroke={chartColors[index % chartColors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};


import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface AreaChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'series' | 'stackColumn' | 'chartColors'> {}

export const AreaChartRenderer = ({ 
  data, 
  xColumn, 
  series, 
  stackColumn, 
  chartColors 
}: AreaChartRendererProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} />
        <YAxis />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {series.map((s, index) => (
          <Area 
            key={s.column} 
            type="monotone" 
            dataKey={s.column} 
            stackId={stackColumn ? 'stack' : undefined}
            stroke={chartColors[index % chartColors.length]} 
            fill={chartColors[index % chartColors.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

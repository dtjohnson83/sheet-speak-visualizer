
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface ScatterChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'series' | 'chartColors'> {}

export const ScatterChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn, 
  series, 
  chartColors 
}: ScatterChartRendererProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} type="number" />
        <YAxis dataKey={yColumn} type="number" />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {series.map((s, index) => (
          <Scatter 
            key={s.column} 
            dataKey={s.column} 
            fill={chartColors[index % chartColors.length]}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

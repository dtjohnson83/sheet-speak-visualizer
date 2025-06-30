
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface TopXChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'chartColors'> {}

export const TopXChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn, 
  chartColors 
}: TopXChartRendererProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey={xColumn} type="category" />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        <Bar dataKey={yColumn} fill={chartColors[0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

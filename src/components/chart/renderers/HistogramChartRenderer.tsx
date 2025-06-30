
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface HistogramChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'chartColors'> {}

export const HistogramChartRenderer = ({ 
  data, 
  chartColors 
}: HistogramChartRendererProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Bar dataKey="frequency" fill={chartColors[0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

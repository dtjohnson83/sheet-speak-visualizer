
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface PieChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'showDataLabels' | 'chartColors'> {}

export const PieChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn, 
  showDataLabels, 
  chartColors 
}: PieChartRendererProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          dataKey={yColumn}
          nameKey={xColumn}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          label={showDataLabels}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

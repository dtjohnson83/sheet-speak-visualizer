
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { DataRow } from '@/pages/Index';

interface TilePieChartRendererProps {
  data: DataRow[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TilePieChartRenderer = ({ 
  data, 
  chartColors, 
  showDataLabels 
}: TilePieChartRendererProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          dataKey="value"
          nameKey="name"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label={showDataLabels ? (entry: any) => `${entry.name}: ${formatTooltipValue(entry.value)}` : false}
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

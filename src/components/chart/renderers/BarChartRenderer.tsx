
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  // If series is empty, create a default series using yColumn
  const effectiveSeries = series.length > 0 ? series : [{ id: 'default', column: yColumn }];
  
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
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} />
        <YAxis tickFormatter={formatTooltipValue} />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {effectiveSeries.map((s, index) => (
          <Bar 
            key={s.column} 
            dataKey={s.column} 
            fill={chartColors[index % chartColors.length]} 
            stackId={stackColumn ? 'stack' : undefined}
            label={showDataLabels ? renderDataLabel : false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

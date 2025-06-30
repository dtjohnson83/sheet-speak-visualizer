
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
  // If series is empty, create a default series using yColumn
  const effectiveSeries = series.length > 0 ? series : [{ id: 'default', column: yColumn }];
  
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
        <YAxis tickFormatter={formatTooltipValue} />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {effectiveSeries.map((s, index) => (
          <Line 
            key={s.column} 
            type="monotone" 
            dataKey={s.column} 
            stroke={chartColors[index % chartColors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            label={showDataLabels ? renderDataLabel : false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

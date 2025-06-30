
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface AreaChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'series' | 'stackColumn' | 'chartColors' | 'showDataLabels'> {}

export const AreaChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn,
  series, 
  stackColumn, 
  chartColors,
  showDataLabels
}: AreaChartRendererProps) => {
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
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} />
        <YAxis tickFormatter={formatTooltipValue} />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {effectiveSeries.map((s, index) => (
          <Area 
            key={s.column} 
            type="monotone" 
            dataKey={s.column} 
            stackId={stackColumn ? 'stack' : undefined}
            stroke={chartColors[index % chartColors.length]} 
            fill={chartColors[index % chartColors.length]}
            fillOpacity={0.6}
            label={showDataLabels ? renderDataLabel : false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

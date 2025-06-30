
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface ScatterChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'xColumn' | 'yColumn' | 'series' | 'chartColors' | 'showDataLabels'> {}

export const ScatterChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn, 
  series, 
  chartColors,
  showDataLabels
}: ScatterChartRendererProps) => {
  // If series is empty, create a default series using yColumn
  const effectiveSeries = series.length > 0 ? series : [{ id: 'default', column: yColumn }];

  // Custom label component for data labels
  const renderDataLabel = (props: any) => {
    const { payload } = props;
    if (!showDataLabels || !payload) return null;
    
    return (
      <text 
        x={props.cx} 
        y={props.cy - 10} 
        fill="#666" 
        textAnchor="middle" 
        fontSize="10"
      >
        {formatTooltipValue(payload[yColumn])}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} type="number" tickFormatter={formatTooltipValue} />
        <YAxis dataKey={yColumn} type="number" tickFormatter={formatTooltipValue} />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {effectiveSeries.map((s, index) => (
          <Scatter 
            key={s.column} 
            dataKey={s.column} 
            fill={chartColors[index % chartColors.length]}
            shape={showDataLabels ? renderDataLabel : undefined}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

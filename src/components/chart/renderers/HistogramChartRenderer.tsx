
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface HistogramChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'chartColors' | 'showDataLabels'> {}

export const HistogramChartRenderer = ({ 
  data, 
  chartColors,
  showDataLabels
}: HistogramChartRendererProps) => {
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
        <XAxis dataKey="range" />
        <YAxis tickFormatter={formatTooltipValue} />
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Bar 
          dataKey="frequency" 
          fill={chartColors[0]} 
          label={showDataLabels ? renderDataLabel : false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

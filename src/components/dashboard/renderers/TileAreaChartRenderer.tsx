
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { SeriesConfig } from '@/hooks/useChartState';
import { DataRow } from '@/pages/Index';

interface TileAreaChartRendererProps {
  data: DataRow[];
  xColumn: string;
  stackColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TileAreaChartRenderer = ({ 
  data, 
  xColumn, 
  stackColumn, 
  effectiveSeries, 
  chartColors, 
  showDataLabels 
}: TileAreaChartRendererProps) => {
  // Check if we need a right Y-axis
  const needsRightYAxis = effectiveSeries.some(s => s.yAxisId === 'right');

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
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} />
        <YAxis yAxisId="left" />
        {needsRightYAxis && (
          <YAxis yAxisId="right" orientation="right" />
        )}
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
            yAxisId={s.yAxisId || 'left'}
            label={showDataLabels ? renderDataLabel : false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

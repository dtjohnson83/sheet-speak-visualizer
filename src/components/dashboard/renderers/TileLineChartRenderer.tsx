
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { SeriesConfig } from '@/hooks/useChartState';
import { DataRow } from '@/pages/Index';

interface TileLineChartRendererProps {
  data: DataRow[];
  xColumn: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TileLineChartRenderer = ({ 
  data, 
  xColumn, 
  effectiveSeries, 
  chartColors, 
  showDataLabels 
}: TileLineChartRendererProps) => {
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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} />
        <YAxis yAxisId="left" />
        {needsRightYAxis && (
          <YAxis yAxisId="right" orientation="right" />
        )}
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
            yAxisId={s.yAxisId || 'left'}
            label={showDataLabels ? renderDataLabel : false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

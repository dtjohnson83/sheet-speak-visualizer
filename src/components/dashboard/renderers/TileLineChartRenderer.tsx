
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { getChartTextColor } from '@/lib/chartTheme';
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

  // Check if we have mixed chart types
  const hasMixedTypes = effectiveSeries.some(s => s.type === 'bar');

  const renderDataLabel = (props: any) => {
    const { x, y, value } = props;
    return (
      <text 
        x={x} 
        y={y - 10} 
        fill={getChartTextColor()} 
        textAnchor="middle" 
        fontSize="12"
      >
        {formatTooltipValue(value)}
      </text>
    );
  };

  const renderBarDataLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 5} 
        fill={getChartTextColor()} 
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
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xColumn} />
        <YAxis yAxisId="left" tickFormatter={formatTooltipValue} />
        {needsRightYAxis && (
          <YAxis yAxisId="right" orientation="right" tickFormatter={formatTooltipValue} />
        )}
        <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        <Legend />
        {effectiveSeries.map((s, index) => {
          if (s.type === 'bar') {
            return (
              <Bar 
                key={s.column} 
                dataKey={s.column} 
                fill={chartColors[index % chartColors.length]} 
                yAxisId={s.yAxisId || 'left'}
                label={showDataLabels ? renderBarDataLabel : false}
              />
            );
          } else {
            return (
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
            );
          }
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
};


import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { getChartTextColor } from '@/lib/chartTheme';
import { SeriesConfig } from '@/hooks/useChartState';
import { DataRow } from '@/pages/Index';


interface TileScatterChartRendererProps {
  data: DataRow[];
  xColumn: string;
  valueColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
}

export const TileScatterChartRenderer = ({ 
  data, 
  xColumn, 
  valueColumn, 
  effectiveSeries, 
  chartColors 
}: TileScatterChartRendererProps) => {
  return (
    <ScrollableChartContainer dataLength={data.length} minWidth={400}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis tickFormatter={formatTooltipValue} />
          <ZAxis dataKey={valueColumn} range={[64, 144]} />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {effectiveSeries.map((s, index) => (
            <Scatter key={s.column} data={data} dataKey={s.column} fill={chartColors[index % chartColors.length]} />
          ))}
        </ScatterChart>
    </ResponsiveContainer>
  );
};

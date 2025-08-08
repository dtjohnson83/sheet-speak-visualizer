
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { getChartTextColor } from '@/lib/chartTheme';
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
  // Always include the base yColumn as the primary series
  const baseSeries = yColumn ? [{ id: 'base', column: yColumn, type: 'scatter' as const }] : [];
  
  // Combine base series with additional series and ensure unique columns (no duplicates)
  const allSeriesRaw = [...baseSeries, ...series];
  const seen = new Set<string>();
  const allSeries = allSeriesRaw.filter((s) => {
    if (!s?.column) return false;
    if (seen.has(s.column)) return false;
    seen.add(s.column);
    return true;
  });

  // Custom label component for data labels
  const renderDataLabel = (props: any) => {
    const { payload } = props;
    if (!showDataLabels || !payload) return null;
    
    return (
      <text 
        x={props.cx} 
        y={props.cy - 10} 
        fill={getChartTextColor()} 
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
          <XAxis dataKey={xColumn} type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTooltipValue} />
          <YAxis dataKey={yColumn} type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTooltipValue} />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {allSeries.map((s, index) => (
            <Scatter 
              key={s.column} 
              name={s.column}
              dataKey={s.column} 
              fill={chartColors[index % chartColors.length]}
              shape={showDataLabels ? renderDataLabel : undefined}
            />
          ))}
        </ScatterChart>
    </ResponsiveContainer>
  );
};

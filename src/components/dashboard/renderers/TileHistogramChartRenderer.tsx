
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { DataRow } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { formatTooltipValue } from '@/lib/numberUtils';
import { getChartTextColor, getThemeAwareChartColors } from '@/lib/chartTheme';

interface TileHistogramChartRendererProps {
  data: DataRow[];
  xColumn: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TileHistogramChartRenderer = ({ 
  data, 
  chartColors,
  showDataLabels
}: TileHistogramChartRendererProps) => {
  // Use theme-aware colors for consistent dark mode support
  const themeColors = getThemeAwareChartColors();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
        No histogram data available
      </div>
    );
  }

  // Custom label component for data labels
  const renderDataLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 2} 
        fill={getChartTextColor()} 
        textAnchor="middle" 
        dy={-3}
        fontSize="8"
      >
        {formatTooltipValue(value)}
      </text>
    );
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <XAxis 
            dataKey="range" 
            fontSize={8}
            tick={{ fontSize: 8 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={40}
          />
          <YAxis 
            tickFormatter={formatTooltipValue} 
            fontSize={8}
            tick={{ fontSize: 8 }}
            width={30}
          />
          <Bar 
            dataKey="frequency" 
            fill={themeColors[0]} 
            label={showDataLabels ? renderDataLabel : false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

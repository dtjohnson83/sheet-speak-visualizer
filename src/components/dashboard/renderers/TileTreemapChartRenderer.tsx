
import React from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import { DataRow } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { formatTooltipValue } from '@/lib/numberUtils';
import { getChartTextColor } from '@/lib/chartTheme';

interface TileTreemapChartRendererProps {
  data: DataRow[];
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TileTreemapChartRenderer = ({ 
  data, 
  chartColors,
  showDataLabels
}: TileTreemapChartRendererProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
        No treemap data available
      </div>
    );
  }

  // Custom content component for treemap cells
  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, value } = props;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: chartColors[index % chartColors.length],
            stroke: '#fff',
            strokeWidth: 1,
            strokeOpacity: 1,
          }}
        />
        {showDataLabels && width > 40 && height > 20 && (
          <>
            <text 
              x={x + width / 2} 
              y={y + height / 2 - 3} 
              textAnchor="middle" 
              fill={getChartTextColor(true)} 
              fontSize="8"
              fontWeight="bold"
            >
              {name && name.length > 10 ? name.substring(0, 10) + '...' : name}
            </text>
            <text 
              x={x + width / 2} 
              y={y + height / 2 + 8} 
              textAnchor="middle" 
              fill={getChartTextColor(true)} 
              fontSize="6"
            >
              {formatTooltipValue(value)}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          nameKey="name"
          content={<CustomizedContent />}
        />
      </ResponsiveContainer>
    </div>
  );
};


import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface TreemapChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'chartColors' | 'showDataLabels'> {}

export const TreemapChartRenderer = ({ 
  data, 
  chartColors,
  showDataLabels
}: TreemapChartRendererProps) => {
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
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        {showDataLabels && width > 60 && height > 30 && (
          <>
            <text 
              x={x + width / 2} 
              y={y + height / 2 - 5} 
              textAnchor="middle" 
              fill="#fff" 
              fontSize="12"
              fontWeight="bold"
            >
              {name}
            </text>
            <text 
              x={x + width / 2} 
              y={y + height / 2 + 10} 
              textAnchor="middle" 
              fill="#fff" 
              fontSize="10"
            >
              {formatTooltipValue(value)}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        content={<CustomizedContent />}
      >
        <Tooltip formatter={(value: any, name: any) => [formatTooltipValue(value), name]} />
      </Treemap>
    </ResponsiveContainer>
  );
};

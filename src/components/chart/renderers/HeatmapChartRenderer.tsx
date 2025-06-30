
import React from 'react';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface HeatmapChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'chartColors'> {}

interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
}

export const HeatmapChartRenderer = ({ 
  data, 
  chartColors 
}: HeatmapChartRendererProps) => {
  const heatmapData = data as HeatmapDataPoint[];
  
  if (!heatmapData.length) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No heatmap data available
      </div>
    );
  }

  // Get unique x and y values
  const uniqueX = [...new Set(heatmapData.map(d => d.x))];
  const uniqueY = [...new Set(heatmapData.map(d => d.y))];
  
  // Find min and max values for color scaling
  const values = heatmapData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Create a map for quick data lookup
  const dataMap = new Map();
  heatmapData.forEach(d => {
    dataMap.set(`${d.x}-${d.y}`, d.value);
  });

  // Color intensity based on value
  const getColorIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  const cellSize = Math.min(400 / Math.max(uniqueX.length, uniqueY.length), 40);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-8" style={{ marginLeft: '-80px' }}>
          {uniqueY.map((y, index) => (
            <div
              key={y}
              className="text-xs text-gray-600 dark:text-gray-400"
              style={{
                height: `${cellSize}px`,
                lineHeight: `${cellSize}px`,
                marginBottom: '1px'
              }}
            >
              {y}
            </div>
          ))}
        </div>

        {/* Main heatmap grid */}
        <div className="ml-20">
          {/* X-axis labels */}
          <div className="flex mb-1" style={{ marginLeft: '1px' }}>
            {uniqueX.map(x => (
              <div
                key={x}
                className="text-xs text-gray-600 dark:text-gray-400 text-center"
                style={{ 
                  width: `${cellSize}px`,
                  marginRight: '1px',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  height: '40px',
                  lineHeight: '40px'
                }}
              >
                {x}
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          {uniqueY.map(y => (
            <div key={y} className="flex mb-px">
              {uniqueX.map(x => {
                const value = dataMap.get(`${x}-${y}`) || 0;
                const intensity = getColorIntensity(value);
                const backgroundColor = `rgba(59, 130, 246, ${intensity * 0.8})`;
                
                return (
                  <div
                    key={`${x}-${y}`}
                    className="border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor,
                      color: intensity > 0.5 ? 'white' : 'black',
                      marginRight: '1px'
                    }}
                    title={`${x} - ${y}: ${formatTooltipValue(value)}`}
                  >
                    {cellSize > 30 ? formatTooltipValue(value) : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Low</span>
          <div className="flex">
            {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
              <div
                key={intensity}
                className="w-4 h-4 border border-gray-300"
                style={{ backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})` }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

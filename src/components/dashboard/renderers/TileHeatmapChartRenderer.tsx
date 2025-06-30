
import React from 'react';
import { DataRow } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { formatTooltipValue } from '@/lib/numberUtils';

interface TileHeatmapChartRendererProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string;
  valueColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
}

export const TileHeatmapChartRenderer = ({ 
  data, 
  xColumn, 
  yColumn, 
  valueColumn,
  chartColors 
}: TileHeatmapChartRendererProps) => {
  // Process heatmap data
  const heatmapData = data.reduce((acc, row) => {
    const xValue = row[xColumn]?.toString() || 'Unknown';
    const yValue = row[yColumn]?.toString() || 'Unknown';
    const key = `${xValue}_${yValue}`;
    
    let value = 1;
    if (valueColumn) {
      const numValue = Number(row[valueColumn]);
      if (!isNaN(numValue) && isFinite(numValue)) {
        value = numValue;
      }
    }
    
    if (!acc[key]) acc[key] = 0;
    acc[key] += value;
    return acc;
  }, {} as Record<string, number>);

  const processedData = Object.entries(heatmapData).map(([key, value]) => {
    const [x, y] = key.split('_');
    return { x, y, value };
  });

  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
        No heatmap data available
      </div>
    );
  }

  const uniqueX = [...new Set(processedData.map(d => d.x))].slice(0, 8);
  const uniqueY = [...new Set(processedData.map(d => d.y))].slice(0, 6);
  
  const values = processedData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  const dataMap = new Map();
  processedData.forEach(d => {
    dataMap.set(`${d.x}-${d.y}`, d.value);
  });

  const getColorIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  const cellSize = Math.min(30, Math.max(200 / Math.max(uniqueX.length, uniqueY.length), 12));

  return (
    <div className="h-full p-2 overflow-auto">
      <div className="flex items-center justify-center">
        <div className="relative">
          {/* Heatmap grid */}
          <div className="flex flex-col">
            {/* X-axis labels */}
            <div className="flex mb-1 ml-8">
              {uniqueX.map(x => (
                <div
                  key={x}
                  className="text-xs text-gray-600 dark:text-gray-400 text-center truncate"
                  style={{ 
                    width: `${cellSize}px`,
                    fontSize: '8px'
                  }}
                  title={x}
                >
                  {x.length > 6 ? x.substring(0, 6) + '...' : x}
                </div>
              ))}
            </div>

            {/* Grid with Y labels */}
            {uniqueY.map(y => (
              <div key={y} className="flex items-center">
                <div
                  className="text-xs text-gray-600 dark:text-gray-400 w-8 truncate"
                  style={{ fontSize: '8px' }}
                  title={y}
                >
                  {y.length > 8 ? y.substring(0, 8) + '...' : y}
                </div>
                <div className="flex">
                  {uniqueX.map(x => {
                    const value = dataMap.get(`${x}-${y}`) || 0;
                    const intensity = getColorIntensity(value);
                    const backgroundColor = `rgba(59, 130, 246, ${intensity * 0.8})`;
                    
                    return (
                      <div
                        key={`${x}-${y}`}
                        className="border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium"
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          backgroundColor,
                          color: intensity > 0.5 ? 'white' : 'black',
                          fontSize: cellSize > 20 ? '8px' : '6px'
                        }}
                        title={`${x} - ${y}: ${formatTooltipValue(value)}`}
                      >
                        {cellSize > 15 && value > 0 ? formatTooltipValue(value) : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

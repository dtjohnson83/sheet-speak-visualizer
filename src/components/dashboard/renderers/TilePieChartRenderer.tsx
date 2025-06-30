
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { DataRow } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';

interface TilePieChartRendererProps {
  data: DataRow[];
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TilePieChartRenderer = ({ 
  data, 
  chartColors,
  showDataLabels = false 
}: TilePieChartRendererProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
        No data available for pie chart
      </div>
    );
  }

  // Custom tooltip to show formatted values
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {formatTooltipValue(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate total for percentage calculation
  const total = data.reduce((sum, entry) => {
    const value = Object.values(entry).find(val => typeof val === 'number');
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);

  const renderLabel = (entry: any) => {
    if (!showDataLabels) return '';
    const percentage = ((entry.value / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={Object.keys(data[0] || {}).find(key => typeof data[0]?.[key] === 'number') || 'value'}
            nameKey={Object.keys(data[0] || {}).find(key => typeof data[0]?.[key] !== 'number') || 'name'}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            label={renderLabel}
            labelLine={false}
            fontSize={10}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartColors[index % chartColors.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

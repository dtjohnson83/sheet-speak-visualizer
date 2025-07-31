
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatTooltipValue } from '@/lib/numberUtils';
import { DataRow } from '@/pages/Index';

interface PieChartRendererProps {
  data: DataRow[];
  chartColors: string[];
  showDataLabels?: boolean;
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
}

export const PieChartRenderer = ({ 
  data, 
  chartColors,
  showDataLabels = false,
  isTemporalAnimated = false,
  animationSpeed = 1000
}: PieChartRendererProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No data available for pie chart
      </div>
    );
  }

  // Custom tooltip to show formatted values
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">
            Value: {formatTooltipValue(data.value)}
          </p>
          <p className="text-gray-600">
            Percentage: {((data.value / data.payload.total) * 100).toFixed(1)}%
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

  const dataWithTotal = data.map(entry => ({ ...entry, total }));

  const renderLabel = (entry: any) => {
    if (!showDataLabels) return '';
    const percentage = ((entry.value / total) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithTotal}
            dataKey={Object.keys(data[0] || {}).find(key => typeof data[0]?.[key] === 'number') || 'value'}
            nameKey={Object.keys(data[0] || {}).find(key => typeof data[0]?.[key] !== 'number') || 'name'}
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={renderLabel}
            labelLine={false}
            isAnimationActive={isTemporalAnimated}
            animationDuration={isTemporalAnimated ? animationSpeed : 1500}
            animationEasing="ease-out"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartColors[index % chartColors.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

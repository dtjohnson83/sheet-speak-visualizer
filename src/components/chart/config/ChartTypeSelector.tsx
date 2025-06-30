import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chartTypeInfo } from '@/lib/chartTypeInfo';
import { Icons } from '@/components/ui/icons';

interface ChartTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: 'barChart' },
  { value: 'line', label: 'Line Chart', icon: 'lineChart' },
  { value: 'area', label: 'Area Chart', icon: 'areaChart' },
  { value: 'pie', label: 'Pie Chart', icon: 'pieChart' },
  { value: 'scatter', label: 'Scatter Plot', icon: 'scatter' },
  { value: 'heatmap', label: 'Heatmap', icon: 'heatmap' },
  { value: 'histogram', label: 'Histogram', icon: 'histogram' },
  { value: 'sankey', label: 'Sankey Diagram', icon: 'sankey' },
  { value: 'treemap', label: 'Treemap', icon: 'treemap' },
  { value: 'topX', label: 'Top X Ranking', icon: 'list' },
  { value: 'kpi', label: 'KPI Cards', icon: 'square' },
];

export const ChartTypeSelector = ({ value, onChange }: ChartTypeSelectorProps) => {
  return (
    <div>
      <Select onValueChange={onChange} defaultValue={value}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select chart type" />
        </SelectTrigger>
        <SelectContent>
          {chartTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex items-center gap-2">
                {type.icon && <Icons.chart[type.icon as keyof Icons['chart']] className="w-4 h-4" />}
                {type.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

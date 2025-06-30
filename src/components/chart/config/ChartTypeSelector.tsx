
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chartTypeInfo } from '@/lib/chartTypeInfo';
import { BarChart3, LineChart, AreaChart, ScatterChart, Square, BarChart2, Hash, TrendingUp, PieChart } from 'lucide-react';

interface ChartTypeSelectorProps {
  chartType: string;
  setChartType: (value: any) => void;
  columns: any[];
  xColumn: string;
  yColumn: string;
  dataLength: number;
}

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'area', label: 'Area Chart', icon: AreaChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
  { value: 'heatmap', label: 'Heatmap', icon: Hash },
  { value: 'histogram', label: 'Histogram', icon: BarChart2 },
  { value: 'treemap', label: 'Treemap', icon: Square },
  { value: 'kpi', label: 'KPI Cards', icon: Square },
];

export const ChartTypeSelector = ({ chartType, setChartType, columns, xColumn, yColumn, dataLength }: ChartTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Chart Type
      </label>
      <Select onValueChange={setChartType} defaultValue={chartType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select chart type" />
        </SelectTrigger>
        <SelectContent>
          {chartTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {type.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

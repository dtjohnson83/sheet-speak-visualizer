
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chartTypeInfo } from '@/lib/chartTypeInfo';
import { BarChart3, LineChart, AreaChart, ScatterChart, Square, BarChart2, List, Hash, TrendingUp } from 'lucide-react';

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
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
  { value: 'heatmap', label: 'Heatmap', icon: Hash },
  { value: 'histogram', label: 'Histogram', icon: BarChart2 },
  { value: 'sankey', label: 'Sankey Diagram', icon: TrendingUp },
  { value: 'treemap', label: 'Treemap', icon: Square },
  { value: 'topX', label: 'Top X Ranking', icon: List },
  { value: 'kpi', label: 'KPI Cards', icon: Square },
];

export const ChartTypeSelector = ({ chartType, setChartType, columns, xColumn, yColumn, dataLength }: ChartTypeSelectorProps) => {
  return (
    <div>
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

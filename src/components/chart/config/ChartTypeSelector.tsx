
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';
import { ChartTypeInfo } from '../ChartTypeInfo';
import { ChartTypeGuide } from '../ChartTypeGuide';
import { ColumnInfo } from '@/pages/Index';

interface ChartTypeSelectorProps {
  chartType: string;
  setChartType: (value: any) => void;
  columns?: ColumnInfo[];
  xColumn?: string;
  yColumn?: string;
  dataLength?: number;
}

export const ChartTypeSelector = ({ 
  chartType, 
  setChartType, 
  columns = [], 
  xColumn = '', 
  yColumn = '', 
  dataLength = 0 
}: ChartTypeSelectorProps) => {
  const [showGuide, setShowGuide] = useState(false);

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'stacked-bar', label: 'Stacked Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'histogram', label: 'Histogram' },
    { value: 'heatmap', label: 'Heatmap' },
    { value: 'treemap', label: 'Tree Map' },
    { value: 'sankey', label: 'Sankey Diagram' }
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium">Chart Type</label>
        <ChartTypeInfo chartType={chartType} />
        <Dialog open={showGuide} onOpenChange={setShowGuide}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chart Type Guide</DialogTitle>
            </DialogHeader>
            <ChartTypeGuide 
              chartType={chartType}
              xColumn={xColumn}
              yColumn={yColumn}
              columns={columns}
              dataLength={dataLength}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Select value={chartType} onValueChange={setChartType}>
        <SelectTrigger className="bg-white dark:bg-gray-800">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
          {chartTypes.map((type) => (
            <SelectItem key={type.value} value={type.value} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span>{type.label}</span>
                <ChartTypeInfo chartType={type.value} className="ml-auto" />
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

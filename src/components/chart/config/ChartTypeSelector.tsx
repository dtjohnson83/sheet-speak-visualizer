
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { chartTypeInfo } from '@/lib/chartTypeInfo';
import { useGraphChartAvailability } from '@/hooks/useGraphChartAvailability';
import { BarChart3, LineChart, AreaChart, ScatterChart, Square, BarChart2, Hash, TrendingUp, PieChart, Box, MapPin, Mountain } from 'lucide-react';

interface ChartTypeSelectorProps {
  chartType: string;
  setChartType: (value: any) => void;
  columns: any[];
  xColumn: string;
  yColumn: string;
  dataLength: number;
}

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3, category: '2D' },
  { value: 'stacked-bar', label: 'Stacked Bar Chart', icon: BarChart3, category: '2D' },
  { value: 'line', label: 'Line Chart', icon: LineChart, category: '2D' },
  { value: 'area', label: 'Area Chart', icon: AreaChart, category: '2D' },
  { value: 'pie', label: 'Pie Chart', icon: PieChart, category: '2D' },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart, category: '2D' },
  { value: 'heatmap', label: 'Heatmap', icon: Hash, category: '2D' },
  { value: 'histogram', label: 'Histogram', icon: BarChart2, category: '2D' },
  { value: 'treemap', label: 'Treemap', icon: Square, category: '2D' },
  { value: 'sankey', label: 'Sankey Diagram', icon: TrendingUp, category: '2D' },
  { value: 'kpi', label: 'KPI Cards', icon: Square, category: '2D' },
  { value: 'network', label: 'Network Graph', icon: TrendingUp, category: 'Graph' },
  { value: 'network3d', label: '3D Network', icon: Box, category: 'Graph' },
  { value: 'entity-relationship', label: 'ER Diagram', icon: Hash, category: 'Graph' },
  { value: 'bar3d', label: '3D Bar Chart', icon: Box, category: '3D' },
  { value: 'scatter3d', label: '3D Scatter Plot', icon: Box, category: '3D' },
  { value: 'surface3d', label: '3D Surface Plot', icon: Square, category: '3D' },
  { value: 'map2d', label: '2D Map', icon: MapPin, category: 'geospatial' },
  { value: 'map3d', label: '3D Map', icon: Mountain, category: 'geospatial' }
];

export const ChartTypeSelector = ({ chartType, setChartType, columns, xColumn, yColumn, dataLength }: ChartTypeSelectorProps) => {
  console.log('ChartTypeSelector - Render with chartType:', chartType);
  const { canShowGraphCharts, graphChartTypes, reasonUnavailable, availabilityDetails } = useGraphChartAvailability();
  
  const handleChartTypeChange = (newChartType: string) => {
    console.log('ChartTypeSelector - handleChartTypeChange called:', {
      from: chartType,
      to: newChartType,
      setChartTypeFunction: typeof setChartType
    });
    setChartType(newChartType);
    console.log('ChartTypeSelector - setChartType called with:', newChartType);
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Chart Type
      </label>
      <Select 
        onValueChange={handleChartTypeChange} 
        value={chartType}
        key={`chart-type-${chartType}`}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select chart type" />
        </SelectTrigger>
        <SelectContent>
          {/* 2D Charts */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">2D Charts</div>
          {chartTypes.filter(type => type.category === '2D').map((type) => {
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
          
          {/* Graph Charts */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">
            Graph Visualizations
            {!canShowGraphCharts && (
              <span className="ml-2 text-xs text-orange-600">({reasonUnavailable})</span>
            )}
          </div>
          {chartTypes.filter(type => type.category === 'Graph').map((type) => {
            const IconComponent = type.icon;
            const isGraphChart = graphChartTypes.includes(type.value);
            const isDisabled = isGraphChart && !canShowGraphCharts;
            
            if (isDisabled) {
              return (
                <SelectItem key={type.value} value={type.value} disabled>
                  <div className="flex items-center gap-2 opacity-50">
                    <IconComponent className="w-4 h-4" />
                    {type.label}
                    <Badge variant="outline" className="text-xs ml-auto">
                      {reasonUnavailable}
                    </Badge>
                  </div>
                </SelectItem>
              );
            }
            
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {type.label}
                  <div className="ml-auto flex gap-1">
                    <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">AI</span>
                    {canShowGraphCharts && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {availabilityDetails.relationshipCount} rels
                      </Badge>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}

          {/* 3D Charts */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">3D Charts</div>
          {chartTypes.filter(type => type.category === '3D').map((type) => {
            const IconComponent = type.icon;
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {type.label}
                  <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">NEW</span>
                </div>
              </SelectItem>
            );
          })}

          {/* Geospatial Maps */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">Geospatial Maps</div>
          {chartTypes.filter(type => type.category === 'geospatial').map((type) => {
            const IconComponent = type.icon;
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {type.label}
                  <span className="ml-auto text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">NEW</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

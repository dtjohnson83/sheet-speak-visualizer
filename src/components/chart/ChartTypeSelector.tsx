
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChartTypeSelectorProps {
  chartType: string;
  setChartType: (value: any) => void;
}

export const ChartTypeSelector = ({ chartType, setChartType }: ChartTypeSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Chart Type</label>
      <Select value={chartType} onValueChange={setChartType}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bar">Bar Chart</SelectItem>
          <SelectItem value="stacked-bar">Stacked Bar Chart</SelectItem>
          <SelectItem value="line">Line Chart</SelectItem>
          <SelectItem value="pie">Pie Chart</SelectItem>
          <SelectItem value="scatter">Scatter Plot</SelectItem>
          <SelectItem value="heatmap">Heatmap</SelectItem>
          <SelectItem value="treemap">Tree Map</SelectItem>
          <SelectItem value="sankey">Sankey Diagram</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

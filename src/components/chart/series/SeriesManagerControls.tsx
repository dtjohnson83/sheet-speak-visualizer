
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';

interface SeriesManagerControlsProps {
  seriesConfig: SeriesConfig;
  numericColumns: ColumnInfo[];
  yColumn: string;
  series: SeriesConfig[];
  onUpdateColumn: (id: string, column: string) => void;
  onUpdateType: (id: string, type: 'bar' | 'line') => void;
  onUpdateAggregation: (id: string, aggregationMethod: AggregationMethod) => void;
  onUpdateYAxis: (id: string, yAxisId: string) => void;
  onRemove: (id: string) => void;
}

export const SeriesManagerControls = ({
  seriesConfig,
  numericColumns,
  yColumn,
  series,
  onUpdateColumn,
  onUpdateType,
  onUpdateAggregation,
  onUpdateYAxis,
  onRemove
}: SeriesManagerControlsProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div 
        className="w-4 h-4 rounded flex-shrink-0" 
        style={{ backgroundColor: seriesConfig.color }}
      />
      <Select 
        value={seriesConfig.column} 
        onValueChange={(value) => onUpdateColumn(seriesConfig.id, value)}
      >
        <SelectTrigger className="flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {numericColumns
            .filter(col => col.name !== yColumn && (col.name === seriesConfig.column || !series.some(s => s.column === col.name)))
            .map((col) => (
            <SelectItem key={col.name} value={col.name}>
              {col.name} ({col.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select 
        value={seriesConfig.type} 
        onValueChange={(value: 'bar' | 'line') => onUpdateType(seriesConfig.id, value)}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bar">Bar</SelectItem>
          <SelectItem value="line">Line</SelectItem>
        </SelectContent>
      </Select>
      <Select 
        value={seriesConfig.aggregationMethod} 
        onValueChange={(value: AggregationMethod) => onUpdateAggregation(seriesConfig.id, value)}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sum">Sum</SelectItem>
          <SelectItem value="average">Avg</SelectItem>
          <SelectItem value="count">Count</SelectItem>
          <SelectItem value="min">Min</SelectItem>
          <SelectItem value="max">Max</SelectItem>
        </SelectContent>
      </Select>
      <Select 
        value={seriesConfig.yAxisId || 'left'} 
        onValueChange={(value) => onUpdateYAxis(seriesConfig.id, value)}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Left</SelectItem>
          <SelectItem value="right">Right</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={() => onRemove(seriesConfig.id)}
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-700 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

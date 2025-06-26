
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';

interface SeriesManagerProps {
  series: SeriesConfig[];
  setSeries: (series: SeriesConfig[]) => void;
  numericColumns: ColumnInfo[];
  yColumn: string;
  chartColors: string[];
}

export const SeriesManager = ({ 
  series, 
  setSeries, 
  numericColumns, 
  yColumn, 
  chartColors 
}: SeriesManagerProps) => {
  const addSeries = () => {
    if (numericColumns.length === 0) return;
    
    const availableColumns = numericColumns.filter(col => 
      col.name !== yColumn && !series.some(s => s.column === col.name)
    );
    
    if (availableColumns.length === 0) return;
    
    const newSeries: SeriesConfig = {
      id: Math.random().toString(36).substr(2, 9),
      column: availableColumns[0].name,
      color: chartColors[(series.length + 1) % chartColors.length],
      type: 'bar'
    };
    
    setSeries([...series, newSeries]);
  };

  const removeSeries = (id: string) => {
    setSeries(series.filter(s => s.id !== id));
  };

  const updateSeriesColumn = (id: string, column: string) => {
    setSeries(series.map(s => s.id === id ? { ...s, column } : s));
  };

  const updateSeriesType = (id: string, type: 'bar' | 'line') => {
    setSeries(series.map(s => s.id === id ? { ...s, type } : s));
  };

  const getAvailableSeriesColumns = () => {
    return numericColumns.filter(col => 
      col.name !== yColumn && !series.some(s => s.column === col.name)
    );
  };

  return (
    <div className="mt-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium">Additional Series</h4>
        <Button
          onClick={addSeries}
          disabled={getAvailableSeriesColumns().length === 0}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Series
        </Button>
      </div>
      
      {series.length > 0 && (
        <div className="space-y-2">
          {series.map((seriesConfig) => (
            <div key={seriesConfig.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: seriesConfig.color }}
              />
              <Select 
                value={seriesConfig.column} 
                onValueChange={(value) => updateSeriesColumn(seriesConfig.id, value)}
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
                onValueChange={(value: 'bar' | 'line') => updateSeriesType(seriesConfig.id, value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => removeSeries(seriesConfig.id)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, X, Info } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';

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
  
  const getAvailableSeriesColumns = () => {
    const available = numericColumns.filter(col => 
      col.name !== yColumn && !series.some(s => s.column === col.name)
    );
    
    console.log('SeriesManager - Available columns calculation:', {
      totalNumericColumns: numericColumns.length,
      numericColumnNames: numericColumns.map(c => c.name),
      yColumn,
      existingSeriesColumns: series.map(s => s.column),
      availableColumns: available.map(c => c.name),
      availableCount: available.length
    });
    
    return available;
  };

  const availableColumns = getAvailableSeriesColumns();
  // Limit to only one additional series
  const canAddSeries = availableColumns.length > 0 && series.length < 1;

  const addSeries = () => {
    console.log('SeriesManager - Add Series clicked:', {
      canAddSeries,
      availableColumnsCount: availableColumns.length,
      currentSeriesCount: series.length
    });
    
    if (!canAddSeries) {
      console.warn('SeriesManager - Cannot add series: limit reached or no available columns');
      return;
    }
    
    const newSeries: SeriesConfig = {
      id: Math.random().toString(36).substr(2, 9),
      column: availableColumns[0].name,
      color: chartColors[(series.length + 1) % chartColors.length],
      type: 'bar',
      aggregationMethod: 'sum',
      yAxisId: 'right' // Assign additional series to right Y-axis
    };
    
    console.log('SeriesManager - Adding new series:', newSeries);
    setSeries([...series, newSeries]);
  };

  const removeSeries = (id: string) => {
    console.log('SeriesManager - Removing series:', id);
    setSeries(series.filter(s => s.id !== id));
  };

  const updateSeriesColumn = (id: string, column: string) => {
    console.log('SeriesManager - Updating series column:', { id, column });
    setSeries(series.map(s => s.id === id ? { ...s, column } : s));
  };

  const updateSeriesType = (id: string, type: 'bar' | 'line') => {
    console.log('SeriesManager - Updating series type:', { id, type });
    setSeries(series.map(s => s.id === id ? { ...s, type } : s));
  };

  const updateSeriesAggregation = (id: string, aggregationMethod: AggregationMethod) => {
    console.log('SeriesManager - Updating series aggregation:', { id, aggregationMethod });
    setSeries(series.map(s => s.id === id ? { ...s, aggregationMethod } : s));
  };

  const updateSeriesYAxis = (id: string, yAxisId: string) => {
    console.log('SeriesManager - Updating series Y-axis:', { id, yAxisId });
    setSeries(series.map(s => s.id === id ? { ...s, yAxisId } : s));
  };

  const getButtonTooltipContent = () => {
    if (numericColumns.length === 0) {
      return "No numeric columns available for series";
    }
    if (numericColumns.length === 1 && yColumn) {
      return "Only one numeric column available (already used as Y-axis)";
    }
    if (series.length >= 1) {
      return "Maximum of one additional series allowed";
    }
    if (!availableColumns.length) {
      return "All available numeric columns are already used";
    }
    return `Add a new data series (${availableColumns.length} columns available)`;
  };

  return (
    <div className="mt-6 mb-6 bg-white dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">Additional Series (Max: 1)</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-48">
                  Add one additional data series to compare different metrics on the same chart. 
                  Only works with Bar, Line, and Scatter charts.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={addSeries}
                  disabled={!canAddSeries}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Series
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{getButtonTooltipContent()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <div>Debug Info:</div>
          <div>Total numeric columns: {numericColumns.length}</div>
          <div>Y-column: {yColumn || 'None'}</div>
          <div>Available for series: {availableColumns.length}</div>
          <div>Current series: {series.length}/1</div>
        </div>
      )}

      {!canAddSeries && numericColumns.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {numericColumns.length === 1 && yColumn 
              ? "You need at least 2 numeric columns to add additional series."
              : series.length >= 1
              ? "Maximum of one additional series reached. Remove the current series to add a different one."
              : "All available numeric columns are already in use. Remove a series to add a different one."
            }
          </p>
        </div>
      )}
      
      {series.length > 0 && (
        <div className="space-y-3">
          {series.map((seriesConfig) => (
            <div key={seriesConfig.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div 
                className="w-4 h-4 rounded flex-shrink-0" 
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
                onValueChange={(value: AggregationMethod) => updateSeriesAggregation(seriesConfig.id, value)}
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
                onValueChange={(value) => updateSeriesYAxis(seriesConfig.id, value)}
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
                onClick={() => removeSeries(seriesConfig.id)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 flex-shrink-0"
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

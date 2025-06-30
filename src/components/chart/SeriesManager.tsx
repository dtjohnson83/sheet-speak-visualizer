
import { ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { SeriesManagerHeader } from './series/SeriesManagerHeader';
import { SeriesManagerControls } from './series/SeriesManagerControls';
import { SeriesManagerDebug } from './series/SeriesManagerDebug';
import { SeriesManagerInfo } from './series/SeriesManagerInfo';
import { getAvailableSeriesColumns, canAddNewSeries } from './series/SeriesManagerUtils';

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
  
  const availableColumns = getAvailableSeriesColumns(numericColumns, yColumn, series);
  const canAddSeries = canAddNewSeries(availableColumns, series.length);

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
      yAxisId: 'right'
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

  // Only render the container if there are series or if we can add series
  if (series.length === 0 && !canAddSeries && numericColumns.length <= 1) {
    return null;
  }

  return (
    <div className="mt-6 mb-6">
      <SeriesManagerHeader
        canAddSeries={canAddSeries}
        availableColumns={availableColumns}
        numericColumns={numericColumns}
        yColumn={yColumn}
        seriesLength={series.length}
        onAddSeries={addSeries}
      />

      <SeriesManagerDebug
        numericColumns={numericColumns}
        yColumn={yColumn}
        availableColumns={availableColumns}
        seriesLength={series.length}
      />

      <SeriesManagerInfo
        canAddSeries={canAddSeries}
        numericColumns={numericColumns}
        yColumn={yColumn}
        seriesLength={series.length}
      />
      
      {series.length > 0 && (
        <div className="space-y-3 bg-white dark:bg-gray-900 rounded-lg p-4">
          {series.map((seriesConfig) => (
            <SeriesManagerControls
              key={seriesConfig.id}
              seriesConfig={seriesConfig}
              numericColumns={numericColumns}
              yColumn={yColumn}
              series={series}
              onUpdateColumn={updateSeriesColumn}
              onUpdateType={updateSeriesType}
              onUpdateAggregation={updateSeriesAggregation}
              onUpdateYAxis={updateSeriesYAxis}
              onRemove={removeSeries}
            />
          ))}
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { SeriesManagerHeader } from './series/SeriesManagerHeader';
import { SeriesManagerControls } from './series/SeriesManagerControls';
import { SeriesManagerDebug } from './series/SeriesManagerDebug';
import { SeriesManagerInfo } from './series/SeriesManagerInfo';
import { getAvailableSeriesColumns, canAddNewSeries } from './series/SeriesManagerUtils';
import { logUserInteraction, logger } from '@/lib/logger';

interface SeriesManagerProps {
  series: SeriesConfig[];
  setSeries: (series: SeriesConfig[]) => void;
  numericColumns: ColumnInfo[];
  yColumn: string;
  chartColors: string[];
}

export const SeriesManager = React.memo(({ 
  series, 
  setSeries, 
  numericColumns, 
  yColumn, 
  chartColors 
}: SeriesManagerProps) => {
  
  const availableColumns = React.useMemo(() => 
    getAvailableSeriesColumns(numericColumns, yColumn, series), 
    [numericColumns, yColumn, series]
  );
  const canAddSeries = React.useMemo(() => 
    canAddNewSeries(availableColumns, series.length), 
    [availableColumns, series.length]
  );

  const addSeries = React.useCallback(() => {
    logUserInteraction('add series clicked', {
      canAddSeries,
      availableColumnsCount: availableColumns.length,
      currentSeriesCount: series.length
    }, 'SeriesManager');
    
    if (!canAddSeries) {
      logger.warn('Cannot add series: limit reached or no available columns', null, 'SeriesManager');
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
    
    logUserInteraction('series added', newSeries, 'SeriesManager');
    setSeries([...series, newSeries]);
  }, [canAddSeries, availableColumns, series, chartColors, setSeries]);

  const removeSeries = React.useCallback((id: string) => {
    logUserInteraction('series removed', { id }, 'SeriesManager');
    setSeries(series.filter(s => s.id !== id));
  }, [series, setSeries]);

  const updateSeriesColumn = React.useCallback((id: string, column: string) => {
    logUserInteraction('series column updated', { id, column }, 'SeriesManager');
    setSeries(series.map(s => s.id === id ? { ...s, column } : s));
  }, [series, setSeries]);

  const updateSeriesType = React.useCallback((id: string, type: 'bar' | 'line') => {
    logUserInteraction('series type updated', { id, type }, 'SeriesManager');
    setSeries(series.map(s => s.id === id ? { ...s, type } : s));
  }, [series, setSeries]);

  const updateSeriesAggregation = React.useCallback((id: string, aggregationMethod: AggregationMethod) => {
    logUserInteraction('series aggregation updated', { id, aggregationMethod }, 'SeriesManager');
    setSeries(series.map(s => s.id === id ? { ...s, aggregationMethod } : s));
  }, [series, setSeries]);

  const updateSeriesYAxis = React.useCallback((id: string, yAxisId: string) => {
    logUserInteraction('series Y-axis updated', { id, yAxisId }, 'SeriesManager');
    setSeries(series.map(s => s.id === id ? { ...s, yAxisId } : s));
  }, [series, setSeries]);

  // Only render the container if there are series OR if we can add series
  if (series.length === 0 && !canAddSeries && numericColumns.length <= 1) {
    return null;
  }

  return (
    <div className="mt-4 mb-4">
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
        <div className="space-y-2 bg-white dark:bg-gray-900 rounded-lg p-2">
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
});

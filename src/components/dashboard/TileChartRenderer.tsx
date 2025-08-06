
import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { ChartRenderers } from '../chart/ChartRenderers';
import { getEffectiveSeries } from './utils/seriesUtils';
import { logChartOperation } from '@/lib/logger';
import { TileStackedBarChartRenderer } from './renderers/TileStackedBarChartRenderer';

interface TileChartRendererProps {
  chartType: string;
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  stackColumn?: string;
  
  valueColumn?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  series: SeriesConfig[];
  showDataLabels?: boolean;
  data: DataRow[] | any;
  columns: ColumnInfo[];
  chartColors: string[];
  isMaximized?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const TileChartRenderer = React.memo(({ 
  chartType, 
  xColumn, 
  yColumn, 
  zColumn,
  stackColumn, 
   
  valueColumn, 
  sortColumn, 
  sortDirection, 
  series, 
  showDataLabels, 
  data, 
  columns, 
  chartColors,
  isMaximized,
  xAxisLabel,
  yAxisLabel
}: TileChartRendererProps) => {
  const effectiveSeries = React.useMemo(() => 
    getEffectiveSeries(yColumn, series, chartColors, chartType), 
    [yColumn, series, chartColors, chartType]
  );

  logChartOperation('tile chart render', {
    chartType,
    dataType: typeof data,
    isArray: Array.isArray(data),
    dataLength: Array.isArray(data) ? data.length : 'structured'
  }, 'TileChartRenderer');

  // Handle specialized tile renderers for better performance
  if (chartType === 'stacked-bar') {
    return (
      <div className="w-full h-full">
        <TileStackedBarChartRenderer
          data={data as DataRow[]}
          xColumn={xColumn}
          stackColumn={stackColumn}
          effectiveSeries={effectiveSeries}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
        />
      </div>
    );
  }


  // Use the same ChartRenderers as the main visualization
  return (
    <div className="w-full h-full">
      <ChartRenderers
        chartType={chartType as any}
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        zColumn={zColumn}
        stackColumn={stackColumn}
        
        valueColumn={valueColumn}
        sortColumn={sortColumn || 'none'}
        sortDirection={sortDirection || 'desc'}
        series={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
      />
    </div>
  );
});

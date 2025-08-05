
import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { KPIRenderer } from '../chart/KPIRenderer';
import { getEffectiveSeries } from './utils/seriesUtils';
import { logChartOperation } from '@/lib/logger';
import { TileBarChartRenderer } from './renderers/TileBarChartRenderer';
import { TileLineChartRenderer } from './renderers/TileLineChartRenderer';
import { TileAreaChartRenderer } from './renderers/TileAreaChartRenderer';
import { TilePieChartRenderer } from './renderers/TilePieChartRenderer';
import { TileScatterChartRenderer } from './renderers/TileScatterChartRenderer';
import { TileHeatmapChartRenderer } from './renderers/TileHeatmapChartRenderer';
import { TileHistogramChartRenderer } from './renderers/TileHistogramChartRenderer';
import { TileTreemapChartRenderer } from './renderers/TileTreemapChartRenderer';
import { TileBar3DChartRenderer } from './renderers/TileBar3DChartRenderer';
import { TileScatter3DChartRenderer } from './renderers/TileScatter3DChartRenderer';
import { TileSurface3DChartRenderer } from './renderers/TileSurface3DChartRenderer';
import { TileNetwork3DChartRenderer } from './renderers/TileNetwork3DChartRenderer';

interface TileChartRendererProps {
  chartType: string;
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  stackColumn?: string;
  sankeyTargetColumn?: string;
  valueColumn?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  series: SeriesConfig[];
  showDataLabels?: boolean;
  data: DataRow[] | any;
  columns: ColumnInfo[];
  chartColors: string[];
  isMaximized?: boolean;
}

export const TileChartRenderer = React.memo(({ 
  chartType, 
  xColumn, 
  yColumn, 
  zColumn,
  stackColumn, 
  sankeyTargetColumn, 
  valueColumn, 
  sortColumn, 
  sortDirection, 
  series, 
  showDataLabels, 
  data, 
  columns, 
  chartColors,
  isMaximized 
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

  if (chartType === 'bar') {
    return (
      <TileBarChartRenderer
        data={data}
        xColumn={xColumn}
        stackColumn={stackColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
      />
    );
  }

  if (chartType === 'line') {
    return (
      <TileLineChartRenderer
        data={data}
        xColumn={xColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
      />
    );
  }

  if (chartType === 'area') {
    return (
      <TileAreaChartRenderer
        data={data}
        xColumn={xColumn}
        stackColumn={stackColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
      />
    );
  }

  if (chartType === 'pie') {
    return (
      <TilePieChartRenderer
        data={data}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'scatter') {
    return (
      <TileScatterChartRenderer
        data={data}
        xColumn={xColumn}
        valueColumn={valueColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'heatmap') {
    return (
      <TileHeatmapChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        valueColumn={valueColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'histogram') {
    return (
      <TileHistogramChartRenderer
        data={data}
        xColumn={xColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'treemap') {
    return (
      <TileTreemapChartRenderer
        data={data}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }
  
  if (chartType === 'kpi') {
    return (
      <KPIRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        valueColumn={valueColumn}
        series={effectiveSeries}
        chartColors={chartColors}
      />
    );
  }

  // 3D Charts
  if (chartType === 'bar3d') {
    return (
      <TileBar3DChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        zColumn={zColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        isMaximized={isMaximized}
      />
    );
  }

  if (chartType === 'scatter3d') {
    return (
      <TileScatter3DChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        zColumn={zColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        isMaximized={isMaximized}
      />
    );
  }

  if (chartType === 'surface3d') {
    return (
      <TileSurface3DChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        zColumn={zColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        isMaximized={isMaximized}
      />
    );
  }

  if (chartType === 'network3d') {
    return (
      <TileNetwork3DChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        effectiveSeries={effectiveSeries}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        isMaximized={isMaximized}
      />
    );
  }

  if (chartType === 'map2d') {
    const TileMap2DRenderer = React.lazy(() => 
      import('../chart/renderers/TileMap2DChartRenderer')
        .then(m => ({ default: m.TileMap2DChartRenderer }))
    );
    
    return (
      <React.Suspense fallback={<div className="text-center p-2 text-xs">Loading map...</div>}>
        <TileMap2DRenderer
          data={data}
          xColumn={xColumn}
          yColumn={yColumn}
          seriesColumn={effectiveSeries[0]?.column}
          colors={chartColors}
        />
      </React.Suspense>
    );
  }

  if (chartType === 'map3d') {
    const TileMap2DRenderer = React.lazy(() => 
      import('../chart/renderers/TileMap2DChartRenderer')
        .then(m => ({ default: m.TileMap2DChartRenderer }))
    );
    
    return (
      <React.Suspense fallback={<div className="text-center p-2 text-xs">Loading 3D map...</div>}>
        <div className="relative w-full h-full">
          <TileMap2DRenderer
            data={data}
            xColumn={xColumn}
            yColumn={yColumn}
            seriesColumn={effectiveSeries[0]?.column}
            colors={chartColors}
          />
          <div className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded">
            3D View
          </div>
        </div>
      </React.Suspense>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
      No chart type selected.
    </div>
  );
});

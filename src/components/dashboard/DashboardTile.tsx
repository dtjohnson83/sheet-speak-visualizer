
import React from 'react';
import { Card } from '@/components/ui/card';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useTileInteractions } from './TileInteractionHandlers';
import { TileChartRenderer } from './TileChartRenderer';
import { SeriesConfig } from '@/hooks/useChartState';
import { TileControls } from './TileControls';
import { ResizeHandle } from './ResizeHandle';
import { prepareChartData } from '@/lib/chartDataProcessor';
import { logChartOperation } from '@/lib/logger';

export interface DashboardTileData {
  id: string;
  title: string;
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
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface DashboardTileProps {
  tile: DashboardTileData;
  data: DataRow[];
  columns: ColumnInfo[];
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: { position?: { x: number; y: number }; size?: { width: number; height: number }; title?: string }) => void;
}

export const DashboardTile = React.memo(({ tile, data, columns, onRemove, onUpdate }: DashboardTileProps) => {
  const chartColors = React.useMemo(() => [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff'
  ], []);

  const {
    tileRef,
    isDragging,
    isResizing,
    handleMouseDown,
    handleResizeMouseDown
  } = useTileInteractions({
    tileId: tile.id,
    position: tile.position,
    size: tile.size,
    onUpdate
  });

  const handleTitleChange = React.useCallback((newTitle: string) => {
    if (onUpdate) {
      onUpdate(tile.id, { title: newTitle });
    }
  }, [onUpdate, tile.id]);

  // Process the data using the same pipeline as the main visualization
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    logChartOperation('tile data processing start', {
      tileId: tile.id,
      chartType: tile.chartType,
      dataLength: data.length
    }, 'DashboardTile');

    const result = prepareChartData(
      data,
      columns,
      tile.chartType,
      tile.xColumn,
      tile.yColumn,
      tile.series,
      tile.sortColumn || 'none',
      tile.sortDirection || 'desc',
      tile.stackColumn || '',
      tile.sankeyTargetColumn || '',
      true, // supportsMultipleSeries
      columns.filter(col => col.type === 'numeric'),
      'sum',
      tile.valueColumn
    );

    logChartOperation('tile data processing complete', {
      tileId: tile.id,
      chartType: tile.chartType,
      isArrayResult: Array.isArray(result),
      resultLength: Array.isArray(result) ? result.length : 'structured'
    }, 'DashboardTile');

    return result;
  }, [data, columns, tile]);

  // For structured data charts (like Sankey), pass the data directly
  // For array-based charts, ensure we have an array
  const dataForRenderer = React.useMemo(() => {
    const structuredDataCharts = ['sankey', 'heatmap', 'treemap'];
    if (structuredDataCharts.includes(tile.chartType)) {
      return processedData; // Pass structured data directly
    }
    return Array.isArray(processedData) ? processedData : [];
  }, [processedData, tile.chartType]);

  logChartOperation('tile render data prepared', {
    tileId: tile.id,
    chartType: tile.chartType,
    dataType: typeof dataForRenderer,
    isArray: Array.isArray(dataForRenderer),
    dataLength: Array.isArray(dataForRenderer) ? dataForRenderer.length : 'structured'
  }, 'DashboardTile');

  return (
    <Card 
      ref={tileRef}
      className={`p-3 relative group cursor-move ${isDragging || isResizing ? 'z-50 shadow-2xl' : 'z-10'} select-none`}
      style={{
        position: 'absolute',
        left: tile.position.x,
        top: tile.position.y,
        width: tile.size.width,
        height: tile.size.height,
        userSelect: 'none'
      }}
    >
      <TileControls
        title={tile.title}
        onRemove={() => onRemove(tile.id)}
        onMouseDown={handleMouseDown}
        onTitleChange={handleTitleChange}
      />
      
      <div className="w-full h-[calc(100%-3rem)] overflow-hidden">
        <TileChartRenderer
          chartType={tile.chartType}
          xColumn={tile.xColumn}
          yColumn={tile.yColumn}
          zColumn={tile.zColumn}
          stackColumn={tile.stackColumn}
          sankeyTargetColumn={tile.sankeyTargetColumn}
          valueColumn={tile.valueColumn}
          sortColumn={tile.sortColumn}
          sortDirection={tile.sortDirection}
          series={tile.series}
          showDataLabels={tile.showDataLabels}
          data={dataForRenderer}
          columns={columns}
          chartColors={chartColors}
        />
      </div>

      <ResizeHandle onMouseDown={handleResizeMouseDown} />
    </Card>
  );
});

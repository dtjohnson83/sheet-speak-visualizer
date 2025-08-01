
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useTileInteractions } from './TileInteractionHandlers';
import { TileChartRenderer } from './TileChartRenderer';
import { SeriesConfig } from '@/hooks/useChartState';
import { TileControls } from './TileControls';
import { ResizeHandle } from './ResizeHandle';
import { prepareChartData } from '@/lib/chartDataProcessor';
import { logChartOperation } from '@/lib/logger';
import { autoMapColumns, generateColumnErrorMessage } from './utils/columnMappingUtils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isMaximized, setIsMaximized] = useState(false);
  
  const chartColors = React.useMemo(() => [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff'
  ], []);

  // Detect if this is a 3D chart type
  const is3DChart = React.useMemo(() => {
    return tile.chartType.includes('3d') || tile.chartType === 'network3d';
  }, [tile.chartType]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false);
      }
    };

    if (isMaximized) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMaximized]);

  const handleMaximizeToggle = React.useCallback(() => {
    setIsMaximized(!isMaximized);
  }, [isMaximized]);

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

  // Auto-map columns if they don't exist in the current dataset
  const columnMapping = React.useMemo(() => {
    if (!columns || columns.length === 0) {
      return {
        xColumn: tile.xColumn,
        yColumn: tile.yColumn,
        series: tile.series,
        mapped: false,
        missingColumns: []
      };
    }

    return autoMapColumns(
      tile.xColumn,
      tile.yColumn,
      tile.series,
      columns,
      tile.chartType
    );
  }, [tile.xColumn, tile.yColumn, tile.series, tile.chartType, columns]);

  const handleRemapColumns = React.useCallback(() => {
    if (onUpdate && columnMapping.mapped) {
      onUpdate(tile.id, {
        // We can't directly update tile data structure from here
        // This would require extending the onUpdate interface
        // For now, just refresh by forcing a re-render
      });
    }
  }, [onUpdate, tile.id, columnMapping.mapped]);

  // Process the data using the same pipeline as the main visualization
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    logChartOperation('tile data processing start', {
      tileId: tile.id,
      chartType: tile.chartType,
      dataLength: data.length,
      originalColumns: { x: tile.xColumn, y: tile.yColumn },
      mappedColumns: { x: columnMapping.xColumn, y: columnMapping.yColumn },
      wasMapped: columnMapping.mapped
    }, 'DashboardTile');

    const result = prepareChartData(
      data,
      columns,
      tile.chartType,
      columnMapping.xColumn,
      columnMapping.yColumn,
      columnMapping.series,
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
  }, [data, columns, tile, columnMapping]);

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

  const tileContent = (
    <div className={`w-full overflow-hidden ${is3DChart ? 'h-[calc(100%-2.5rem)]' : 'h-[calc(100%-3rem)]'}`}>
      {/* Show column mapping warning if columns were auto-mapped */}
      {columnMapping.mapped && columnMapping.missingColumns.length > 0 && (
        <Alert className="mb-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-xs">
            <div className="flex items-center justify-between">
              <span className="text-orange-700 dark:text-orange-200">
                Auto-mapped missing columns: {columnMapping.missingColumns.join(', ')}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemapColumns}
                className="h-6 px-2 text-xs border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-800/50"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Fix
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Show error if no data can be displayed */}
      {Array.isArray(dataForRenderer) && dataForRenderer.length === 0 && data.length > 0 && (
        <Alert className="mb-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-xs text-red-700 dark:text-red-200">
            {generateColumnErrorMessage(columnMapping.missingColumns, columns)}
          </AlertDescription>
        </Alert>
      )}

      <TileChartRenderer
        chartType={tile.chartType}
        xColumn={columnMapping.xColumn}
        yColumn={columnMapping.yColumn}
        zColumn={tile.zColumn}
        stackColumn={tile.stackColumn}
        sankeyTargetColumn={tile.sankeyTargetColumn}
        valueColumn={tile.valueColumn}
        sortColumn={tile.sortColumn}
        sortDirection={tile.sortDirection}
        series={columnMapping.series}
        showDataLabels={tile.showDataLabels}
        data={dataForRenderer}
        columns={columns}
        chartColors={chartColors}
        isMaximized={isMaximized}
      />
    </div>
  );

  if (isMaximized) {
    return (
      <>
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMaximized(false)}
        />
        
        {/* Maximized tile */}
        <Card className="fixed inset-4 z-50 p-4 shadow-2xl bg-background border min-h-[600px]">
          <TileControls
            title={tile.title}
            onRemove={() => onRemove(tile.id)}
            onMouseDown={(e) => e.preventDefault()} // Disable drag in maximized mode
            onTitleChange={handleTitleChange}
            is3DChart={is3DChart}
            isMaximized={isMaximized}
            onMaximizeToggle={handleMaximizeToggle}
          />
          
          <div className="w-full h-[calc(100%-3rem)] min-h-[500px] overflow-hidden">
            <TileChartRenderer
              chartType={tile.chartType}
              xColumn={columnMapping.xColumn}
              yColumn={columnMapping.yColumn}
              zColumn={tile.zColumn}
              stackColumn={tile.stackColumn}
              sankeyTargetColumn={tile.sankeyTargetColumn}
              valueColumn={tile.valueColumn}
              sortColumn={tile.sortColumn}
              sortDirection={tile.sortDirection}
              series={columnMapping.series}
              showDataLabels={tile.showDataLabels}
              data={dataForRenderer}
              columns={columns}
              chartColors={chartColors}
              isMaximized={true}
            />
          </div>
        </Card>
      </>
    );
  }

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
        is3DChart={is3DChart}
        isMaximized={isMaximized}
        onMaximizeToggle={handleMaximizeToggle}
      />
      
      {tileContent}

      <ResizeHandle onMouseDown={handleResizeMouseDown} />
    </Card>
  );
});

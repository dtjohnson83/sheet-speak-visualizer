import React from 'react';
import { Card } from '@/components/ui/card';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useTileInteractions } from './TileInteractionHandlers';
import { TileChartRenderer, SeriesConfig } from './TileChartRenderer';
import { TileControls } from './TileControls';
import { ResizeHandle } from './ResizeHandle';

export interface DashboardTileData {
  id: string;
  title: string;
  chartType: string;
  xColumn: string;
  yColumn: string;
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

export const DashboardTile = ({ tile, data, columns, onRemove, onUpdate }: DashboardTileProps) => {
  const chartColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff'
  ];

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

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) {
      onUpdate(tile.id, { title: newTitle });
    }
  };

  return (
    <Card 
      ref={tileRef}
      className={`p-4 relative group cursor-move ${isDragging || isResizing ? 'z-50 shadow-2xl' : 'z-10'} select-none`}
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
      
      <div className="w-full h-[calc(100%-2rem)] overflow-hidden">
        <TileChartRenderer
          chartType={tile.chartType}
          xColumn={tile.xColumn}
          yColumn={tile.yColumn}
          stackColumn={tile.stackColumn}
          sankeyTargetColumn={tile.sankeyTargetColumn}
          valueColumn={tile.valueColumn}
          sortColumn={tile.sortColumn}
          sortDirection={tile.sortDirection}
          series={tile.series}
          showDataLabels={tile.showDataLabels}
          data={data}
          columns={columns}
          chartColors={chartColors}
        />
      </div>

      <ResizeHandle onMouseDown={handleResizeMouseDown} />
    </Card>
  );
};

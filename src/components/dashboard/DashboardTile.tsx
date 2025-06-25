
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Move } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import {
  BarChartRenderer,
  LineChartRenderer,
  PieChartRenderer,
  ScatterChartRenderer,
  TreemapRenderer,
  StackedBarRenderer,
  HeatmapRenderer,
  SankeyRenderer
} from '../chart/ChartRenderers';
import { prepareChartData } from '@/lib/chartDataProcessor';
import { SankeyData } from '@/lib/chartDataUtils';

export interface DashboardTileData {
  id: string;
  title: string;
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  sankeyTargetColumn?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  series: Array<{ id: string; column: string; color: string }>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface DashboardTileProps {
  tile: DashboardTileData;
  data: DataRow[];
  columns: ColumnInfo[];
  onRemove: (id: string) => void;
  onMove?: (id: string, position: { x: number; y: number }) => void;
}

export const DashboardTile = ({ tile, data, columns, onRemove, onMove }: DashboardTileProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const tileRef = useRef<HTMLDivElement>(null);

  const numericColumns = columns.filter(col => col.type === 'numeric');
  const chartColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff'
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onMove) return;
    
    setIsDragging(true);
    const rect = tileRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !onMove) return;
    
    const parentRect = tileRef.current?.parentElement?.getBoundingClientRect();
    if (parentRect) {
      const newX = Math.max(0, e.clientX - parentRect.left - dragOffset.x);
      const newY = Math.max(0, e.clientY - parentRect.top - dragOffset.y);
      
      onMove(tile.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners when dragging starts
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, onMove, tile.id]);

  const chartData = prepareChartData(
    data,
    columns,
    tile.chartType as any,
    tile.xColumn,
    tile.yColumn,
    tile.series,
    tile.sortColumn || 'none',
    tile.sortDirection || 'desc',
    tile.stackColumn,
    tile.sankeyTargetColumn,
    ['bar', 'line', 'scatter'].includes(tile.chartType),
    numericColumns
  );

  const renderChart = () => {
    if (!tile.xColumn || !tile.yColumn || (Array.isArray(chartData) && chartData.length === 0)) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>No data to display</p>
        </div>
      );
    }

    const commonProps = {
      data: chartData as DataRow[],
      xColumn: tile.xColumn,
      yColumn: tile.yColumn,
      series: tile.series,
      chartColors
    };

    switch (tile.chartType) {
      case 'heatmap':
        return <HeatmapRenderer data={chartData as Array<{ x: string; y: string; value: number }>} />;
      case 'stacked-bar':
        return <StackedBarRenderer {...commonProps} stackColumn={tile.stackColumn} originalData={data} />;
      case 'treemap':
        return <TreemapRenderer data={chartData as DataRow[]} chartColors={chartColors} />;
      case 'sankey':
        return <SankeyRenderer data={chartData as SankeyData} />;
      case 'bar':
        return <BarChartRenderer {...commonProps} />;
      case 'line':
        return <LineChartRenderer {...commonProps} />;
      case 'pie':
        return <PieChartRenderer data={chartData as DataRow[]} chartColors={chartColors} />;
      case 'scatter':
        return <ScatterChartRenderer {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Card 
      ref={tileRef}
      className={`p-4 relative group cursor-move ${isDragging ? 'z-50 shadow-2xl' : 'z-10'}`}
      style={{
        position: 'absolute',
        left: tile.position.x,
        top: tile.position.y,
        width: tile.size.width,
        height: tile.size.height,
        userSelect: 'none'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium truncate">{tile.title}</h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={handleMouseDown}
            className="h-6 w-6 p-0 cursor-move"
          >
            <Move className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(tile.id)}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="w-full h-[calc(100%-2rem)] overflow-hidden">
        {renderChart()}
      </div>
    </Card>
  );
};

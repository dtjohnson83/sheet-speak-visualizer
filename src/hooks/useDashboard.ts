
import { useState } from 'react';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';

export const useDashboard = () => {
  const [tiles, setTiles] = useState<DashboardTileData[]>([]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  const addTile = (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => {
    console.log('useDashboard - addTile - Received tile data:', {
      chartType: tileData.chartType,
      sankeyTargetColumn: tileData.sankeyTargetColumn,
      valueColumn: tileData.valueColumn,
      fullTileData: tileData
    });

    const tileWidth = 400;
    const tileHeight = 300;
    const tilesPerRow = 2;
    const horizontalGap = 20;
    const verticalGap = 20;
    
    const tileIndex = tiles.length;
    const row = Math.floor(tileIndex / tilesPerRow);
    const col = tileIndex % tilesPerRow;
    
    const x = col * (tileWidth + horizontalGap);
    const y = row * (tileHeight + verticalGap);
    
    const newTile: DashboardTileData = {
      ...tileData,
      id: Math.random().toString(36).substr(2, 9),
      position: { x, y },
      size: { width: tileWidth, height: tileHeight }
    };

    console.log('useDashboard - addTile - Created new tile:', {
      id: newTile.id,
      chartType: newTile.chartType,
      sankeyTargetColumn: newTile.sankeyTargetColumn,
      valueColumn: newTile.valueColumn,
      fullNewTile: newTile
    });
    
    setTiles(prev => [...prev, newTile]);
  };

  const removeTile = (id: string) => {
    setTiles(prev => prev.filter(tile => tile.id !== id));
  };

  const updateTile = (id: string, updates: { position?: { x: number; y: number }; size?: { width: number; height: number }; title?: string }) => {
    setTiles(prev => prev.map(tile => 
      tile.id === id ? { 
        ...tile, 
        ...(updates.position && { position: updates.position }),
        ...(updates.size && { size: updates.size }),
        ...(updates.title && { title: updates.title })
      } : tile
    ));
  };

  return {
    tiles,
    addTile,
    removeTile,
    updateTile,
    filters,
    setFilters
  };
};

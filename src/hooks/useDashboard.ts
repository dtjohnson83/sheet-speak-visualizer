
import { useState } from 'react';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const useDashboard = () => {
  const [tiles, setTiles] = useState<DashboardTileData[]>([]);

  const addTile = (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => {
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
    
    setTiles(prev => [...prev, newTile]);
  };

  const removeTile = (id: string) => {
    setTiles(prev => prev.filter(tile => tile.id !== id));
  };

  const moveTile = (id: string, position: { x: number; y: number }) => {
    setTiles(prev => prev.map(tile => 
      tile.id === id ? { ...tile, position } : tile
    ));
  };

  return {
    tiles,
    addTile,
    removeTile,
    moveTile
  };
};

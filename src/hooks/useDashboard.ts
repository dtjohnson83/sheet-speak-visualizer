
import { useState } from 'react';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const useDashboard = () => {
  const [tiles, setTiles] = useState<DashboardTileData[]>([]);

  const addTile = (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => {
    const newTile: DashboardTileData = {
      ...tileData,
      id: Math.random().toString(36).substr(2, 9),
      position: { 
        x: Math.random() * 200, 
        y: Math.random() * 100 
      },
      size: { width: 400, height: 300 }
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

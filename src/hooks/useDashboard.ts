
import { useState, useEffect } from 'react';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';
import { supabase } from '@/integrations/supabase/client';

export const useDashboard = () => {
  const [tiles, setTiles] = useState<DashboardTileData[]>([]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Enable real-time updates for dashboard tiles
  useEffect(() => {
    if (!realtimeEnabled) return;

    const channel = supabase
      .channel('dashboard-updates')
      .on('broadcast', { event: 'tile-update' }, (payload: any) => {
        console.log('Received tile update:', payload);
        // Handle real-time tile updates
        if (payload.type === 'refresh') {
          // Trigger tile refresh
          setTiles(prev => prev.map(tile => ({ ...tile, lastUpdated: new Date() })));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtimeEnabled]);

  const addTile = (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => {
    console.log('useDashboard - addTile - Received tile data:', {
      chartType: tileData.chartType,
      
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
      
      valueColumn: newTile.valueColumn,
      fullNewTile: newTile
    });
    
    setTiles(prev => [...prev, newTile]);
  };

  const removeTile = (id: string) => {
    setTiles(prev => prev.filter(tile => tile.id !== id));
  };

  const updateTile = (id: string, updates: { position?: { x: number; y: number }; size?: { width: number; height: number }; title?: string; minimized?: boolean }) => {
    setTiles(prev => prev.map(tile => 
      tile.id === id ? { 
        ...tile, 
        ...(updates.position && { position: updates.position }),
        ...(updates.size && { size: updates.size }),
        ...(updates.title && { title: updates.title }),
        ...(updates.minimized !== undefined && { minimized: updates.minimized })
      } : tile
    ));
  };

  const enableRealtime = () => setRealtimeEnabled(true);
  const disableRealtime = () => setRealtimeEnabled(false);

  const broadcastUpdate = (event: string, data: any) => {
    if (realtimeEnabled) {
      const channel = supabase.channel('dashboard-updates');
      channel.send({
        type: 'broadcast',
        event: 'tile-update',
        payload: { type: event, data }
      });
    }
  };

  return {
    tiles,
    addTile,
    removeTile,
    updateTile,
    filters,
    setFilters,
    realtimeEnabled,
    enableRealtime,
    disableRealtime,
    broadcastUpdate
  };
};

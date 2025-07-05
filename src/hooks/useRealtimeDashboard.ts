import { useState, useEffect, useCallback } from 'react';
import { useRealtimeData } from './useRealtimeData';
import { useDashboard } from './useDashboard';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface RealtimeDashboardConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  enableNotifications: boolean;
  dataSourceId?: string;
}

export const useRealtimeDashboard = () => {
  const { tiles, addTile, removeTile, updateTile, filters, setFilters } = useDashboard();
  const { sources, latestUpdates, isSupabaseConnected } = useRealtimeData();
  const [config, setConfig] = useState<RealtimeDashboardConfig>({
    autoRefresh: true,
    refreshInterval: 30000,
    enableNotifications: false
  });
  const [currentData, setCurrentData] = useState<DataRow[]>([]);
  const [currentColumns, setCurrentColumns] = useState<ColumnInfo[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Monitor data updates and refresh tiles
  useEffect(() => {
    if (!config.autoRefresh || !config.dataSourceId) return;

    const latestUpdate = latestUpdates[config.dataSourceId];
    if (latestUpdate && latestUpdate.timestamp > (lastUpdateTime || new Date(0))) {
      setCurrentData(latestUpdate.data);
      if (latestUpdate.columns) {
        setCurrentColumns(latestUpdate.columns);
      }
      setLastUpdateTime(latestUpdate.timestamp);

      // Show notification if enabled
      if (config.enableNotifications && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Dashboard Updated', {
            body: `New data received from ${sources.find(s => s.id === config.dataSourceId)?.name}`,
            icon: '/favicon.ico'
          });
        }
      }
    }
  }, [latestUpdates, config, lastUpdateTime, sources]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  const updateConfig = useCallback((newConfig: Partial<RealtimeDashboardConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const connectToDataSource = useCallback((sourceId: string) => {
    updateConfig({ dataSourceId: sourceId });
    
    // Get initial data if available
    const latestUpdate = latestUpdates[sourceId];
    if (latestUpdate) {
      setCurrentData(latestUpdate.data);
      if (latestUpdate.columns) {
        setCurrentColumns(latestUpdate.columns);
      }
      setLastUpdateTime(latestUpdate.timestamp);
    }
  }, [latestUpdates, updateConfig]);

  const disconnectDataSource = useCallback(() => {
    updateConfig({ dataSourceId: undefined });
    setCurrentData([]);
    setCurrentColumns([]);
    setLastUpdateTime(null);
  }, [updateConfig]);

  // Enhanced tile management with real-time data
  const addRealtimeTile = useCallback((tileData: any) => {
    const enhancedTileData = {
      ...tileData,
      isRealtime: !!config.dataSourceId,
      dataSourceId: config.dataSourceId
    };
    addTile(enhancedTileData);
  }, [addTile, config.dataSourceId]);

  return {
    // Dashboard state
    tiles,
    filters,
    setFilters,
    currentData,
    currentColumns,
    lastUpdateTime,
    
    // Real-time configuration
    config,
    updateConfig,
    isConnected: isSupabaseConnected,
    
    // Data source management
    availableSources: sources,
    connectToDataSource,
    disconnectDataSource,
    
    // Tile management
    addTile: addRealtimeTile,
    removeTile,
    updateTile,
    
    // Notification management
    requestNotificationPermission
  };
};
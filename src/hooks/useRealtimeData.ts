import { useCallback } from 'react';
import { RealtimeDataSource, RealtimeDataUpdate } from '@/types/realtime';
import { useRealtimeSourceManager } from './realtime/useRealtimeSourceManager';
import { useRealtimeDataFetcher } from './realtime/useRealtimeDataFetcher';
import { useSupabaseRealtimeSync } from './realtime/useSupabaseRealtimeSync';

// Re-export types for backward compatibility
export type { RealtimeDataSource, RealtimeDataUpdate } from '@/types/realtime';

export const useRealtimeData = () => {
  // Use the refactored hooks
  const { 
    sources, 
    testConnection, 
    addSource, 
    removeSource, 
    updateSourceStatus 
  } = useRealtimeSourceManager();
  
  const { 
    latestUpdates, 
    setupApiPolling, 
    setupWebSocketConnection, 
    refreshSource, 
    getLatestData, 
    cleanupSource 
  } = useRealtimeDataFetcher(sources, updateSourceStatus);
  
  const { 
    isSupabaseConnected, 
    supabaseUpdates 
  } = useSupabaseRealtimeSync();

  // Merge API/WebSocket updates with Supabase updates
  const allUpdates = new Map([...latestUpdates, ...supabaseUpdates]);

  // Add a new realtime data source
  const addRealtimeSource = useCallback(async (sourceData: Omit<RealtimeDataSource, 'id' | 'connectionStatus'>) => {
    const sourceId = addSource(sourceData);
    
    // Test connection immediately
    const connectionSuccessful = await testConnection(sourceId);

    // Set up data fetching based on source type
    if (sourceData.type === 'external_api' && sourceData.refreshInterval && connectionSuccessful) {
      const source = { ...sourceData, id: sourceId, connectionStatus: 'connected' as const };
      await setupApiPolling(source);
    } else if (sourceData.type === 'websocket') {
      const source = { ...sourceData, id: sourceId, connectionStatus: 'testing' as const };
      setupWebSocketConnection(source);
    }

    return sourceId;
  }, [addSource, testConnection, setupApiPolling, setupWebSocketConnection]);

  // Remove a realtime data source
  const removeRealtimeSource = useCallback((sourceId: string) => {
    cleanupSource(sourceId);
    removeSource(sourceId);
  }, [cleanupSource, removeSource]);

  return {
    sources,
    isSupabaseConnected,
    latestUpdates: Object.fromEntries(allUpdates),
    addRealtimeSource,
    removeRealtimeSource,
    getLatestData,
    testConnection,
    refreshSource
  };
};
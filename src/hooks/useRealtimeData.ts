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

  // Debug the data before merging
  console.log('🔍 Data before merge:', {
    latestUpdatesSize: latestUpdates.size,
    latestUpdatesKeys: Array.from(latestUpdates.keys()),
    latestUpdatesEntries: Array.from(latestUpdates.entries()).map(([key, value]) => ({
      key,
      hasData: !!value?.data,
      dataLength: value?.data?.length || 0,
      timestamp: value?.timestamp
    })),
    supabaseUpdatesSize: supabaseUpdates.size,
    supabaseUpdatesKeys: Array.from(supabaseUpdates.keys()),
    supabaseUpdatesEntries: Array.from(supabaseUpdates.entries()).map(([key, value]) => ({
      key,
      hasData: !!value?.data,
      dataLength: value?.data?.length || 0,
      timestamp: value?.timestamp
    }))
  });

  // Merge API/WebSocket updates with Supabase updates - Create new Map properly
  const allUpdates = new Map();
  
  // Add all entries from latestUpdates
  for (const [key, value] of latestUpdates.entries()) {
    console.log('🔄 Adding latestUpdate entry:', key, {
      hasData: !!value?.data,
      dataLength: value?.data?.length || 0
    });
    allUpdates.set(key, value);
  }
  
  // Add all entries from supabaseUpdates (will overwrite if same key)
  for (const [key, value] of supabaseUpdates.entries()) {
    console.log('🔄 Adding supabaseUpdate entry:', key, {
      hasData: !!value?.data,
      dataLength: value?.data?.length || 0
    });
    allUpdates.set(key, value);
  }
  
  console.log('🔍 Data after merge:', {
    allUpdatesSize: allUpdates.size,
    allUpdatesKeys: Array.from(allUpdates.keys()),
    allUpdatesEntries: Array.from(allUpdates.entries()).map(([key, value]) => ({
      key,
      hasData: !!value?.data,
      dataLength: value?.data?.length || 0,
      timestamp: value?.timestamp
    }))
  });

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

  // Get latest data for a source - Simplified access
  const getLatestDataForSource = useCallback((sourceId: string) => {
    const data = allUpdates.get(sourceId);
    
    console.log('🔍 getLatestData called for source:', sourceId, {
      hasData: !!data,
      dataLength: data?.data?.length || 0,
      allUpdatesSize: allUpdates.size,
      availableKeys: Array.from(allUpdates.keys()),
      requestedKey: sourceId
    });
    
    return data;
  }, [allUpdates]);

  return {
    sources,
    isSupabaseConnected,
    latestUpdates: Object.fromEntries(allUpdates),
    addRealtimeSource,
    removeRealtimeSource,
    getLatestData: getLatestDataForSource,
    testConnection,
    refreshSource
  };
};
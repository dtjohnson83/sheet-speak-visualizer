import { useCallback, useEffect, useRef } from 'react';
import { RealtimeDataSource, RealtimeDataUpdate } from '@/types/realtime';
import { useRealtimeSourceManager } from './realtime/useRealtimeSourceManager';
import { useRealtimeDataFetcher } from './realtime/useRealtimeDataFetcher';
import { useSupabaseRealtimeSync } from './realtime/useSupabaseRealtimeSync';
import { useSecureSessionManager } from './useSecureSessionManager';
import { logger } from '@/lib/logger';

// Re-export types for backward compatibility
export type { RealtimeDataSource, RealtimeDataUpdate } from '@/types/realtime';

export const useRealtimeData = () => {
  const sessionManager = useSecureSessionManager();
  const cleanupExecuted = useRef(false);

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

  // Set up cleanup for all realtime connections
  useEffect(() => {
    const cleanup = () => {
      if (cleanupExecuted.current) return;
      cleanupExecuted.current = true;
      
      logger.info('Cleaning up realtime connections', { sourceCount: sources.length });
      
      // Clean up all sources
      sources.forEach(source => {
        try {
          cleanupSource(source.id);
        } catch (error) {
          logger.error('Error cleaning up realtime source', { 
            sourceId: source.id, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      });
    };

    sessionManager.addCleanupFunction(cleanup);
    
    return cleanup;
  }, [sources, cleanupSource, sessionManager]);

  // Optimized debug logging to reduce console spam
  const debugLogThrottled = useRef<{ [key: string]: number }>({});
  
  const shouldLog = (key: string) => {
    const now = Date.now();
    const lastLog = debugLogThrottled.current[key] || 0;
    if (now - lastLog > 5000) { // Log every 5 seconds max
      debugLogThrottled.current[key] = now;
      return true;
    }
    return false;
  };

  if (shouldLog('dataDebug')) {
    logger.debug('Realtime data state', {
      latestUpdatesSize: latestUpdates.size,
      latestUpdatesKeys: Array.from(latestUpdates.keys()),
      supabaseUpdatesSize: supabaseUpdates.size,
      supabaseUpdatesKeys: Array.from(supabaseUpdates.keys())
    });
  }

  // Merge API/WebSocket updates with Supabase updates efficiently
  const allUpdates = new Map();
  
  // Add all entries from latestUpdates
  for (const [key, value] of latestUpdates.entries()) {
    allUpdates.set(key, value);
  }
  
  // Add all entries from supabaseUpdates (will overwrite if same key)
  for (const [key, value] of supabaseUpdates.entries()) {
    allUpdates.set(key, value);
  }
  
  if (shouldLog('mergeDebug')) {
    logger.debug('Realtime data merge complete', {
      allUpdatesSize: allUpdates.size,
      allUpdatesKeys: Array.from(allUpdates.keys())
    });
  }

  // Add a new realtime data source with improved error handling
  const addRealtimeSource = useCallback(async (sourceData: Omit<RealtimeDataSource, 'id' | 'connectionStatus'>) => {
    try {
      logger.info('Adding realtime source', {
        type: sourceData.type,
        name: sourceData.name,
        hasRefreshInterval: !!sourceData.refreshInterval,
        url: sourceData.config?.url
      });
      
      const sourceId = addSource(sourceData);
      
      // Test connection immediately
      const connectionSuccessful = await testConnection(sourceId);
      logger.info('Connection test completed', { sourceId, connectionSuccessful });

      // Set up data fetching based on source type
      if (sourceData.type === 'external_api' && sourceData.refreshInterval && connectionSuccessful) {
        const source = { ...sourceData, id: sourceId, connectionStatus: 'connected' as const };
        await setupApiPolling(source);
        logger.info('API polling setup complete', { sourceId });
      } else if (sourceData.type === 'websocket') {
        const source = { ...sourceData, id: sourceId, connectionStatus: 'testing' as const };
        setupWebSocketConnection(source);
        logger.info('WebSocket setup complete', { sourceId });
      } else {
        logger.warn('Skipping data fetching setup', {
          sourceId,
          type: sourceData.type,
          hasRefreshInterval: !!sourceData.refreshInterval,
          connectionSuccessful
        });
      }

      return sourceId;
    } catch (error) {
      logger.error('Failed to add realtime source', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sourceData: { type: sourceData.type, name: sourceData.name }
      });
      throw error;
    }
  }, [addSource, testConnection, setupApiPolling, setupWebSocketConnection]);

  // Remove a realtime data source with proper cleanup
  const removeRealtimeSource = useCallback((sourceId: string) => {
    try {
      logger.info('Removing realtime source', { sourceId });
      cleanupSource(sourceId);
      removeSource(sourceId);
    } catch (error) {
      logger.error('Failed to remove realtime source', {
        sourceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [cleanupSource, removeSource]);

  // Get latest data for a source with improved error handling
  const getLatestDataForSource = useCallback((sourceId: string) => {
    try {
      const updatesObject = Object.fromEntries(allUpdates);
      const data = updatesObject[sourceId];
      
      if (shouldLog(`getData-${sourceId}`)) {
        logger.debug('Retrieved data for source', {
          sourceId,
          hasData: !!data,
          dataLength: data?.data?.length || 0,
          allUpdatesSize: allUpdates.size
        });
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to get latest data', {
        sourceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return undefined;
    }
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
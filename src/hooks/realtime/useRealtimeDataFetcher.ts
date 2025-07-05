import { useState, useCallback, useRef, useEffect } from 'react';
import { RealtimeDataSource, RealtimeDataUpdate } from '@/types/realtime';
import { transformApiResponseData } from '@/lib/realtime/dataTransformers';

export const useRealtimeDataFetcher = (
  sources: RealtimeDataSource[],
  updateSourceStatus: (sourceId: string, updates: Partial<RealtimeDataSource>) => void
) => {
  const [activeConnections, setActiveConnections] = useState<Map<string, any>>(new Map());
  const [latestUpdates, setLatestUpdates] = useState<Map<string, RealtimeDataUpdate>>(new Map());
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Set up API polling for a source
  const setupApiPolling = useCallback(async (source: RealtimeDataSource) => {
    console.log('🚀 Setting up API polling for source:', source.id, {
      type: source.type,
      hasRefreshInterval: !!source.refreshInterval,
      url: source.config.url
    });
    
    if (source.type !== 'external_api' || !source.refreshInterval) {
      console.log('❌ Skipping API polling setup - wrong type or no interval');
      return;
    }

    const fetchData = async () => {
      console.log('📡 Fetching data for source:', source.id, 'from:', source.config.url);
      try {
        // Fetch data from external API
        const response = await fetch(source.config.url, {
          method: source.config.method || 'GET',
          headers: {
            'Accept': 'application/json',
            ...source.config.headers
          },
        });
        
        console.log('📡 Response received:', {
          sourceId: source.id,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });
        
        if (response.ok) {
          const rawData = await response.json();
          console.log('📡 Raw data received:', {
            sourceId: source.id,
            rawDataType: typeof rawData,
            rawDataKeys: Array.isArray(rawData) ? 'array' : Object.keys(rawData || {})
          });
          
          const transformedData = transformApiResponseData(rawData);
          console.log('🔄 Data transformed:', {
            sourceId: source.id,
            transformedLength: transformedData.length,
            sampleTransformed: transformedData.slice(0, 2)
          });

          const update: RealtimeDataUpdate = {
            sourceId: source.id,
            data: transformedData,
            timestamp: new Date()
          };
          
          console.log('💾 About to store update in Map:', {
            sourceId: source.id,
            updateHasData: !!update.data,
            updateDataLength: update.data.length,
            timestamp: update.timestamp
          });
          
          // Store the update and verify it was stored
          setLatestUpdates(prev => {
            const newMap = new Map(prev);
            newMap.set(source.id, update);
            console.log('💾 Update stored. New Map state:', {
              mapSize: newMap.size,
              keys: Array.from(newMap.keys()),
              sourceExists: newMap.has(source.id),
              sourceDataLength: newMap.get(source.id)?.data?.length || 0
            });
            return newMap;
          });
          
          // Update last updated time
          updateSourceStatus(source.id, { 
            lastUpdated: new Date(), 
            connectionStatus: 'connected' 
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('❌ Failed to fetch realtime data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
        updateSourceStatus(source.id, { 
          connectionStatus: 'error', 
          errorMessage 
        });
      }
    };

    // Initial fetch
    console.log('🎯 Starting initial fetch for source:', source.id);
    await fetchData();

    // Set up interval
    console.log('⏰ Setting up interval for source:', source.id, 'every', source.refreshInterval, 'ms');
    const interval = setInterval(fetchData, source.refreshInterval);
    intervalsRef.current.set(source.id, interval);
  }, [updateSourceStatus]);

  // Set up WebSocket connection for a source
  const setupWebSocketConnection = useCallback((source: RealtimeDataSource) => {
    if (source.type !== 'websocket') return;

    const ws = new WebSocket(source.config.url);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const update: RealtimeDataUpdate = {
          sourceId: source.id,
          data: Array.isArray(data) ? data : [data],
          timestamp: new Date()
        };
        
        setLatestUpdates(prev => new Map(prev.set(source.id, update)));
      } catch (error) {
        console.error('Failed to parse WebSocket data:', error);
      }
    };

    ws.onopen = () => {
      console.log('WebSocket connected:', source.config.url);
      updateSourceStatus(source.id, { connectionStatus: 'connected' });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      updateSourceStatus(source.id, { 
        connectionStatus: 'error', 
        errorMessage: 'WebSocket connection failed' 
      });
    };

    setActiveConnections(prev => new Map(prev.set(source.id, ws)));
  }, [updateSourceStatus]);

  // Manual refresh for a specific source
  const refreshSource = useCallback(async (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source || source.type !== 'external_api') return;

    updateSourceStatus(sourceId, { connectionStatus: 'testing' });

    try {
      const response = await fetch(source.config.url, {
        method: source.config.method || 'GET',
        headers: {
          'Accept': 'application/json',
          ...source.config.headers
        },
      });
      
      if (response.ok) {
        const rawData = await response.json();
        const transformedData = transformApiResponseData(rawData);

        const update: RealtimeDataUpdate = {
          sourceId,
          data: transformedData,
          timestamp: new Date()
        };
        
        console.log('🔄 Manual refresh - storing update:', {
          sourceId,
          dataLength: transformedData.length,
          sampleData: transformedData.slice(0, 2)
        });
        
        setLatestUpdates(prev => new Map(prev.set(sourceId, update)));
        
        updateSourceStatus(sourceId, { 
          lastUpdated: new Date(), 
          connectionStatus: 'connected' 
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      updateSourceStatus(sourceId, { 
        connectionStatus: 'error', 
        errorMessage 
      });
    }
  }, [sources, updateSourceStatus]);

  // Get latest data for a source
  const getLatestData = useCallback((sourceId: string) => {
    const data = latestUpdates.get(sourceId);
    console.log('🔍 getLatestData called for source:', sourceId, {
      hasData: !!data,
      dataLength: data?.data?.length || 0,
      mapSize: latestUpdates.size,
      availableKeys: Array.from(latestUpdates.keys())
    });
    return data;
  }, [latestUpdates]);

  // Clean up connections for a specific source
  const cleanupSource = useCallback((sourceId: string) => {
    // Clean up intervals
    const interval = intervalsRef.current.get(sourceId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(sourceId);
    }

    // Clean up WebSocket connections
    const connection = activeConnections.get(sourceId);
    if (connection && connection.close) {
      connection.close();
    }
    setActiveConnections(prev => {
      const newMap = new Map(prev);
      newMap.delete(sourceId);
      return newMap;
    });

    // Remove latest update
    setLatestUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(sourceId);
      return newMap;
    });
  }, [activeConnections]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear all intervals
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();

      // Close all WebSocket connections
      activeConnections.forEach(connection => {
        if (connection && connection.close) {
          connection.close();
        }
      });
    };
  }, [activeConnections]);

  return {
    latestUpdates,
    setupApiPolling,
    setupWebSocketConnection,
    refreshSource,
    getLatestData,
    cleanupSource
  };
};
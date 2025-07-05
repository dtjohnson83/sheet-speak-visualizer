import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeDataSource {
  id: string;
  type: 'dataset' | 'external_api' | 'websocket';
  name: string;
  config: any;
  refreshInterval?: number; // in milliseconds
  lastUpdated?: Date;
  connectionStatus: 'connected' | 'disconnected' | 'testing' | 'error';
  errorMessage?: string;
}

export interface RealtimeDataUpdate {
  sourceId: string;
  data: DataRow[];
  columns?: ColumnInfo[];
  timestamp: Date;
}

const STORAGE_KEY = 'lovable-realtime-sources';

export const useRealtimeData = () => {
  const [sources, setSources] = useState<RealtimeDataSource[]>([]);
  const [activeConnections, setActiveConnections] = useState<Map<string, any>>(new Map());
  const [latestUpdates, setLatestUpdates] = useState<Map<string, RealtimeDataUpdate>>(new Map());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load sources from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSources = JSON.parse(stored).map((source: any) => ({
          ...source,
          connectionStatus: 'disconnected' as const,
          lastUpdated: source.lastUpdated ? new Date(source.lastUpdated) : undefined
        }));
        setSources(parsedSources);
      } catch (error) {
        console.error('Failed to load stored realtime sources:', error);
      }
    }
  }, []);

  // Save sources to localStorage whenever sources change
  useEffect(() => {
    if (sources.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    }
  }, [sources]);

  // Subscribe to dataset changes in Supabase
  useEffect(() => {
    const channel = supabase
      .channel('dataset-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'saved_datasets'
        },
        (payload) => {
          console.log('Dataset updated:', payload);
          const update: RealtimeDataUpdate = {
            sourceId: payload.new.id,
            data: payload.new.data as DataRow[],
            columns: payload.new.columns as ColumnInfo[],
            timestamp: new Date()
          };
          
          setLatestUpdates(prev => new Map(prev.set(payload.new.id, update)));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'saved_datasets'
        },
        (payload) => {
          console.log('New dataset added:', payload);
          const update: RealtimeDataUpdate = {
            sourceId: payload.new.id,
            data: payload.new.data as DataRow[],
            columns: payload.new.columns as ColumnInfo[],
            timestamp: new Date()
          };
          
          setLatestUpdates(prev => new Map(prev.set(payload.new.id, update)));
        }
      )
      .subscribe((status) => {
        console.log('Realtime connection status:', status);
        setIsSupabaseConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  // Test connection to an API source
  const testConnection = useCallback(async (sourceId: string): Promise<boolean> => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return false;

    // Update status to testing
    setSources(prev => prev.map(s => 
      s.id === sourceId 
        ? { ...s, connectionStatus: 'testing', errorMessage: undefined }
        : s
    ));

    try {
      const response = await fetch(source.config.url, {
        method: source.config.method || 'GET',
        headers: source.config.headers || {},
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const success = response.ok;
      
      setSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { 
              ...s, 
              connectionStatus: success ? 'connected' : 'error',
              errorMessage: success ? undefined : `HTTP ${response.status}: ${response.statusText}`
            }
          : s
      ));

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, connectionStatus: 'error', errorMessage }
          : s
      ));
      return false;
    }
  }, [sources]);

  // Add a new realtime data source
  const addRealtimeSource = useCallback(async (source: Omit<RealtimeDataSource, 'id' | 'connectionStatus'>) => {
    const newSource: RealtimeDataSource = {
      ...source,
      id: Math.random().toString(36).substr(2, 9),
      connectionStatus: 'testing'
    };

    setSources(prev => [...prev, newSource]);

    // Test connection immediately
    const connectionSuccessful = await testConnection(newSource.id);

    // Set up polling for external APIs only if connection was successful  
    if (source.type === 'external_api' && source.refreshInterval && connectionSuccessful) {
      const fetchData = async () => {
        try {
          // Fetch data from external API
          const response = await fetch(source.config.url, {
            method: source.config.method || 'GET',
            headers: {
              'Accept': 'application/json',
              ...source.config.headers
            },
          });
          
          if (response.ok) {
            const rawData = await response.json();
            
            // Transform data based on API response format
            let transformedData = [];
            
            // Handle World Bank API format
            if (Array.isArray(rawData) && rawData.length > 1 && rawData[1] && Array.isArray(rawData[1])) {
              transformedData = rawData[1].map((item: any) => ({
                country: item.country?.value || 'Unknown',
                indicator: item.indicator?.value || 'Unknown',
                value: item.value,
                date: item.date,
                ...item
              }));
            }
            // Handle CoinGecko and generic object responses
            else if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
              // Convert object to array of key-value pairs
              transformedData = Object.entries(rawData).map(([key, value]) => ({
                key,
                value,
                ...typeof value === 'object' ? value as any : {}
              }));
            }
            // Handle direct array responses
            else if (Array.isArray(rawData)) {
              transformedData = rawData;
            }
            // Handle single object responses
            else {
              transformedData = [rawData];
            }

            const update: RealtimeDataUpdate = {
              sourceId: newSource.id,
              data: transformedData,
              timestamp: new Date()
            };
            
            console.log('💾 Storing realtime update:', {
              sourceId: newSource.id,
              dataLength: transformedData.length,
              sampleData: transformedData.slice(0, 2)
            });
            
            setLatestUpdates(prev => new Map(prev.set(newSource.id, update)));
            
            // Update last updated time
            setSources(prev => prev.map(s => 
              s.id === newSource.id 
                ? { ...s, lastUpdated: new Date(), connectionStatus: 'connected' }
                : s
            ));
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Failed to fetch realtime data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
          setSources(prev => prev.map(s => 
            s.id === newSource.id 
              ? { ...s, connectionStatus: 'error', errorMessage }
              : s
          ));
        }
      };

      // Initial fetch
      await fetchData();

      const interval = setInterval(fetchData, source.refreshInterval);

      intervalsRef.current.set(newSource.id, interval);
    }

    // Set up WebSocket connection
    if (source.type === 'websocket') {
      const ws = new WebSocket(source.config.url);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const update: RealtimeDataUpdate = {
            sourceId: newSource.id,
            data: Array.isArray(data) ? data : [data],
            timestamp: new Date()
          };
          
          setLatestUpdates(prev => new Map(prev.set(newSource.id, update)));
        } catch (error) {
          console.error('Failed to parse WebSocket data:', error);
        }
      };

      ws.onopen = () => {
        console.log('WebSocket connected:', source.config.url);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setActiveConnections(prev => new Map(prev.set(newSource.id, ws)));
    }

    return newSource.id;
  }, [testConnection]);

  // Remove a realtime data source
  const removeRealtimeSource = useCallback((sourceId: string) => {
    setSources(prev => prev.filter(source => source.id !== sourceId));
    
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

  // Manual refresh for a specific source
  const refreshSource = useCallback(async (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source || source.type !== 'external_api') return;

    setSources(prev => prev.map(s => 
      s.id === sourceId 
        ? { ...s, connectionStatus: 'testing' }
        : s
    ));

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
        
        // Apply same transformation logic
        let transformedData = [];
        
        if (Array.isArray(rawData) && rawData.length > 1 && rawData[1] && Array.isArray(rawData[1])) {
          transformedData = rawData[1].map((item: any) => ({
            country: item.country?.value || 'Unknown',
            indicator: item.indicator?.value || 'Unknown',
            value: item.value,
            date: item.date,
            ...item
          }));
        } else if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
          transformedData = Object.entries(rawData).map(([key, value]) => ({
            key,
            value,
            ...typeof value === 'object' ? value as any : {}
          }));
        } else if (Array.isArray(rawData)) {
          transformedData = rawData;
        } else {
          transformedData = [rawData];
        }

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
        
        setSources(prev => prev.map(s => 
          s.id === sourceId 
            ? { ...s, lastUpdated: new Date(), connectionStatus: 'connected' }
            : s
        ));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      setSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, connectionStatus: 'error', errorMessage }
          : s
      ));
    }
  }, [sources]);

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
    sources,
    isSupabaseConnected,
    latestUpdates: Object.fromEntries(latestUpdates),
    addRealtimeSource,
    removeRealtimeSource,
    getLatestData,
    testConnection,
    refreshSource
  };
};
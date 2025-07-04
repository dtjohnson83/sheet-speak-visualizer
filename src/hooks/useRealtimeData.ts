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
}

export interface RealtimeDataUpdate {
  sourceId: string;
  data: DataRow[];
  columns?: ColumnInfo[];
  timestamp: Date;
}

export const useRealtimeData = () => {
  const [sources, setSources] = useState<RealtimeDataSource[]>([]);
  const [activeConnections, setActiveConnections] = useState<Map<string, any>>(new Map());
  const [latestUpdates, setLatestUpdates] = useState<Map<string, RealtimeDataUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  // Add a new realtime data source
  const addRealtimeSource = useCallback((source: Omit<RealtimeDataSource, 'id'>) => {
    const newSource: RealtimeDataSource = {
      ...source,
      id: Math.random().toString(36).substr(2, 9)
    };

    setSources(prev => [...prev, newSource]);

    // Set up polling for external APIs
    if (source.type === 'external_api' && source.refreshInterval) {
      const interval = setInterval(async () => {
        try {
          // Fetch data from external API
          const response = await fetch(source.config.url, {
            method: source.config.method || 'GET',
            headers: source.config.headers || {},
          });
          
          if (response.ok) {
            const data = await response.json();
            const update: RealtimeDataUpdate = {
              sourceId: newSource.id,
              data: Array.isArray(data) ? data : [data],
              timestamp: new Date()
            };
            
            setLatestUpdates(prev => new Map(prev.set(newSource.id, update)));
          }
        } catch (error) {
          console.error('Failed to fetch realtime data:', error);
        }
      }, source.refreshInterval);

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
  }, []);

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
    return latestUpdates.get(sourceId);
  }, [latestUpdates]);

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
    isConnected,
    latestUpdates: Object.fromEntries(latestUpdates),
    addRealtimeSource,
    removeRealtimeSource,
    getLatestData
  };
};
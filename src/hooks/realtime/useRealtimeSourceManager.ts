import { useState, useEffect, useCallback } from 'react';
import { RealtimeDataSource, REALTIME_STORAGE_KEY } from '@/types/realtime';

export const useRealtimeSourceManager = () => {
  const [sources, setSources] = useState<RealtimeDataSource[]>([]);

  // Load sources from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(REALTIME_STORAGE_KEY);
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
      localStorage.setItem(REALTIME_STORAGE_KEY, JSON.stringify(sources));
    }
  }, [sources]);

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
  const addSource = useCallback((source: Omit<RealtimeDataSource, 'id' | 'connectionStatus'>) => {
    const newSource: RealtimeDataSource = {
      ...source,
      id: Math.random().toString(36).substr(2, 9),
      connectionStatus: 'testing'
    };

    setSources(prev => [...prev, newSource]);
    return newSource.id;
  }, []);

  // Remove a realtime data source
  const removeSource = useCallback((sourceId: string) => {
    setSources(prev => prev.filter(source => source.id !== sourceId));
  }, []);

  // Update source status
  const updateSourceStatus = useCallback((sourceId: string, updates: Partial<RealtimeDataSource>) => {
    setSources(prev => prev.map(s => 
      s.id === sourceId ? { ...s, ...updates } : s
    ));
  }, []);

  return {
    sources,
    setSources,
    testConnection,
    addSource,
    removeSource,
    updateSourceStatus
  };
};
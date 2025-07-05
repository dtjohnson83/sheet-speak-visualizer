import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeDataUpdate } from '@/types/realtime';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useSupabaseRealtimeSync = () => {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [supabaseUpdates, setSupabaseUpdates] = useState<Map<string, RealtimeDataUpdate>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

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
          
          setSupabaseUpdates(prev => new Map(prev.set(payload.new.id, update)));
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
          
          setSupabaseUpdates(prev => new Map(prev.set(payload.new.id, update)));
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

  return {
    isSupabaseConnected,
    supabaseUpdates
  };
};
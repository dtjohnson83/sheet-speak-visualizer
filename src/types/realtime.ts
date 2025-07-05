import { DataRow, ColumnInfo } from '@/pages/Index';

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

export const REALTIME_STORAGE_KEY = 'lovable-realtime-sources';
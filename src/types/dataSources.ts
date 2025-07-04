export interface DataSourceCredentials {
  [key: string]: any;
}

export interface DataSourceConfig {
  type: string;
  name: string;
  credentials: DataSourceCredentials;
  settings?: Record<string, any>;
}

export interface DataSourceAdapter {
  connect(credentials: DataSourceCredentials): Promise<boolean>;
  discoverSchema(): Promise<import('@/pages/Index').ColumnInfo[]>;
  fetchData(query?: any): Promise<import('@/pages/Index').DataRow[]>;
  testConnection(): Promise<boolean>;
  disconnect(): Promise<void>;
  getName(): string;
  getType(): string;
}

export interface DataSourceConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  config: DataSourceConfig;
}

export type DataSourceType = 
  | 'file'
  | 'database'
  | 'api'
  | 'cloud_storage'
  | 'stream';

export interface DatabaseConfig extends DataSourceCredentials {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface APIConfig extends DataSourceCredentials {
  apiKey: string;
  baseUrl: string;
  endpoints?: Record<string, string>;
}
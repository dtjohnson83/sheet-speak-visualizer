import { DataSourceAdapter } from '@/types/dataSources';
import { PostgreSQLAdapter } from './PostgreSQLAdapter';
import { JSONAdapter } from './JSONAdapter';
import { RESTAPIAdapter } from './RESTAPIAdapter';
import { GoogleSheetsAdapter } from './GoogleSheetsAdapter';

export class DataSourceManager {
  private adapters: Map<string, DataSourceAdapter> = new Map();
  private activeConnections: Map<string, DataSourceAdapter> = new Map();

  constructor() {
    this.registerDefaultAdapters();
  }

  private registerDefaultAdapters() {
    this.registerAdapter('postgresql', new PostgreSQLAdapter());
    this.registerAdapter('json', new JSONAdapter());
    this.registerAdapter('rest_api', new RESTAPIAdapter());
    this.registerAdapter('google_sheets', new GoogleSheetsAdapter());
  }

  registerAdapter(type: string, adapter: DataSourceAdapter) {
    this.adapters.set(type, adapter);
  }

  getAdapter(type: string): DataSourceAdapter | undefined {
    return this.adapters.get(type);
  }

  getAvailableTypes(): string[] {
    return Array.from(this.adapters.keys());
  }

  async connect(id: string, type: string, credentials: any): Promise<boolean> {
    const adapter = this.getAdapter(type);
    if (!adapter) {
      throw new Error(`Unknown data source type: ${type}`);
    }

    const success = await adapter.connect(credentials);
    if (success) {
      this.activeConnections.set(id, adapter);
    }

    return success;
  }

  async disconnect(id: string): Promise<void> {
    const adapter = this.activeConnections.get(id);
    if (adapter) {
      await adapter.disconnect();
      this.activeConnections.delete(id);
    }
  }

  getConnection(id: string): DataSourceAdapter | undefined {
    return this.activeConnections.get(id);
  }

  getActiveConnections(): string[] {
    return Array.from(this.activeConnections.keys());
  }

  async testConnection(type: string, credentials: any): Promise<boolean> {
    const adapter = this.getAdapter(type);
    if (!adapter) return false;

    try {
      await adapter.connect(credentials);
      const result = await adapter.testConnection();
      await adapter.disconnect();
      return result;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const dataSourceManager = new DataSourceManager();
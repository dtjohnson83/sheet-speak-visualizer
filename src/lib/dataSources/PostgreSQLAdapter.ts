import { BaseDataSourceAdapter } from './BaseDataSourceAdapter';
import { DataSourceCredentials, DatabaseConfig } from '@/types/dataSources';
import { DataRow, ColumnInfo } from '@/pages/Index';

export class PostgreSQLAdapter extends BaseDataSourceAdapter {
  private config: DatabaseConfig | null = null;

  constructor() {
    super('PostgreSQL Database', 'database');
  }

  async connect(credentials: DataSourceCredentials): Promise<boolean> {
    try {
      this.config = credentials as DatabaseConfig;
      
      // For now, we'll use a Supabase edge function to handle database connections
      // This keeps credentials secure and avoids CORS issues
      const testResult = await this.testConnection();
      this.connected = testResult;
      this.credentials = credentials;
      
      return this.connected;
    } catch (error) {
      console.error('PostgreSQL connection failed:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) return false;

    try {
      // Call edge function to test connection
      const response = await fetch('/api/test-db-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'postgresql',
          config: this.config
        })
      });

      return response.ok;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error);
      return false;
    }
  }

  async discoverSchema(): Promise<ColumnInfo[]> {
    this.ensureConnected();
    
    try {
      const response = await fetch('/api/db-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'postgresql',
          config: this.config
        })
      });

      if (!response.ok) throw new Error('Failed to discover schema');
      
      const { columns } = await response.json();
      return columns;
    } catch (error) {
      console.error('PostgreSQL schema discovery failed:', error);
      return [];
    }
  }

  async fetchData(query?: string): Promise<DataRow[]> {
    this.ensureConnected();
    
    try {
      const response = await fetch('/api/db-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'postgresql',
          config: this.config,
          query: query || 'SELECT * FROM information_schema.tables LIMIT 10'
        })
      });

      if (!response.ok) throw new Error('Failed to fetch data');
      
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('PostgreSQL data fetch failed:', error);
      return [];
    }
  }
}

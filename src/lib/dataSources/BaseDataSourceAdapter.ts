import { DataSourceAdapter, DataSourceCredentials } from '@/types/dataSources';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { detectColumnTypeWithName } from '@/lib/columnTypeDetection';

export abstract class BaseDataSourceAdapter implements DataSourceAdapter {
  protected credentials: DataSourceCredentials = {};
  protected connected: boolean = false;

  constructor(protected name: string, protected type: string) {}

  abstract connect(credentials: DataSourceCredentials): Promise<boolean>;
  abstract discoverSchema(): Promise<ColumnInfo[]>;
  abstract fetchData(query?: any): Promise<DataRow[]>;
  abstract testConnection(): Promise<boolean>;

  async disconnect(): Promise<void> {
    this.connected = false;
    this.credentials = {};
  }

  getName(): string {
    return this.name;
  }

  getType(): string {
    return this.type;
  }

  protected ensureConnected(): void {
    if (!this.connected) {
      throw new Error(`${this.name} adapter is not connected`);
    }
  }

  protected detectColumnType(value: any): ColumnInfo['type'] {
    if (value === null || value === undefined) return 'text';
    
    if (typeof value === 'number') return 'numeric';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
      // Try to detect if it's a date string
      if (!isNaN(Date.parse(value))) return 'date';
      // Try to detect if it's a number string
      if (!isNaN(Number(value))) return 'numeric';
    }
    
    return 'text';
  }

  protected buildColumnInfo(data: DataRow[]): ColumnInfo[] {
    if (data.length === 0) return [];

    const columns: ColumnInfo[] = [];
    const firstRow = data[0];

    Object.keys(firstRow).forEach(columnName => {
      const values = data.map(row => row[columnName]).filter(val => val != null);
      const sampleValues = values.slice(0, 100); // Sample for type detection
      
      // Use enhanced column type detection with column name consideration
      const type = detectColumnTypeWithName(columnName, sampleValues);

      columns.push({
        name: columnName,
        type,
        values: sampleValues
      });
    });

    return columns;
  }
}
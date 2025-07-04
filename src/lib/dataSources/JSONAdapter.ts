import { BaseDataSourceAdapter } from './BaseDataSourceAdapter';
import { DataSourceCredentials } from '@/types/dataSources';
import { DataRow, ColumnInfo } from '@/pages/Index';

export class JSONAdapter extends BaseDataSourceAdapter {
  private jsonData: any = null;

  constructor() {
    super('JSON File', 'file');
  }

  async connect(credentials: DataSourceCredentials): Promise<boolean> {
    try {
      const { file, url, data } = credentials;
      
      if (file) {
        // Handle file upload
        const text = await this.readFileAsText(file);
        this.jsonData = JSON.parse(text);
      } else if (url) {
        // Handle URL
        const response = await fetch(url);
        this.jsonData = await response.json();
      } else if (data) {
        // Handle direct data
        this.jsonData = typeof data === 'string' ? JSON.parse(data) : data;
      } else {
        throw new Error('No JSON data source provided');
      }

      this.connected = true;
      this.credentials = credentials;
      return true;
    } catch (error) {
      console.error('JSON connection failed:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    return this.connected && this.jsonData !== null;
  }

  async discoverSchema(): Promise<ColumnInfo[]> {
    this.ensureConnected();
    
    if (!this.jsonData) return [];

    // Convert JSON to tabular format
    const tabularData = this.jsonToTabular(this.jsonData);
    return this.buildColumnInfo(tabularData);
  }

  async fetchData(): Promise<DataRow[]> {
    this.ensureConnected();
    
    if (!this.jsonData) return [];

    return this.jsonToTabular(this.jsonData);
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private jsonToTabular(data: any): DataRow[] {
    if (Array.isArray(data)) {
      // If it's an array of objects, return as-is
      if (data.length > 0 && typeof data[0] === 'object') {
        return data.map((item, index) => ({
          ...this.flattenObject(item),
          _index: index
        }));
      }
      
      // If it's an array of primitives, convert to single column
      return data.map((item, index) => ({
        value: item,
        _index: index
      }));
    } else if (typeof data === 'object' && data !== null) {
      // If it's a single object, convert to single row
      return [this.flattenObject(data)];
    }
    
    // If it's a primitive, convert to single cell
    return [{ value: data }];
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }
}
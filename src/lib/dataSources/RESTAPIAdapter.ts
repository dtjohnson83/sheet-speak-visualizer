import { BaseDataSourceAdapter } from './BaseDataSourceAdapter';
import { DataSourceCredentials } from '@/types/dataSources';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { RESTAPIConfig, RESTAPIEndpoint, RESTAPIResponse } from '@/types/restAPI';

export class RESTAPIAdapter extends BaseDataSourceAdapter {
  private config: RESTAPIConfig | null = null;
  private rateLimiter: Map<string, number[]> = new Map();

  constructor() {
    super('REST API', 'rest_api');
  }

  async connect(credentials: DataSourceCredentials): Promise<boolean> {
    try {
      this.config = credentials as RESTAPIConfig;
      
      // Validate required fields
      if (!this.config.baseUrl) {
        throw new Error('Base URL is required');
      }

      // Test connection with a simple request
      const success = await this.testConnection();
      this.connected = success;
      return success;
    } catch (error) {
      console.error('REST API connection failed:', error);
      this.connected = false;
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) return false;

    try {
      // Try to make a simple GET request to the base URL
      const response = await this.makeRequest({
        path: '',
        method: 'GET'
      });
      
      return response !== null;
    } catch (error) {
      console.error('REST API test connection failed:', error);
      return false;
    }
  }

  async discoverSchema(): Promise<ColumnInfo[]> {
    this.ensureConnected();
    if (!this.config) throw new Error('No configuration available');

    try {
      // Fetch a small sample of data to discover schema
      const sampleData = await this.fetchData({ limit: 10 });
      return this.buildColumnInfo(sampleData);
    } catch (error) {
      console.error('Schema discovery failed:', error);
      return [];
    }
  }

  async fetchData(query?: any): Promise<DataRow[]> {
    this.ensureConnected();
    if (!this.config) throw new Error('No configuration available');

    try {
      const endpoint: RESTAPIEndpoint = {
        path: query?.endpoint || '',
        method: 'GET',
        params: query?.params || {}
      };

      const response = await this.makeRequest(endpoint);
      
      if (!response) return [];

      // Extract data using dataPath if specified
      let data = response;
      if (this.config.dataPath) {
        data = this.extractDataByPath(response, this.config.dataPath);
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [data];
      }

      return this.flattenObjects(data);
    } catch (error) {
      console.error('Data fetch failed:', error);
      return [];
    }
  }

  private async makeRequest(endpoint: RESTAPIEndpoint): Promise<any> {
    if (!this.config) throw new Error('No configuration available');

    // Apply rate limiting
    await this.applyRateLimit();

    const url = new URL(endpoint.path, this.config.baseUrl);
    
    // Add query parameters
    if (endpoint.params) {
      Object.entries(endpoint.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Add global query parameters
    if (this.config.queryParams) {
      Object.entries(this.config.queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Add authentication
    this.addAuthentication(headers);

    // Add custom headers
    if (this.config.headers) {
      Object.entries(this.config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    const requestOptions: RequestInit = {
      method: endpoint.method,
      headers,
    };

    if (endpoint.body && endpoint.method !== 'GET') {
      requestOptions.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(url.toString(), requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { data: text };
      }
    }
  }

  private addAuthentication(headers: Headers): void {
    if (!this.config?.authentication) return;

    const auth = this.config.authentication;

    switch (auth.type) {
      case 'api_key':
        if (auth.apiKey && auth.apiKeyHeader) {
          headers.set(auth.apiKeyHeader, auth.apiKey);
        }
        break;
      case 'bearer_token':
        if (auth.bearerToken) {
          headers.set('Authorization', `Bearer ${auth.bearerToken}`);
        }
        break;
      case 'basic_auth':
        if (auth.username && auth.password) {
          const credentials = btoa(`${auth.username}:${auth.password}`);
          headers.set('Authorization', `Basic ${credentials}`);
        }
        break;
      case 'oauth':
        if (auth.oauthToken) {
          headers.set('Authorization', `Bearer ${auth.oauthToken}`);
        }
        break;
    }
  }

  private async applyRateLimit(): Promise<void> {
    if (!this.config?.rateLimit) return;

    const now = Date.now();
    const key = this.config.baseUrl;
    const requests = this.rateLimiter.get(key) || [];
    
    // Clean old requests (older than 1 second)
    const recentRequests = requests.filter(time => now - time < 1000);
    
    if (recentRequests.length >= this.config.rateLimit.requestsPerSecond) {
      const waitTime = 1000 - (now - recentRequests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    recentRequests.push(now);
    this.rateLimiter.set(key, recentRequests);
  }

  private extractDataByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private flattenObjects(objects: any[]): DataRow[] {
    return objects.map(obj => this.flattenObject(obj));
  }

  private flattenObject(obj: any, prefix = ''): DataRow {
    const flattened: DataRow = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = JSON.stringify(value);
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  async disconnect(): Promise<void> {
    this.config = null;
    await super.disconnect();
  }
}
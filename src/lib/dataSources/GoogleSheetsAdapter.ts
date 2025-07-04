import { BaseDataSourceAdapter } from './BaseDataSourceAdapter';
import { DataSourceCredentials } from '@/types/dataSources';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { OAuthManager } from '@/lib/oauth/OAuthManager';

export class GoogleSheetsAdapter extends BaseDataSourceAdapter {
  private oauthManager: OAuthManager;
  private spreadsheetId: string = '';
  private sheetName: string = '';

  constructor() {
    super('Google Sheets', 'google_sheets');
    this.oauthManager = OAuthManager.getInstance();
  }

  async connect(credentials: DataSourceCredentials): Promise<boolean> {
    try {
      const { spreadsheetUrl, sheetName } = credentials as { 
        spreadsheetUrl: string; 
        sheetName?: string; 
      };

      // Extract spreadsheet ID from URL
      this.spreadsheetId = this.extractSpreadsheetId(spreadsheetUrl);
      this.sheetName = sheetName || 'Sheet1';

      // Check if we have a valid OAuth token
      const token = await this.oauthManager.getStoredToken('google');
      if (!token) {
        throw new Error('Google OAuth token not found. Please authenticate first.');
      }

      // Test the connection
      const success = await this.testConnection();
      this.connected = success;
      return success;
    } catch (error) {
      console.error('Google Sheets connection failed:', error);
      this.connected = false;
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.spreadsheetId) return false;

    try {
      const token = await this.oauthManager.getStoredToken('google');
      if (!token) return false;

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Google Sheets test connection failed:', error);
      return false;
    }
  }

  async discoverSchema(): Promise<ColumnInfo[]> {
    this.ensureConnected();

    try {
      const token = await this.oauthManager.getStoredToken('google');
      if (!token) throw new Error('No OAuth token available');

      // Get the first row to determine column headers
      const range = `${this.sheetName}!1:1`;
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch headers: ${response.statusText}`);
      }

      const data = await response.json();
      const headers = data.values?.[0] || [];

      // Get some sample data to determine column types
      const sampleRange = `${this.sheetName}!2:11`; // Get 10 rows for type detection
      const sampleResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sampleRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
          },
        }
      );

      let sampleData: string[][] = [];
      if (sampleResponse.ok) {
        const sampleResult = await sampleResponse.json();
        sampleData = sampleResult.values || [];
      }

      const columns: ColumnInfo[] = headers.map((header: string, index: number) => {
        const columnValues = sampleData.map(row => row[index]).filter(val => val != null);
        
        let type: ColumnInfo['type'] = 'text';
        if (columnValues.length > 0) {
          const types = columnValues.map(val => this.detectColumnType(val));
          const typeCounts = types.reduce((acc, t) => {
            acc[t] = (acc[t] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          type = Object.entries(typeCounts).reduce((a, b) => 
            typeCounts[a[0]] > typeCounts[b[0]] ? a : b
          )[0] as ColumnInfo['type'];
        }

        return {
          name: header || `Column ${index + 1}`,
          type,
          values: columnValues
        };
      });

      return columns;
    } catch (error) {
      console.error('Schema discovery failed:', error);
      return [];
    }
  }

  async fetchData(query?: any): Promise<DataRow[]> {
    this.ensureConnected();

    try {
      const token = await this.oauthManager.getStoredToken('google');
      if (!token) throw new Error('No OAuth token available');

      // Determine the range to fetch
      const range = query?.range || `${this.sheetName}`;
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      const values = data.values || [];

      if (values.length === 0) return [];

      // First row is headers
      const headers = values[0];
      const rows = values.slice(1);

      // Convert to DataRow format
      const dataRows: DataRow[] = rows.map(row => {
        const dataRow: DataRow = {};
        headers.forEach((header: string, index: number) => {
          dataRow[header] = row[index] || '';
        });
        return dataRow;
      });

      return dataRows;
    } catch (error) {
      console.error('Data fetch failed:', error);
      return [];
    }
  }

  private extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid Google Sheets URL');
    }
    return match[1];
  }

  getName(): string {
    return `Google Sheets: ${this.spreadsheetId}${this.sheetName ? ` (${this.sheetName})` : ''}`;
  }

  async disconnect(): Promise<void> {
    this.spreadsheetId = '';
    this.sheetName = '';
    await super.disconnect();
  }
}
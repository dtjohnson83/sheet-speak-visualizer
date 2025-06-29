
export interface WorksheetData {
  id: string;
  name: string;
  fileName: string;
  data: any[];
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'date' | 'categorical' | 'text';
  values: any[];
  worksheet?: string;
  originalName?: string;
}

import { DataRow, ColumnInfo } from '@/pages/Index';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  selectedColumns?: string[];
  dateFormat?: 'iso' | 'local' | 'short';
}

export const exportToCSV = (
  data: DataRow[], 
  columns: ColumnInfo[], 
  options: ExportOptions = {}
) => {
  const {
    filename = 'data-export',
    includeHeaders = true,
    selectedColumns,
    dateFormat = 'local'
  } = options;

  // Filter columns if specified
  const columnsToExport = selectedColumns 
    ? columns.filter(col => selectedColumns.includes(col.name))
    : columns;

  // Prepare data with formatting
  const formattedData = data.map(row => {
    const formattedRow: DataRow = {};
    columnsToExport.forEach(col => {
      const value = row[col.name];
      
      if (value === null || value === undefined) {
        formattedRow[col.name] = '';
      } else if (col.type === 'date' && value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            switch (dateFormat) {
              case 'iso':
                formattedRow[col.name] = date.toISOString();
                break;
              case 'short':
                formattedRow[col.name] = date.toLocaleDateString();
                break;
              default:
                formattedRow[col.name] = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            }
          } else {
            formattedRow[col.name] = value;
          }
        } catch {
          formattedRow[col.name] = value;
        }
      } else {
        formattedRow[col.name] = value;
      }
    });
    return formattedRow;
  });

  // Create CSV content
  const headers = columnsToExport.map(col => col.name);
  const csvContent = [
    ...(includeHeaders ? [headers.join(',')] : []),
    ...formattedData.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (
  data: DataRow[], 
  columns: ColumnInfo[], 
  options: ExportOptions = {}
) => {
  const {
    filename = 'data-export',
    includeHeaders = true,
    selectedColumns,
    dateFormat = 'local'
  } = options;

  // Filter columns if specified
  const columnsToExport = selectedColumns 
    ? columns.filter(col => selectedColumns.includes(col.name))
    : columns;

  // Prepare data with formatting
  const formattedData = data.map(row => {
    const formattedRow: DataRow = {};
    columnsToExport.forEach(col => {
      const value = row[col.name];
      
      if (value === null || value === undefined) {
        formattedRow[col.name] = '';
      } else if (col.type === 'date' && value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            // Excel prefers actual Date objects for date formatting
            formattedRow[col.name] = date;
          } else {
            formattedRow[col.name] = value;
          }
        } catch {
          formattedRow[col.name] = value;
        }
      } else {
        formattedRow[col.name] = value;
      }
    });
    return formattedRow;
  });

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(formattedData, {
    header: columnsToExport.map(col => col.name),
    skipHeader: !includeHeaders
  });

  // Set column widths
  const colWidths = columnsToExport.map(col => {
    const maxLength = Math.max(
      col.name.length,
      ...data.slice(0, 100).map(row => String(row[col.name] || '').length)
    );
    return { wch: Math.min(Math.max(maxLength, 10), 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Download file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const getDataSummary = (data: DataRow[], columns: ColumnInfo[]) => {
  return {
    totalRows: data.length,
    totalColumns: columns.length,
    columnTypes: columns.reduce((acc, col) => {
      acc[col.type] = (acc[col.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    memoryUsage: new Blob([JSON.stringify(data)]).size,
    timestamp: new Date().toISOString()
  };
};
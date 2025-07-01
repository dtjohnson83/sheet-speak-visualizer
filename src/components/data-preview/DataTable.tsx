import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { ColumnFormat } from './ColumnFormatting';
import { formatCellValue } from '@/lib/columnFormatting';
import { formatDateForDisplay } from '@/lib/dateConversion';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSort: (columnName: string) => void;
  sortConfig: SortConfig | null;
  columnFormats: ColumnFormat[];
}

const formatDateValue = (value: any): string => {
  return formatDateForDisplay(value, 'YYYY-MM-DD');
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'numeric': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'date': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'categorical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const formatValue = (value: any, column: ColumnInfo, columnFormats: ColumnFormat[]) => {
  if (value === null || value === undefined) return '';
  
  // Check if there's a custom format for this column
  const customFormat = columnFormats.find(f => f.columnName === column.name);
  
  if (customFormat) {
    return formatCellValue(value, customFormat);
  }
  
  // Default formatting based on column type
  switch (column.type) {
    case 'numeric':
      return typeof value === 'number' ? value.toLocaleString() : value;
    case 'date':
      return formatDateValue(value);
    default:
      return value.toString();
  }
};

const getSortIcon = (columnName: string, sortConfig: SortConfig | null) => {
  if (!sortConfig || sortConfig.key !== columnName) {
    return <ArrowUpDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
  }
  
  return sortConfig.direction === 'asc' 
    ? <ArrowUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    : <ArrowDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
};

export const DataTable = ({ 
  data, 
  columns, 
  onSort, 
  sortConfig, 
  columnFormats 
}: DataTableProps) => {
  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th key={column.name} className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    onClick={() => onSort(column.name)}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{column.name}</span>
                      {getSortIcon(column.name, sortConfig)}
                    </div>
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                 {columns.map((column) => (
                   <td key={column.name} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                     {formatValue(row[column.name], column, columnFormats)}
                   </td>
                 ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

import { DataRow, ColumnInfo } from '@/pages/Index';
import { ColumnStatsHeader } from './ColumnStats';
import { ColumnFormat, formatCellValue } from '@/lib/columnFormatting';

interface DataTableProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSort: (columnName: string) => void;
  getSortIcon: (columnName: string) => JSX.Element;
  getTypeColor: (type: string) => string;
  formatValue?: (value: any, type: string) => string;
  columnFormats?: ColumnFormat[];
}

export const DataTable = ({ 
  data, 
  columns, 
  onSort, 
  getSortIcon, 
  getTypeColor, 
  formatValue,
  columnFormats = []
}: DataTableProps) => {
  const getFormattedValue = (value: any, columnName: string, columnType: string): string => {
    const columnFormat = columnFormats.find(f => f.columnName === columnName);
    
    if (columnFormat) {
      return formatCellValue(value, columnFormat);
    }
    
    // Fallback to the original formatValue function
    return formatValue ? formatValue(value, columnType) : String(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column) => (
              <th 
                key={column.name}
                className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700 min-w-[180px]"
              >
                <ColumnStatsHeader
                  columnName={column.name}
                  columnType={column.type}
                  data={data}
                  onSort={onSort}
                  getSortIcon={getSortIcon}
                  getTypeColor={getTypeColor}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td 
                  key={column.name}
                  className="border border-gray-200 px-4 py-3 text-sm"
                >
                  {getFormattedValue(row[column.name], column.name, column.type)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

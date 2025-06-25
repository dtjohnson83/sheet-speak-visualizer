import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DataPreviewProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface ColumnStats {
  count: number;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  mean?: number;
  median?: number;
  min?: any;
  max?: any;
  cardinality: number;
  hasAnomalies: boolean;
  anomalies: string[];
}

export const DataPreview = ({ data, columns, fileName }: DataPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const calculateColumnStats = (columnName: string, columnType: string): ColumnStats => {
    const values = data.map(row => row[columnName]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const nullCount = values.length - nonNullValues.length;
    const nullPercentage = (nullCount / values.length) * 100;
    const uniqueValues = new Set(nonNullValues);
    const uniqueCount = uniqueValues.size;
    const cardinality = uniqueCount / nonNullValues.length;

    let stats: ColumnStats = {
      count: values.length,
      nullCount,
      nullPercentage,
      uniqueCount,
      cardinality,
      hasAnomalies: false,
      anomalies: []
    };

    // Calculate numeric stats for numeric columns
    if (columnType === 'numeric') {
      const numericValues = nonNullValues
        .map(v => Number(v))
        .filter(v => !isNaN(v) && isFinite(v));
      
      if (numericValues.length > 0) {
        const sorted = [...numericValues].sort((a, b) => a - b);
        stats.mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        stats.median = sorted.length % 2 === 0 
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        stats.min = Math.min(...numericValues);
        stats.max = Math.max(...numericValues);
      }
    } else {
      // For non-numeric columns, min/max are first/last when sorted
      if (nonNullValues.length > 0) {
        const sorted = [...nonNullValues].map(v => String(v)).sort();
        stats.min = sorted[0];
        stats.max = sorted[sorted.length - 1];
      }
    }

    // Detect anomalies
    const anomalies: string[] = [];

    // High null percentage
    if (nullPercentage > 50) {
      anomalies.push(`High nulls (${nullPercentage.toFixed(1)}%)`);
    }

    // High cardinality for categorical data
    if (columnType === 'categorical' && uniqueCount > Math.min(100, data.length * 0.8)) {
      anomalies.push('High cardinality');
    }

    // Low cardinality for numeric data
    if (columnType === 'numeric' && uniqueCount < 5 && data.length > 20) {
      anomalies.push('Low variance');
    }

    // Check for inconsistent data types in non-numeric columns
    if (columnType !== 'numeric') {
      const typePatterns = nonNullValues.map(v => {
        const str = String(v);
        if (/^\d+$/.test(str)) return 'integer';
        if (/^\d*\.\d+$/.test(str)) return 'decimal';
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return 'date';
        if (str.length > 100) return 'long_text';
        return 'text';
      });
      
      const uniqueTypes = new Set(typePatterns);
      if (uniqueTypes.size > 2) {
        anomalies.push('Mixed data types');
      }
    }

    stats.hasAnomalies = anomalies.length > 0;
    stats.anomalies = anomalies;

    return stats;
  };

  const handleSort = (columnName: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnName, direction });
    setCurrentPage(0);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    const aValue = a[key];
    const bValue = b[key];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;
    
    // Handle numeric values
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    // Handle string values
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (aStr < bStr) return direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, sortedData.length);
  const currentData = sortedData.slice(startIndex, endIndex);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numeric': return 'bg-blue-100 text-blue-800';
      case 'date': return 'bg-green-100 text-green-800';
      case 'categorical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '';
    
    switch (type) {
      case 'numeric':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      default:
        return value.toString();
    }
  };

  const getSortIcon = (columnName: string) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return 'N/A';
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Data Preview</h3>
          <p className="text-gray-600">
            {fileName} • {data.length} rows • {columns.length} columns
            {sortConfig && (
              <span className="ml-2 text-sm text-blue-600">
                (sorted by {sortConfig.key} {sortConfig.direction === 'asc' ? '↑' : '↓'})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={rowsPerPage.toString()} onValueChange={(value) => {
            setRowsPerPage(Number(value));
            setCurrentPage(0);
          }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">rows per page</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {columns.map((column) => (
            <Badge key={column.name} className={getTypeColor(column.type)}>
              {column.name} ({column.type})
            </Badge>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((column) => {
                  const stats = calculateColumnStats(column.name, column.type);
                  return (
                    <th 
                      key={column.name}
                      className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700 min-w-[180px]"
                    >
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleSort(column.name)}
                          className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                        >
                          <span className="font-semibold">{column.name}</span>
                          {getSortIcon(column.name)}
                          {stats.hasAnomalies && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </button>
                        
                        <div className="space-y-1">
                          <Badge className={`${getTypeColor(column.type)} text-xs w-fit`}>
                            {column.type}
                          </Badge>
                          
                          {/* Stats display */}
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div>Count: {stats.count.toLocaleString()}</div>
                            <div>Unique: {stats.uniqueCount.toLocaleString()}</div>
                            <div>Nulls: {stats.nullCount} ({stats.nullPercentage.toFixed(1)}%)</div>
                            
                            {column.type === 'numeric' && stats.mean !== undefined && (
                              <>
                                <div>Mean: {formatNumber(stats.mean)}</div>
                                <div>Median: {formatNumber(stats.median)}</div>
                              </>
                            )}
                            
                            {stats.min !== undefined && stats.max !== undefined && (
                              <div>Range: {String(stats.min).substring(0, 20)}{String(stats.min).length > 20 ? '...' : ''} → {String(stats.max).substring(0, 20)}{String(stats.max).length > 20 ? '...' : ''}</div>
                            )}
                          </div>
                          
                          {/* Anomalies */}
                          {stats.hasAnomalies && (
                            <div className="space-y-1">
                              {stats.anomalies.map((anomaly, index) => (
                                <Badge 
                                  key={index} 
                                  className="bg-orange-100 text-orange-800 text-xs w-fit"
                                >
                                  ⚠ {anomaly}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td 
                      key={column.name}
                      className="border border-gray-200 px-4 py-3 text-sm"
                    >
                      {formatValue(row[column.name], column.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {endIndex} of {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

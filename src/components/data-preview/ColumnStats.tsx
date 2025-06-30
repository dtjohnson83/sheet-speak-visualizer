
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { isValidNumber } from '@/lib/chartDataUtils';

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

interface ColumnStatsProps {
  columnName: string;
  columnType: string;
  data: DataRow[];
  onSort: (columnName: string) => void;
  getSortIcon: (columnName: string) => JSX.Element;
  getTypeColor: (type: string) => string;
}

const isValidDate = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  
  const dateValue = new Date(value);
  if (isNaN(dateValue.getTime())) return false;
  
  // Check if the string looks like a date (has date-like patterns)
  const str = String(value);
  const datePatterns = [
    /^\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY or DD/MM/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}/, // MM-DD-YYYY or DD-MM-YYYY
    /^\d{4}\/\d{1,2}\/\d{1,2}/, // YYYY/MM/DD
    /^\w{3}\s+\d{1,2},?\s+\d{4}/, // Mon DD, YYYY
    /^\d{1,2}\s+\w{3}\s+\d{4}/, // DD Mon YYYY
  ];
  
  return datePatterns.some(pattern => pattern.test(str));
};

const formatDateValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    
    // Format as YYYY-MM-DD for consistency
    return date.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
  } catch {
    return String(value);
  }
};

const calculateColumnStats = (columnName: string, columnType: string, data: DataRow[]): ColumnStats => {
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

  // Calculate stats based on column type
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
  } else if (columnType === 'date') {
    // For date columns, find min/max dates
    const dateValues = nonNullValues
      .map(v => new Date(v))
      .filter(d => !isNaN(d.getTime()));
    
    if (dateValues.length > 0) {
      const sortedDates = [...dateValues].sort((a, b) => a.getTime() - b.getTime());
      stats.min = formatDateValue(sortedDates[0]);
      stats.max = formatDateValue(sortedDates[sortedDates.length - 1]);
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
      if (isValidDate(v)) return 'date';
      if (str.length > 100) return 'long_text';
      return 'text';
    });
    
    const uniqueTypes = new Set(typePatterns);
    if (uniqueTypes.size > 2) {
      anomalies.push('Mixed data types');
    }
  }

  // Date-specific anomalies
  if (columnType === 'date') {
    const invalidDates = nonNullValues.filter(v => !isValidDate(v));
    if (invalidDates.length > nonNullValues.length * 0.1) {
      anomalies.push('Invalid date formats');
    }
  }

  stats.hasAnomalies = anomalies.length > 0;
  stats.anomalies = anomalies;

  return stats;
};

const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return 'N/A';
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(2);
};

export const ColumnStatsHeader = ({ columnName, columnType, data, onSort, getSortIcon, getTypeColor }: ColumnStatsProps) => {
  const stats = calculateColumnStats(columnName, columnType, data);

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={() => onSort(columnName)}
        className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span className="font-semibold">{columnName}</span>
        {getSortIcon(columnName)}
        {stats.hasAnomalies && (
          <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
        )}
      </button>
      
      <div className="space-y-1">
        <Badge className={`${getTypeColor(columnType)} text-xs w-fit`}>
          {columnType}
        </Badge>
        
        {/* Stats display */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
          <div>Count: {stats.count.toLocaleString()}</div>
          <div>Unique: {stats.uniqueCount.toLocaleString()}</div>
          <div>Nulls: {stats.nullCount} ({stats.nullPercentage.toFixed(1)}%)</div>
          
          {columnType === 'numeric' && stats.mean !== undefined && (
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
                className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs w-fit"
              >
                ⚠ {anomaly}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

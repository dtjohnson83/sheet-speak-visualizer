import { DataRow, ColumnInfo } from '@/pages/Index';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { formatISO, parseISO, startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, addDays, addWeeks, addMonths, addQuarters, addYears, isBefore, isAfter } from 'date-fns';

export type TimeInterval = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface TemporalFrame {
  timeLabel: string;
  data: DataRow[];
  timestamp: string;
}

export interface TemporalAnimationConfig {
  enabled: boolean;
  dateColumn: string;
  timeInterval: TimeInterval;
  animationSpeed: number; // ms per frame
  autoPlay: boolean;
  loop: boolean;
  startDate?: string;
  endDate?: string;
  aggregationMethod: AggregationMethod;
  showCumulative: boolean;
}

const getIntervalStart = (date: Date, interval: TimeInterval): Date => {
  switch (interval) {
    case 'day':
      return startOfDay(date);
    case 'week':
      return startOfWeek(date);
    case 'month':
      return startOfMonth(date);
    case 'quarter':
      return startOfQuarter(date);
    case 'year':
      return startOfYear(date);
    default:
      return startOfDay(date);
  }
};

const addInterval = (date: Date, interval: TimeInterval, amount: number = 1): Date => {
  switch (interval) {
    case 'day':
      return addDays(date, amount);
    case 'week':
      return addWeeks(date, amount);
    case 'month':
      return addMonths(date, amount);
    case 'quarter':
      return addQuarters(date, amount);
    case 'year':
      return addYears(date, amount);
    default:
      return addDays(date, amount);
  }
};

const formatTimeLabel = (date: Date, interval: TimeInterval): string => {
  switch (interval) {
    case 'day':
      return date.toLocaleDateString();
    case 'week':
      return `Week of ${date.toLocaleDateString()}`;
    case 'month':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    case 'quarter':
      return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    case 'year':
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString();
  }
};

export const parseDate = (value: any): Date | null => {
  if (!value) return null;
  
  try {
    console.log('Parsing date value:', value, 'Type:', typeof value);
    
    // Handle Date objects
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return value;
    }
    
    // Handle Excel dates (numbers representing days since 1900-01-01)
    if (typeof value === 'number') {
      // Excel date serial number
      if (value > 1 && value < 2958466) { // Valid Excel date range
        const excelDate = new Date((value - 25569) * 86400 * 1000);
        console.log('Excel date converted:', value, '->', excelDate);
        return isNaN(excelDate.getTime()) ? null : excelDate;
      }
      // Unix timestamp
      if (value > 1000000000 && value < 4000000000) {
        return new Date(value * 1000);
      }
      // Millisecond timestamp
      if (value > 1000000000000) {
        return new Date(value);
      }
      return new Date(value);
    }
    
    const str = String(value).trim();
    if (!str) return null;
    
    console.log('Parsing string date:', str);
    
    // Try ISO format first
    if (str.includes('T') || str.includes('Z')) {
      const isoDate = parseISO(str);
      if (!isNaN(isoDate.getTime())) {
        console.log('ISO date parsed:', str, '->', isoDate);
        return isoDate;
      }
    }
    
    // Try various common formats
    const formats = [
      // ISO formats
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{4}\/\d{2}\/\d{2}$/,
      // US formats
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      // European formats
      /^\d{1,2}\.\d{1,2}\.\d{4}$/,
    ];
    
    // Try direct parsing first
    let parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      console.log('Direct date parsing succeeded:', str, '->', parsed);
      return parsed;
    }
    
    // Try with different separators if direct parsing failed
    const dateStr = str.replace(/[\/\-\.]/g, '/');
    parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      console.log('Normalized date parsing succeeded:', str, '->', parsed);
      return parsed;
    }
    
    console.log('All date parsing methods failed for:', str);
    return null;
  } catch (error) {
    console.warn('Failed to parse date:', value, error);
    return null;
  }
};

export const prepareTemporalAnimationData = (
  data: DataRow[],
  config: TemporalAnimationConfig,
  valueColumns: string[]
): TemporalFrame[] => {
  if (!config.enabled || !config.dateColumn || !data.length) {
    return [];
  }

  console.log('Preparing temporal animation data:', {
    dataLength: data.length,
    config,
    valueColumns,
    sampleData: data.slice(0, 2)
  });

  // Parse and sort data by date
  console.log('Sample date values from column', config.dateColumn, ':', data.slice(0, 5).map(row => ({
    original: row[config.dateColumn],
    type: typeof row[config.dateColumn],
    parsed: parseDate(row[config.dateColumn])
  })));

  const parsedData = data
    .map(row => {
      const date = parseDate(row[config.dateColumn]);
      return { ...row, _parsedDate: date };
    })
    .filter(row => row._parsedDate !== null)
    .sort((a, b) => a._parsedDate!.getTime() - b._parsedDate!.getTime());

  console.log(`Parsed ${parsedData.length} valid dates out of ${data.length} total rows`);

  if (!parsedData.length) {
    console.error('❌ TEMPORAL DATA ERROR: No valid dates found in data');
    console.log('📊 Data Analysis:');
    console.log('  - Total rows:', data.length);
    console.log('  - Available columns:', Object.keys(data[0] || {}));
    console.log('  - Selected date column:', config.dateColumn);
    console.log('  - Column exists:', config.dateColumn in (data[0] || {}));
    console.log('  - Sample values from date column:', data.slice(0, 10).map(row => row[config.dateColumn]));
    console.log('  - Value types:', data.slice(0, 5).map(row => typeof row[config.dateColumn]));
    console.log('📋 Troubleshooting:');
    console.log('  1. Verify date column name is correct');
    console.log('  2. Check if date values are in recognized format');
    console.log('  3. Ensure date column contains actual date data');
    console.log('📈 Sample raw data:', data.slice(0, 3));
    
    // Show detailed parsing attempts for debugging
    console.log('🔍 Detailed parsing attempts:');
    data.slice(0, 5).forEach((row, index) => {
      const value = row[config.dateColumn];
      console.log(`  Row ${index}: "${value}" (${typeof value}) -> ${parseDate(value)}`);
    });
    
    return [];
  }

  // Determine date range
  const firstDate = parsedData[0]._parsedDate!;
  const lastDate = parsedData[parsedData.length - 1]._parsedDate!;
  
  const startDate = config.startDate ? parseDate(config.startDate) || firstDate : firstDate;
  const endDate = config.endDate ? parseDate(config.endDate) || lastDate : lastDate;

  console.log('Date range:', { startDate, endDate, interval: config.timeInterval });

  // Generate time periods
  const frames: TemporalFrame[] = [];
  let currentDate = getIntervalStart(startDate, config.timeInterval);
  
  let cumulativeData: Map<string, DataRow> = new Map();

  while (!isAfter(currentDate, endDate)) {
    const nextDate = addInterval(currentDate, config.timeInterval);
    
    // Get data for this time period
    const periodData = parsedData.filter(row => {
      const rowDate = row._parsedDate!;
      return !isBefore(rowDate, currentDate) && isBefore(rowDate, nextDate);
    });

    // Aggregate data for this period
    const aggregatedData = aggregateByTimeSlice(
      periodData,
      valueColumns,
      config.aggregationMethod
    );

    // Handle cumulative data if requested
    let frameData = aggregatedData;
    if (config.showCumulative) {
      frameData = mergeCumulativeData(cumulativeData, aggregatedData, valueColumns);
    }

    frames.push({
      timeLabel: formatTimeLabel(currentDate, config.timeInterval),
      data: frameData,
      timestamp: formatISO(currentDate)
    });

    currentDate = nextDate;
  }

  console.log('Generated temporal frames:', frames.length, 'Sample frame:', frames[0]);
  return frames;
};

const aggregateByTimeSlice = (
  data: DataRow[],
  valueColumns: string[],
  aggregationMethod: AggregationMethod
): DataRow[] => {
  if (!data.length) return [];

  // Group by non-date, non-value columns (category columns)
  const categoryColumns = Object.keys(data[0]).filter(
    col => !valueColumns.includes(col) && col !== '_parsedDate'
  );

  if (!categoryColumns.length) {
    // No categories - aggregate all data into single row
    const aggregated: DataRow = {};
    
    valueColumns.forEach(col => {
      const values = data
        .map(row => parseFloat(row[col]))
        .filter(val => !isNaN(val));
      
      aggregated[col] = applyAggregation(values, aggregationMethod);
    });

    return [aggregated];
  }

  // Group by category columns
  const grouped = data.reduce((acc, row) => {
    const key = categoryColumns.map(col => row[col]).join('|');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {} as Record<string, DataRow[]>);

  return Object.entries(grouped).map(([key, rows]) => {
    const result: DataRow = {};
    
    // Copy category values
    categoryColumns.forEach((col, index) => {
      result[col] = key.split('|')[index];
    });

    // Aggregate value columns
    valueColumns.forEach(col => {
      const values = rows
        .map(row => parseFloat(row[col]))
        .filter(val => !isNaN(val));
      
      result[col] = applyAggregation(values, aggregationMethod);
    });

    return result;
  });
};

const mergeCumulativeData = (
  cumulativeData: Map<string, DataRow>,
  newData: DataRow[],
  valueColumns: string[]
): DataRow[] => {
  // Update cumulative data with new period data
  newData.forEach(row => {
    const categoryKey = Object.keys(row)
      .filter(col => !valueColumns.includes(col))
      .map(col => row[col])
      .join('|');

    const existing = cumulativeData.get(categoryKey) || {};
    const updated: DataRow = { ...existing };

    // Copy category columns
    Object.keys(row).forEach(col => {
      if (!valueColumns.includes(col)) {
        updated[col] = row[col];
      }
    });

    // Add value columns cumulatively
    valueColumns.forEach(col => {
      const existingValue = parseFloat(existing[col]) || 0;
      const newValue = parseFloat(row[col]) || 0;
      updated[col] = existingValue + newValue;
    });

    cumulativeData.set(categoryKey, updated);
  });

  return Array.from(cumulativeData.values());
};

const applyAggregation = (values: number[], method: AggregationMethod): number => {
  if (values.length === 0) return 0;
  
  switch (method) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'average':
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return values.reduce((sum, val) => sum + val, 0);
  }
};

export const detectTemporalColumns = (columns: ColumnInfo[]): ColumnInfo[] => {
  console.log('🔍 Detecting temporal columns from:', columns.map(col => `${col.name} (${col.type})`));
  
  const temporalColumns = columns.filter(col => {
    const isDateType = col.type === 'date';
    const isTemporalName = col.type === 'text' && /date|time|created|updated|timestamp|year|month|day|period/i.test(col.name);
    const isNumericTemporal = col.type === 'numeric' && /date|time|year|month|day|timestamp|epoch/i.test(col.name);
    
    // Additional check for common date patterns in column names
    const hasDatePattern = /\b(date|time|when|created|updated|timestamp|period|year|month|day)\b/i.test(col.name);
    
    console.log(`  Column "${col.name}" (${col.type}):`, {
      isDateType,
      isTemporalName,
      isNumericTemporal,
      hasDatePattern,
      detected: isDateType || isTemporalName || isNumericTemporal || (col.type !== 'numeric' && hasDatePattern)
    });
    
    return isDateType || isTemporalName || isNumericTemporal || (col.type !== 'numeric' && hasDatePattern);
  });
  
  console.log('✅ Detected temporal columns:', temporalColumns.map(col => `${col.name} (${col.type})`));
  
  if (temporalColumns.length === 0) {
    console.log('⚠️ No temporal columns detected. Available columns:', columns.map(col => `${col.name} (${col.type})`));
    console.log('💡 Try columns with names containing: date, time, created, updated, timestamp, year, month, day, period');
  }
  
  return temporalColumns;
};

export const isTemporalDataSuitable = (
  data: DataRow[],
  dateColumn: string,
  minFrames: number = 3
): boolean => {
  if (!data.length || !dateColumn) return false;

  const validDates = data
    .map(row => parseDate(row[dateColumn]))
    .filter(date => date !== null);

  if (validDates.length < minFrames) return false;

  // Check if we have sufficient time spread
  const uniqueDates = new Set(validDates.map(date => date!.toDateString()));
  return uniqueDates.size >= minFrames;
};
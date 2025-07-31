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

const parseDate = (value: any): Date | null => {
  if (!value) return null;
  
  try {
    // Handle various date formats
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    
    const str = String(value).trim();
    if (!str) return null;
    
    // Try ISO format first
    if (str.includes('T') || str.includes('Z')) {
      return parseISO(str);
    }
    
    // Try standard date parsing
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
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
  const parsedData = data
    .map(row => {
      const date = parseDate(row[config.dateColumn]);
      return { ...row, _parsedDate: date };
    })
    .filter(row => row._parsedDate !== null)
    .sort((a, b) => a._parsedDate!.getTime() - b._parsedDate!.getTime());

  if (!parsedData.length) {
    console.warn('No valid dates found in data');
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
  return columns.filter(col => 
    col.type === 'date' || 
    (col.type === 'text' && /date|time|created|updated|timestamp/i.test(col.name))
  );
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
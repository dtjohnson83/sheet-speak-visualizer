
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';

export interface SankeyData {
  nodes: { id: string; name: string }[];
  links: { source: string; target: string; value: number }[];
}

export const isValidNumber = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

export const sortData = (data: DataRow[], sortColumn: string, sortDirection: 'asc' | 'desc') => {
  if (!sortColumn || sortColumn === 'none') return data;
  
  return [...data].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
    
    // Check if both values are valid numbers
    const aIsNumber = isValidNumber(aValue);
    const bIsNumber = isValidNumber(bValue);
    
    if (aIsNumber && bIsNumber) {
      // Both are numbers - do numeric comparison
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    } else if (aIsNumber && !bIsNumber) {
      // Only a is a number - numbers come first in ascending order
      return sortDirection === 'asc' ? -1 : 1;
    } else if (!aIsNumber && bIsNumber) {
      // Only b is a number - numbers come first in ascending order
      return sortDirection === 'asc' ? 1 : -1;
    } else {
      // Both are strings - do string comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  });
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

export const aggregateData = (
  data: DataRow[], 
  xColumn: string, 
  yColumn: string, 
  series: SeriesConfig[],
  aggregationMethod: AggregationMethod = 'sum'
): DataRow[] => {
  if (!xColumn || !yColumn) return data;

  const grouped = data.reduce((acc, row) => {
    const xValue = row[xColumn]?.toString() || 'Unknown';
    
    if (!acc[xValue]) {
      acc[xValue] = {
        [xColumn]: xValue,
        yValues: [],
        count: 0,
        seriesValues: {}
      };
      
      series.forEach(seriesConfig => {
        acc[xValue].seriesValues[seriesConfig.column] = [];
      });
    }
    
    const yValue = Number(row[yColumn]);
    if (isValidNumber(yValue)) {
      acc[xValue].yValues.push(yValue);
    }
    
    series.forEach(seriesConfig => {
      const seriesValue = Number(row[seriesConfig.column]);
      if (isValidNumber(seriesValue)) {
        acc[xValue].seriesValues[seriesConfig.column].push(seriesValue);
      }
    });
    
    acc[xValue].count += 1;
    
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(grouped).map(([xValue, groupData]) => {
    const result: DataRow = {
      [xColumn]: xValue,
      [yColumn]: applyAggregation(groupData.yValues, aggregationMethod)
    };
    
    // Apply aggregation to series data
    series.forEach(seriesConfig => {
      const seriesValues = groupData.seriesValues[seriesConfig.column] || [];
      result[seriesConfig.column] = applyAggregation(seriesValues, aggregationMethod);
    });
    
    return result;
  });
};

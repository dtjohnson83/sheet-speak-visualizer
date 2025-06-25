import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';

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

export const aggregateData = (
  data: DataRow[], 
  xColumn: string, 
  yColumn: string, 
  series: SeriesConfig[]
): DataRow[] => {
  if (!xColumn || !yColumn) return data;

  const grouped = data.reduce((acc, row) => {
    const xValue = row[xColumn]?.toString() || 'Unknown';
    
    if (!acc[xValue]) {
      acc[xValue] = {
        [xColumn]: xValue,
        [yColumn]: 0,
        count: 0
      };
      
      series.forEach(seriesConfig => {
        acc[xValue][seriesConfig.column] = 0;
      });
    }
    
    const yValue = Number(row[yColumn]);
    if (isValidNumber(yValue)) {
      acc[xValue][yColumn] += yValue;
    }
    
    series.forEach(seriesConfig => {
      const seriesValue = Number(row[seriesConfig.column]);
      if (isValidNumber(seriesValue)) {
        acc[xValue][seriesConfig.column] += seriesValue;
      }
    });
    
    acc[xValue].count += 1;
    
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped);
};


import { DataRow } from '@/pages/Index';
import { isValidNumber, sortData } from '@/lib/chartDataUtils';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { applyAggregation } from './aggregationUtils';

export const prepareStackedBarData = (
  data: DataRow[],
  xColumn: string,
  yColumn: string,
  stackColumn: string,
  aggregationMethod: AggregationMethod,
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
): DataRow[] => {
  if (!stackColumn) return [];
  
  const sortedData = sortData(data, sortColumn, sortDirection);
  
  const grouped = sortedData.reduce((acc, row) => {
    const xValue = row[xColumn]?.toString() || 'Unknown';
    const stackValue = row[stackColumn]?.toString() || 'Unknown';
    const yValue = Number(row[yColumn]);
    
    if (!isValidNumber(yValue)) return acc;
    
    if (!acc[xValue]) {
      acc[xValue] = { [xColumn]: xValue };
    }
    
    if (!acc[xValue][stackValue]) acc[xValue][stackValue] = [];
    acc[xValue][stackValue].push(yValue);
    
    return acc;
  }, {} as Record<string, any>);

  const result = Object.entries(grouped).map(([xValue, stackData]) => {
    const result: any = { [xColumn]: xValue };
    
    Object.entries(stackData).forEach(([stackKey, values]) => {
      if (stackKey !== xColumn && Array.isArray(values)) {
        result[stackKey] = applyAggregation(values as number[], aggregationMethod);
      }
    });
    
    return result;
  });

  console.log('Stacked bar data prepared:', result);
  return result;
};

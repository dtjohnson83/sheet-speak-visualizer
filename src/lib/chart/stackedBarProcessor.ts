
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
  console.log('🏗️ prepareStackedBarData - Input:', {
    dataLength: data.length,
    xColumn,
    yColumn,
    stackColumn,
    aggregationMethod,
    sampleData: data.slice(0, 2)
  });

  if (!stackColumn) {
    console.warn('prepareStackedBarData - No stack column provided');
    return [];
  }
  
  const sortedData = sortData(data, sortColumn, sortDirection);
  
  // Get unique stack values to understand what columns will be created
  const uniqueStackValues = [...new Set(sortedData.map(row => row[stackColumn]?.toString() || 'Unknown'))];
  console.log('🏗️ prepareStackedBarData - Stack values:', uniqueStackValues);
  
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
    const resultRow: any = { [xColumn]: xValue };
    
    // Process each stack value as a separate column
    Object.entries(stackData).forEach(([stackKey, values]) => {
      if (stackKey !== xColumn && Array.isArray(values)) {
        resultRow[stackKey] = applyAggregation(values as number[], aggregationMethod);
      }
    });
    
    return resultRow;
  });

  console.log('🏗️ prepareStackedBarData - Final result:', {
    resultLength: result.length,
    sampleResult: result.slice(0, 2),
    resultColumns: result.length > 0 ? Object.keys(result[0]) : [],
    originalYColumn: yColumn,
    stackColumns: uniqueStackValues
  });

  return result;
};

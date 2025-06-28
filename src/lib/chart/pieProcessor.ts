
import { DataRow } from '@/pages/Index';
import { isValidNumber, sortData } from '@/lib/chartDataUtils';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { applyAggregation } from './aggregationUtils';

export const preparePieData = (
  data: DataRow[],
  xColumn: string,
  yColumn: string,
  aggregationMethod: AggregationMethod,
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
): DataRow[] => {
  const sortedData = sortData(data, sortColumn, sortDirection);
  
  const grouped = sortedData.reduce((acc, row) => {
    const category = row[xColumn]?.toString() || 'Unknown';
    const value = Number(row[yColumn]);
    if (isValidNumber(value)) {
      if (!acc[category]) acc[category] = [];
      acc[category].push(value);
    }
    return acc;
  }, {} as Record<string, number[]>);

  const result = Object.entries(grouped)
    .map(([name, values]) => ({
      name,
      value: applyAggregation(values, aggregationMethod),
      [yColumn]: applyAggregation(values, aggregationMethod)
    }))
    .filter(item => item.value > 0);

  console.log('Pie chart data prepared:', result);
  return result;
};

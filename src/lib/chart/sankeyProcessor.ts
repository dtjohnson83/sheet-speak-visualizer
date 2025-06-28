
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SankeyData, isValidNumber, sortData } from '@/lib/chartDataUtils';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { applyAggregation } from './aggregationUtils';

export const prepareSankeyData = (
  data: DataRow[],
  xColumn: string,
  yColumn: string,
  valueColumn: string,
  aggregationMethod: AggregationMethod,
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
): SankeyData => {
  if (!yColumn) return { nodes: [], links: [] };
  
  const sortedData = sortData(data, sortColumn, sortDirection);
  
  // Use valueColumn if provided, otherwise fall back to counting occurrences
  const sankeyData = sortedData.reduce((acc, row) => {
    const source = row[xColumn]?.toString() || 'Unknown';
    const target = row[yColumn]?.toString() || 'Unknown';
    const key = `${source}_${target}`;
    
    let value = 1; // Default to count
    if (valueColumn) {
      const numValue = Number(row[valueColumn]);
      if (isValidNumber(numValue)) {
        value = numValue;
      }
    }
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(value);
    return acc;
  }, {} as Record<string, number[]>);

  const nodes = new Set<string>();
  const links = Object.entries(sankeyData).map(([key, values]) => {
    const [source, target] = key.split('_');
    nodes.add(source);
    nodes.add(target);
    return { 
      source, 
      target, 
      value: applyAggregation(values, aggregationMethod)
    };
  }).filter(link => link.value > 0);

  const result: SankeyData = {
    nodes: Array.from(nodes).map(id => ({ id, name: id })),
    links
  };

  console.log('Sankey data prepared:', result);
  return result;
};

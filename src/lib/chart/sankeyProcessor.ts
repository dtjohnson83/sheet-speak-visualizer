
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SankeyData, isValidNumber, sortData } from '@/lib/chartDataUtils';

export const prepareSankeyData = (
  data: DataRow[],
  xColumn: string,
  sankeyTargetColumn: string,
  valueColumn: string,
  yColumn: string,
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
): SankeyData => {
  if (!sankeyTargetColumn) return { nodes: [], links: [] };
  
  const sortedData = sortData(data, sortColumn, sortDirection);
  
  // Use valueColumn if provided, otherwise fall back to yColumn
  const sankeyValueColumn = valueColumn || yColumn;
  
  const sankeyData = sortedData.reduce((acc, row) => {
    const source = row[xColumn]?.toString() || 'Unknown';
    const target = row[sankeyTargetColumn]?.toString() || 'Unknown';
    const value = Number(row[sankeyValueColumn]);
    
    if (isValidNumber(value) && value > 0) {
      const key = `${source}_${target}`;
      acc[key] = (acc[key] || 0) + value;
    }
    return acc;
  }, {} as Record<string, number>);

  const nodes = new Set<string>();
  const links = Object.entries(sankeyData).map(([key, value]) => {
    const [source, target] = key.split('_');
    nodes.add(source);
    nodes.add(target);
    return { source, target, value };
  });

  const result: SankeyData = {
    nodes: Array.from(nodes).map(id => ({ id, name: id })),
    links
  };

  console.log('Sankey data prepared:', result);
  return result;
};

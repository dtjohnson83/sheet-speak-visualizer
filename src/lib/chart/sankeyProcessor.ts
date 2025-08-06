import { DataRow } from '@/pages/Index';
import { SankeyData, isValidNumber } from '@/lib/chartDataUtils';

const cleanNumericValue = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  
  const str = value.toString().replace(/[$,\s%]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
};

export const prepareSankeyData = (
  data: DataRow[],
  sourceColumn: string,
  targetColumn: string,
  valueColumn: string
): SankeyData => {
  if (!data || !sourceColumn || !targetColumn || !valueColumn) {
    return { nodes: [], links: [] };
  }

  // Aggregate values for each source-target pair
  const linkMap = new Map<string, number>();
  const nodeSet = new Set<string>();

  data.forEach(row => {
    const source = row[sourceColumn]?.toString() || 'Unknown';
    const target = row[targetColumn]?.toString() || 'Unknown';
    const value = cleanNumericValue(row[valueColumn]);

    if (!isValidNumber(value) || value === null) return;

    const linkKey = `${source} -> ${target}`;
    linkMap.set(linkKey, (linkMap.get(linkKey) || 0) + value);
    
    nodeSet.add(source);
    nodeSet.add(target);
  });

  // Create nodes array
  const nodes = Array.from(nodeSet).map(id => ({
    id,
    name: id
  }));

  // Create links array
  const links = Array.from(linkMap.entries()).map(([linkKey, value]) => {
    const [source, target] = linkKey.split(' -> ');
    return {
      source,
      target,
      value
    };
  });

  console.log('Sankey data prepared:', { 
    nodesCount: nodes.length, 
    linksCount: links.length,
    nodes: nodes.slice(0, 5),
    links: links.slice(0, 5)
  });

  return { nodes, links };
};
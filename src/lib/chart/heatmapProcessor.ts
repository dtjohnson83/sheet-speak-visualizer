
import { DataRow, ColumnInfo } from '@/pages/Index';
import { isValidNumber, sortData } from '@/lib/chartDataUtils';

export const prepareHeatmapData = (
  data: DataRow[],
  xColumn: string,
  yColumn: string,
  valueColumn: string | undefined,
  numericColumns: ColumnInfo[],
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
): Array<{ x: string; y: string; value: number }> => {
  const sortedData = sortData(data, sortColumn, sortDirection);
  
  // Use valueColumn if provided, otherwise use first numeric column or default to count
  const heatmapValueColumn = valueColumn || (numericColumns.length > 0 ? numericColumns[0].name : null);
  
  const heatmapData = sortedData.reduce((acc, row) => {
    const xValue = row[xColumn]?.toString() || 'Unknown';
    const yValue = row[yColumn]?.toString() || 'Unknown';
    const key = `${xValue}_${yValue}`;
    
    let value = 1; // Default to count
    if (heatmapValueColumn) {
      const numValue = Number(row[heatmapValueColumn]);
      if (isValidNumber(numValue)) {
        value = numValue;
      }
    }
    
    acc[key] = (acc[key] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const result = Object.entries(heatmapData).map(([key, value]) => {
    const [x, y] = key.split('_');
    return { x, y, value };
  });

  console.log('Heatmap data prepared:', result);
  return result;
};

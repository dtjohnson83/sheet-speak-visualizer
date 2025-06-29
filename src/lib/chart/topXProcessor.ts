
import { DataRow } from '@/pages/Index';

export const applyTopXLimit = (
  data: DataRow[],
  limit: number | null,
  sortColumn: string,
  sortDirection: 'asc' | 'desc' = 'desc'
): DataRow[] => {
  if (!limit || limit <= 0 || data.length <= limit) {
    return data;
  }

  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    const aVal = Number(a[sortColumn]) || 0;
    const bVal = Number(b[sortColumn]) || 0;
    
    if (sortDirection === 'asc') {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });

  console.log(`Applied top ${limit} limit to ${data.length} rows, sorted by ${sortColumn} ${sortDirection}`);
  return sortedData.slice(0, limit);
};

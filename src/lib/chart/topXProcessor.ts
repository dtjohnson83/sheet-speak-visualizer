
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

  // Create a copy for sorting to avoid mutating the original
  const sortedData = [...data].sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
    if (bVal == null) return sortDirection === 'asc' ? 1 : -1;

    // Try numeric comparison first
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      // Both are valid numbers
      if (sortDirection === 'asc') {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    } else {
      // Fallback to string comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    }
  });

  const result = sortedData.slice(0, limit);
  console.log(`Applied top ${limit} limit to ${data.length} rows, sorted by ${sortColumn} ${sortDirection}`, {
    originalCount: data.length,
    limitedCount: result.length,
    sortColumn,
    sortDirection
  });
  
  return result;
};


import { DataRow } from '@/pages/Index';

export const prepareHistogramData = (
  data: DataRow[],
  column: string,
  binCount: number = 10
): DataRow[] => {
  // Filter and convert to numbers
  const values = data
    .map(row => Number(row[column]))
    .filter(val => !isNaN(val) && isFinite(val));

  if (values.length === 0) return [];

  // Calculate bin boundaries
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount;

  // Create bins
  const bins: { range: string; count: number; min: number; max: number }[] = [];
  
  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * binWidth;
    const binMax = i === binCount - 1 ? max : min + (i + 1) * binWidth;
    
    const count = values.filter(val => 
      i === binCount - 1 ? val >= binMin && val <= binMax : val >= binMin && val < binMax
    ).length;

    // Format range with proper decimal places for better display
    const formattedMin = binMin.toFixed(1);
    const formattedMax = binMax.toFixed(1);
    const range = `${formattedMin} - ${formattedMax}`;

    bins.push({
      range,
      count,
      min: binMin,
      max: binMax
    });
  }

  console.log('Histogram data prepared:', bins);
  return bins.map(bin => ({
    [column]: bin.range,
    range: bin.range, // Ensure range is available for display
    frequency: bin.count,
    value: bin.count
  }));
};

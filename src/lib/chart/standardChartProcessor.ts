
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { isValidNumber, aggregateData } from '@/lib/chartDataUtils';
import { ColumnFormat, formatCellValue } from '@/lib/columnFormatting';

export const prepareStandardChartData = (
  data: DataRow[],
  xColumn: string,
  yColumn: string,
  xCol: ColumnInfo,
  yCol: ColumnInfo,
  series: SeriesConfig[],
  aggregationMethod: any,
  sortColumn: string,
  sortDirection: 'asc' | 'desc',
  chartType: string,
  columnFormats?: ColumnFormat[]
): DataRow[] => {
  // Use the updated aggregateData function that handles per-series aggregation
  const aggregatedData = aggregateData(data, xColumn, yColumn, series, aggregationMethod);
  
  const processedData = aggregatedData
    .map(row => {
      let xValue = row[xColumn];
      let yValue = row[yColumn];

      if (xCol.type === 'numeric') {
        xValue = Number(xValue);
        if (!isValidNumber(xValue)) return null;
      } else if (xCol.type === 'date') {
        if (chartType === 'scatter') {
          const date = new Date(xValue);
          if (isNaN(date.getTime())) return null;
          xValue = date.getTime();
        } else {
          // For non-scatter charts, format the date for display
          const xColumnFormat = columnFormats?.find(f => f.columnName === xColumn);
          if (xColumnFormat && xColumnFormat.type === 'date') {
            xValue = formatCellValue(xValue, xColumnFormat);
          } else {
            // Default date formatting if no specific format is set
            const date = new Date(xValue);
            if (!isNaN(date.getTime())) {
              xValue = date.toLocaleDateString('en-CA'); // ISO format YYYY-MM-DD
            }
          }
        }
      }

      yValue = Number(yValue);
      if (!isValidNumber(yValue)) return null;

      const processedRow = {
        ...row,
        [xColumn]: xValue,
        [yColumn]: yValue
      };

      return processedRow;
    })
    .filter(row => row !== null);

  // Apply sorting if specified
  if (sortColumn && sortColumn !== 'none') {
    processedData.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Try to convert to numbers for numeric comparison
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Both are numbers, do numeric comparison
        if (sortDirection === 'asc') {
          return aNum - bNum;
        } else {
          return bNum - aNum;
        }
      } else {
        // String comparison
        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      }
    });
  }

  console.log('Chart data prepared (aggregated, formatted, and sorted):', {
    originalCount: data.length,
    processedCount: processedData.length,
    sortColumn,
    sortDirection,
    sample: processedData.slice(0, 3)
  });
  
  return processedData;
};

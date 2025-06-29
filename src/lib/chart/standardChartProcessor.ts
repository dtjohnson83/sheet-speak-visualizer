
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

  console.log('Chart data prepared (aggregated with per-series methods and formatted):', processedData);
  return processedData;
};

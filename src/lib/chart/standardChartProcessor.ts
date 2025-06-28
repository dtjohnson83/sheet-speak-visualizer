
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { isValidNumber, aggregateData } from '@/lib/chartDataUtils';

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
  chartType: string
): DataRow[] => {
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

  console.log('Chart data prepared (aggregated):', processedData);
  return processedData;
};

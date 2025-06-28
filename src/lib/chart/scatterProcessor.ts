
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { isValidNumber, sortData } from '@/lib/chartDataUtils';

export const prepareScatterData = (
  data: DataRow[],
  xColumn: string,
  yColumn: string,
  xCol: ColumnInfo,
  yCol: ColumnInfo,
  series: SeriesConfig[],
  supportsMultipleSeries: boolean,
  sortColumn: string,
  sortDirection: 'asc' | 'desc'
): DataRow[] => {
  const sortedData = sortData(data, sortColumn, sortDirection);
  
  const processedData = sortedData
    .map(row => {
      let xValue = Number(row[xColumn]);
      let yValue = Number(row[yColumn]);

      if (!isValidNumber(xValue) || !isValidNumber(yValue)) return null;

      const processedRow = {
        ...row,
        [xColumn]: xValue,
        [yColumn]: yValue
      };

      if (supportsMultipleSeries && series.length > 0) {
        series.forEach(seriesConfig => {
          const seriesValue = Number(row[seriesConfig.column]);
          if (isValidNumber(seriesValue)) {
            processedRow[seriesConfig.column] = seriesValue;
          }
        });
      }

      return processedRow;
    })
    .filter(row => row !== null);

  console.log('Scatter chart data prepared (no aggregation):', processedData);
  return processedData;
};

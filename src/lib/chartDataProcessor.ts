
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { SankeyData, isValidNumber, sortData, aggregateData } from './chartDataUtils';

export const prepareChartData = (
  data: DataRow[],
  columns: ColumnInfo[],
  chartType: string,
  xColumn: string,
  yColumn: string,
  series: SeriesConfig[],
  sortColumn: string,
  sortDirection: 'asc' | 'desc',
  stackColumn: string,
  sankeyTargetColumn: string,
  supportsMultipleSeries: boolean,
  numericColumns: ColumnInfo[]
): DataRow[] | SankeyData => {
  if (!xColumn || !yColumn) return [];

  const xCol = columns.find(col => col.name === xColumn);
  const yCol = columns.find(col => col.name === yColumn);

  if (!xCol || !yCol) return [];

  console.log('Preparing chart data for:', { xColumn, yColumn, chartType, series });

  const sortedData = sortData(data, sortColumn, sortDirection);

  if (chartType === 'sankey') {
    if (!sankeyTargetColumn) return { nodes: [], links: [] };
    
    const sankeyData = sortedData.reduce((acc, row) => {
      const source = row[xColumn]?.toString() || 'Unknown';
      const target = row[sankeyTargetColumn]?.toString() || 'Unknown';
      const value = Number(row[yColumn]);
      
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
  }

  if (chartType === 'treemap') {
    const grouped = sortedData.reduce((acc, row) => {
      const category = row[xColumn]?.toString() || 'Unknown';
      const value = Number(row[yColumn]);
      if (isValidNumber(value)) {
        acc[category] = (acc[category] || 0) + value;
      }
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(grouped)
      .filter(([, value]) => isValidNumber(value) && value > 0)
      .map(([name, value]) => ({
        name,
        size: value,
        value
      }));

    console.log('Treemap data prepared:', result);
    return result;
  }

  if (chartType === 'heatmap') {
    const heatmapData = sortedData.reduce((acc, row) => {
      const xValue = row[xColumn]?.toString() || 'Unknown';
      const yValue = row[yColumn]?.toString() || 'Unknown';
      const key = `${xValue}_${yValue}`;
      
      let value = 1;
      const firstNumericCol = numericColumns[0];
      if (firstNumericCol) {
        const numValue = Number(row[firstNumericCol.name]);
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
  }

  if (chartType === 'stacked-bar') {
    if (!stackColumn) return [];
    
    const grouped = sortedData.reduce((acc, row) => {
      const xValue = row[xColumn]?.toString() || 'Unknown';
      const stackValue = row[stackColumn]?.toString() || 'Unknown';
      const yValue = Number(row[yColumn]);
      
      if (!isValidNumber(yValue)) return acc;
      
      if (!acc[xValue]) {
        acc[xValue] = { [xColumn]: xValue };
      }
      
      acc[xValue][stackValue] = (acc[xValue][stackValue] || 0) + yValue;
      return acc;
    }, {} as Record<string, any>);

    const result = Object.values(grouped);
    console.log('Stacked bar data prepared:', result);
    return result;
  }

  if (chartType === 'pie') {
    const grouped = sortedData.reduce((acc, row) => {
      const category = row[xColumn]?.toString() || 'Unknown';
      const value = Number(row[yColumn]);
      if (isValidNumber(value)) {
        acc[category] = (acc[category] || 0) + value;
      }
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(grouped)
      .filter(([, value]) => isValidNumber(value))
      .map(([name, value]) => ({
        name,
        value,
        [yColumn]: value
      }));

    console.log('Pie chart data prepared:', result);
    return result;
  }

  const aggregatedData = aggregateData(sortedData, xColumn, yColumn, series);
  
  if (chartType === 'scatter' && xCol.type === 'numeric' && yCol.type === 'numeric') {
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
  }

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

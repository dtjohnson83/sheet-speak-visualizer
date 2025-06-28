import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
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
  numericColumns: ColumnInfo[],
  aggregationMethod: AggregationMethod = 'sum',
  valueColumn?: string
): DataRow[] | SankeyData => {
  if (!xColumn || !yColumn) return [];

  const xCol = columns.find(col => col.name === xColumn);
  const yCol = columns.find(col => col.name === yColumn);

  if (!xCol || !yCol) return [];

  console.log('Preparing chart data for:', { xColumn, yColumn, chartType, series, aggregationMethod, valueColumn });

  const sortedData = sortData(data, sortColumn, sortDirection);

  if (chartType === 'sankey') {
    if (!sankeyTargetColumn) return { nodes: [], links: [] };
    
    // Use valueColumn if provided, otherwise fall back to yColumn
    const sankeyValueColumn = valueColumn || yColumn;
    
    const sankeyData = sortedData.reduce((acc, row) => {
      const source = row[xColumn]?.toString() || 'Unknown';
      const target = row[sankeyTargetColumn]?.toString() || 'Unknown';
      const value = Number(row[sankeyValueColumn]);
      
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
        if (!acc[category]) acc[category] = [];
        acc[category].push(value);
      }
      return acc;
    }, {} as Record<string, number[]>);

    const result = Object.entries(grouped)
      .map(([name, values]) => ({
        name,
        size: applyAggregation(values, aggregationMethod),
        value: applyAggregation(values, aggregationMethod)
      }))
      .filter(item => item.value > 0);

    console.log('Treemap data prepared:', result);
    return result;
  }

  if (chartType === 'heatmap') {
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
      
      if (!acc[xValue][stackValue]) acc[xValue][stackValue] = [];
      acc[xValue][stackValue].push(yValue);
      
      return acc;
    }, {} as Record<string, any>);

    const result = Object.entries(grouped).map(([xValue, stackData]) => {
      const result: any = { [xColumn]: xValue };
      
      Object.entries(stackData).forEach(([stackKey, values]) => {
        if (stackKey !== xColumn && Array.isArray(values)) {
          result[stackKey] = applyAggregation(values as number[], aggregationMethod);
        }
      });
      
      return result;
    });

    console.log('Stacked bar data prepared:', result);
    return result;
  }

  if (chartType === 'pie') {
    const grouped = sortedData.reduce((acc, row) => {
      const category = row[xColumn]?.toString() || 'Unknown';
      const value = Number(row[yColumn]);
      if (isValidNumber(value)) {
        if (!acc[category]) acc[category] = [];
        acc[category].push(value);
      }
      return acc;
    }, {} as Record<string, number[]>);

    const result = Object.entries(grouped)
      .map(([name, values]) => ({
        name,
        value: applyAggregation(values, aggregationMethod),
        [yColumn]: applyAggregation(values, aggregationMethod)
      }))
      .filter(item => item.value > 0);

    console.log('Pie chart data prepared:', result);
    return result;
  }

  const aggregatedData = aggregateData(sortedData, xColumn, yColumn, series, aggregationMethod);
  
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

// Helper function for aggregation (moved from chartDataUtils to avoid circular import)
const applyAggregation = (values: number[], method: AggregationMethod): number => {
  if (values.length === 0) return 0;
  
  switch (method) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'average':
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return values.reduce((sum, val) => sum + val, 0);
  }
};


import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { prepareChartData } from '@/lib/chartDataProcessor';
import { SankeyData } from '@/lib/chartDataUtils';
import {
  BarChartRenderer,
  LineChartRenderer,
  PieChartRenderer,
  ScatterChartRenderer,
  TreemapRenderer,
  StackedBarRenderer,
  HeatmapRenderer,
  SankeyRenderer
} from './ChartRenderers';

interface ChartRendererProps {
  data: DataRow[];
  columns: ColumnInfo[];
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  sankeyTargetColumn?: string;
  valueColumn?: string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  series: SeriesConfig[];
  aggregationMethod: any;
  showDataLabels: boolean;
  supportsMultipleSeries: boolean;
  chartColors: string[];
}

export const ChartRenderer = ({
  data,
  columns,
  chartType,
  xColumn,
  yColumn,
  stackColumn,
  sankeyTargetColumn,
  valueColumn,
  sortColumn,
  sortDirection,
  series,
  aggregationMethod,
  showDataLabels,
  supportsMultipleSeries,
  chartColors
}: ChartRendererProps) => {
  console.log('ChartRenderer with sort settings:', { sortColumn, sortDirection, chartType });
  
  const numericColumns = columns.filter(col => col.type === 'numeric');

  const chartData = prepareChartData(
    data,
    columns,
    chartType as any,
    xColumn,
    yColumn,
    series,
    sortColumn,
    sortDirection,
    stackColumn,
    sankeyTargetColumn,
    supportsMultipleSeries,
    numericColumns,
    aggregationMethod,
    valueColumn
  );

  console.log('ChartRenderer prepared data length:', Array.isArray(chartData) ? chartData.length : 'non-array');

  const isSankeyData = (data: DataRow[] | SankeyData): data is SankeyData => {
    return chartType === 'sankey' && typeof data === 'object' && 'nodes' in data && 'links' in data;
  };

  const isArrayData = (data: DataRow[] | SankeyData): data is DataRow[] => {
    return Array.isArray(data);
  };

  if (!xColumn || !yColumn || (isArrayData(chartData) && chartData.length === 0) || (isSankeyData(chartData) && chartData.links.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Select columns to display chart</p>
      </div>
    );
  }

  const commonProps = {
    data: chartData as DataRow[],
    xColumn,
    yColumn,
    series,
    chartColors,
    showDataLabels
  };

  switch (chartType) {
    case 'heatmap':
      return <HeatmapRenderer data={chartData as Array<{ x: string; y: string; value: number }>} chartColors={chartColors} />;

    case 'stacked-bar':
      return <StackedBarRenderer {...commonProps} stackColumn={stackColumn} originalData={data} />;

    case 'treemap':
      return <TreemapRenderer data={chartData as DataRow[]} chartColors={chartColors} />;

    case 'sankey':
      return <SankeyRenderer data={chartData as SankeyData} chartColors={chartColors} />;

    case 'bar':
      return <BarChartRenderer {...commonProps} />;

    case 'line':
      return <LineChartRenderer {...commonProps} />;

    case 'pie':
      return <PieChartRenderer data={chartData as DataRow[]} chartColors={chartColors} />;

    case 'scatter':
      return <ScatterChartRenderer {...commonProps} />;

    default:
      return null;
  }
};

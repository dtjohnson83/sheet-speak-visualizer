
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { ColumnFormat } from '@/lib/columnFormatting';
import { ChartRenderers } from './ChartRenderers';
import { AggregationMethod } from './AggregationConfiguration';

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
  aggregationMethod: AggregationMethod;
  showDataLabels: boolean;
  supportsMultipleSeries: boolean;
  chartColors: string[];
  columnFormats?: ColumnFormat[];
  topXLimit?: number | null;
  histogramBins?: number;
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
  chartColors,
  columnFormats,
  topXLimit,
  histogramBins
}: ChartRendererProps) => {
  console.log('ChartRenderer - Rendering with data:', {
    chartType,
    dataLength: data.length,
    xColumn: xColumn?.trim(),
    yColumn: yColumn?.trim(),
    series: series.map(s => s.column),
    sample: data.slice(0, 2),
    hasValidData: data && data.length > 0
  });

  // Enhanced validation and fallback UI
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center p-4">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No chart data available</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Check your columns and filters. Make sure your data contains valid values.</p>
        </div>
      </div>
    );
  }

  const cleanXColumn = xColumn?.trim() || '';
  const cleanYColumn = yColumn?.trim() || '';

  if (!cleanXColumn || (!cleanYColumn && chartType !== 'histogram')) {
    return (
      <div className="flex items-center justify-center h-64 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-dashed border-yellow-300 dark:border-yellow-600">
        <div className="text-center p-4">
          <p className="text-lg font-medium text-yellow-700 dark:text-yellow-300 mb-2">Configuration Required</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Please select the required columns: 
            {!cleanXColumn && " X-axis column"}
            {!cleanXColumn && !cleanYColumn && " and"}
            {!cleanYColumn && chartType !== 'histogram' && " Y-axis column"}
          </p>
        </div>
      </div>
    );
  }

  // Check if selected columns exist in the data
  const dataSample = data[0] || {};
  const availableKeys = Object.keys(dataSample);
  
  if (!availableKeys.includes(cleanXColumn)) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-dashed border-red-300 dark:border-red-600">
        <div className="text-center p-4">
          <p className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">Column Mismatch</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            X-column "{cleanXColumn}" not found in data. Available: {availableKeys.slice(0, 5).join(', ')}
            {availableKeys.length > 5 && '...'}
          </p>
        </div>
      </div>
    );
  }

  if (chartType !== 'histogram' && !availableKeys.includes(cleanYColumn)) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-dashed border-red-300 dark:border-red-600">
        <div className="text-center p-4">
          <p className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">Column Mismatch</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Y-column "{cleanYColumn}" not found in data. Available: {availableKeys.slice(0, 5).join(', ')}
            {availableKeys.length > 5 && '...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChartRenderers
      chartType={chartType}
      data={data}
      columns={columns}
      xColumn={cleanXColumn}
      yColumn={cleanYColumn}
      stackColumn={stackColumn}
      sankeyTargetColumn={sankeyTargetColumn}
      valueColumn={valueColumn}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      series={series}
      showDataLabels={showDataLabels}
      chartColors={chartColors}
      aggregationMethod={aggregationMethod}
    />
  );
};

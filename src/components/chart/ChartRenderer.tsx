
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { ColumnFormat } from '@/lib/columnFormatting';
import { ChartRenderers } from './ChartRenderers';
import { AggregationMethod } from './AggregationConfiguration';

interface ChartRendererProps {
  data: DataRow[] | any; // Allow both array and structured data
  columns: ColumnInfo[];
  chartType: string;
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  stackColumn?: string;
  
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
  mapboxApiKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const ChartRenderer = ({
  data,
  columns,
  chartType,
  xColumn,
  yColumn,
  zColumn,
  stackColumn,
  
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
  histogramBins,
  mapboxApiKey,
  xAxisLabel,
  yAxisLabel
}: ChartRendererProps) => {
  console.log('ChartRenderer - Rendering with data:', {
    chartType,
    dataType: typeof data,
    isArray: Array.isArray(data),
    dataLength: Array.isArray(data) ? data.length : 'structured',
    xColumn: xColumn?.trim(),
    yColumn: yColumn?.trim(),
    series: series.map(s => s.column),
    sample: Array.isArray(data) ? data.slice(0, 2) : data,
    hasValidData: data && (Array.isArray(data) ? data.length > 0 : true)
  });

  // Enhanced validation based on chart type
  const validateChartData = () => {
    if (!data) return false;

    switch (chartType) {
      case 'heatmap':
        // For heatmap, check if data is array with proper structure
        return Array.isArray(data) && data.length > 0;
      case 'treemap':
        // For treemap, check if data is array with proper structure
        return Array.isArray(data) && data.length > 0;
      default:
        // For standard charts, check if data is array with length
        return Array.isArray(data) && data.length > 0;
    }
  };

  if (!validateChartData()) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center p-4">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No chart data available</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check your columns and filters. Make sure your data contains valid values.
          </p>
        </div>
      </div>
    );
  }

  const cleanXColumn = xColumn?.trim() || '';
  const cleanYColumn = yColumn?.trim() || '';

  // Skip column validation for chart types that transform their data structure
  const transformedDataChartTypes = ['heatmap', 'treemap'];
  const skipColumnValidation = transformedDataChartTypes.includes(chartType);

  if (!skipColumnValidation) {
    // Check for basic required columns
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

    // Special validation for stacked bar charts - require stack column
    if (chartType === 'stacked-bar' && !stackColumn) {
      return (
        <div className="flex items-center justify-center h-64 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-dashed border-yellow-300 dark:border-yellow-600">
          <div className="text-center p-4">
            <p className="text-lg font-medium text-yellow-700 dark:text-yellow-300 mb-2">Configuration Required</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Stacked bar charts require a "Stack By" column to group the data. Please select a categorical column for stacking.
            </p>
          </div>
        </div>
      );
    }

    // Special validation for 3D charts - require Z column
    if ((chartType === 'scatter3d' || chartType === 'surface3d') && !zColumn) {
      return (
        <div className="flex items-center justify-center h-64 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-dashed border-yellow-300 dark:border-yellow-600">
          <div className="text-center p-4">
            <p className="text-lg font-medium text-yellow-700 dark:text-yellow-300 mb-2">Configuration Required</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {chartType === 'scatter3d' ? '3D Scatter plots' : '3D Surface plots'} require a Z-axis column for the third dimension. Please select a numeric column for the Z-axis.
            </p>
          </div>
        </div>
      );
    }

    // Check if selected columns exist in the data (only for array data)
    if (Array.isArray(data) && data.length > 0) {
      const dataSample = data[0] || {};
      const availableKeys = Object.keys(dataSample);
      
      // Debug logging for column validation
      console.log('Chart column validation:', {
        chartType,
        requestedColumns: { 
          x: cleanXColumn, 
          y: cleanYColumn, 
          z: zColumn?.trim() || '' 
        },
        availableKeys,
        dataLength: data.length
      });
      
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

      // For stacked-bar charts, Y-column gets transformed into stack value columns, so skip Y-column validation
      if (chartType !== 'histogram' && chartType !== 'stacked-bar' && !availableKeys.includes(cleanYColumn)) {
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

      // Check Z-column for 3D charts
      if ((chartType === 'scatter3d' || chartType === 'surface3d') && zColumn) {
        const cleanZColumn = zColumn?.trim() || '';
        
        // Debug logging for Z-column validation
        console.log('3D Chart Z-column validation:', {
          zColumn,
          cleanZColumn,
          availableKeys,
          exactMatch: availableKeys.includes(cleanZColumn),
          caseSensitiveMatch: availableKeys.find(key => key.toLowerCase() === cleanZColumn.toLowerCase()),
          trimmedMatch: availableKeys.find(key => key.trim() === cleanZColumn)
        });
        
        if (!availableKeys.includes(cleanZColumn)) {
          // Try case-insensitive and trimmed matching
          const caseInsensitiveMatch = availableKeys.find(key => 
            key.toLowerCase().trim() === cleanZColumn.toLowerCase().trim()
          );
          
          if (!caseInsensitiveMatch) {
            return (
              <div className="flex items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-dashed border-red-300 dark:border-red-600">
                <div className="text-center p-4">
                  <p className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">Column Mismatch</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Z-column "{cleanZColumn}" not found in data. Available: {availableKeys.join(', ')}
                  </p>
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">Debug Info</summary>
                    <div className="mt-1 text-left">
                      Original: "{zColumn}"<br/>
                      Cleaned: "{cleanZColumn}"<br/>
                      Available: [{availableKeys.map(k => `"${k}"`).join(', ')}]
                    </div>
                  </details>
                </div>
              </div>
            );
          }
        }
      }
    }
  }

  return (
    <ChartRenderers
      chartType={chartType as any}
      data={data}
      columns={columns}
      xColumn={cleanXColumn}
      yColumn={cleanYColumn}
      zColumn={zColumn}
      stackColumn={stackColumn}
      
      valueColumn={valueColumn}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      series={series}
      showDataLabels={showDataLabels}
      chartColors={chartColors}
      aggregationMethod={aggregationMethod}
      mapboxApiKey={mapboxApiKey}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
    />
  );
};

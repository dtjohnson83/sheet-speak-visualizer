
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartHeader } from './ChartHeader';
import { ChartRenderer } from './ChartRenderer';
import { TemporalChartWrapper } from './TemporalChartWrapper';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { prepareChartData } from '@/lib/chartDataProcessor';
import { ColumnFormat } from '@/lib/columnFormatting';
import { logChartOperation } from '@/lib/logger';
import { detectTemporalColumns } from '@/lib/chart/temporalDataProcessor';

interface ChartContainerProps {
  data: DataRow[];
  columns: ColumnInfo[];
  chartType: string;
  xColumn: string;
  yColumn: string;
  zColumn?: string;
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
  onSaveTile?: () => void;
  customTitle?: string;
  onTitleChange?: (title: string) => void;
  columnFormats?: ColumnFormat[];
  topXLimit?: number | null;
  histogramBins?: number;
  mapboxApiKey?: string;
}

export const ChartContainer = React.memo(({
  data,
  columns,
  chartType,
  xColumn,
  yColumn,
  zColumn,
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
  onSaveTile,
  customTitle,
  onTitleChange,
  columnFormats,
  topXLimit,
  histogramBins,
  mapboxApiKey
}: ChartContainerProps) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const numericColumns = React.useMemo(() => 
    columns.filter(col => col.type === 'numeric'), 
    [columns]
  );

  logChartOperation('input', { 
    xColumn: xColumn?.trim(), 
    yColumn: yColumn?.trim(), 
    chartType,
    dataLength: data.length,
    seriesCount: series.length
  }, 'ChartContainer');

  // Prepare chart data for both header display and chart rendering
  const chartData = React.useMemo(() => prepareChartData(
    data,
    columns,
    chartType as any,
    xColumn?.trim() || '',
    yColumn?.trim() || '',
    series,
    sortColumn,
    sortDirection,
    stackColumn,
    sankeyTargetColumn,
    supportsMultipleSeries,
    numericColumns,
    aggregationMethod,
    valueColumn,
    columnFormats,
    topXLimit,
    histogramBins
  ), [data, columns, chartType, xColumn, yColumn, series, sortColumn, sortDirection, stackColumn, sankeyTargetColumn, supportsMultipleSeries, numericColumns, aggregationMethod, valueColumn, columnFormats, topXLimit, histogramBins]);

  // Handle different data types for different chart types
  const processedDataForChart = React.useMemo(() => {
    const structuredDataChartTypes = ['sankey', 'heatmap', 'treemap'];
    const result = structuredDataChartTypes.includes(chartType) 
      ? chartData  // Pass structured data directly for charts that need it
      : (Array.isArray(chartData) ? chartData : []); // Convert to array for standard charts
    
    logChartOperation('processed', {
      chartType,
      originalDataLength: data.length,
      processedDataLength: Array.isArray(result) ? result.length : 'structured',
      isStructuredData: structuredDataChartTypes.includes(chartType)
    }, 'ChartContainer');
    
    return result;
  }, [chartData, chartType, data.length]);

  return (
    <Card className="p-6 group chart-container" ref={chartRef}>
      <ChartHeader
        chartType={chartType}
        xColumn={xColumn}
        yColumn={yColumn}
        sankeyTargetColumn={sankeyTargetColumn}
        series={series}
        stackColumn={stackColumn}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        showDataLabels={showDataLabels}
        aggregationMethod={aggregationMethod}
        chartData={chartData}
        onSaveTile={onSaveTile}
        customTitle={customTitle}
        onTitleChange={onTitleChange}
        chartRef={chartRef}
      />
      
      <div className="w-full mt-6">
        {(() => {
          // Check if this chart has temporal data suitable for animation
          const temporalColumns = detectTemporalColumns(columns, data);
          const hasTemporalData = temporalColumns.length > 0;
          
          // Chart types that support temporal animation
          const temporalSupportedTypes = ['bar', 'line', 'area', 'pie'];
          const supportsTemporalAnimation = temporalSupportedTypes.includes(chartType);
          
          if (hasTemporalData && supportsTemporalAnimation) {
            return (
              <TemporalChartWrapper
                data={processedDataForChart}
                columns={columns}
                chartType={chartType}
                xColumn={xColumn?.trim() || ''}
                yColumn={yColumn?.trim() || ''}
                zColumn={zColumn}
                stackColumn={stackColumn}
                sankeyTargetColumn={sankeyTargetColumn}
                valueColumn={valueColumn}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                series={series}
                aggregationMethod={aggregationMethod}
                showDataLabels={showDataLabels}
                supportsMultipleSeries={supportsMultipleSeries}
                chartColors={chartColors}
                columnFormats={columnFormats}
                topXLimit={topXLimit}
                histogramBins={histogramBins}
                chartRef={chartRef}
                mapboxApiKey={mapboxApiKey}
              />
            );
          }
          
          // Fallback to regular chart renderer for non-temporal data
          return (
            <ChartRenderer
              data={processedDataForChart}
              columns={columns}
              chartType={chartType}
              xColumn={xColumn?.trim() || ''}
              yColumn={yColumn?.trim() || ''}
              zColumn={zColumn}
              stackColumn={stackColumn}
              sankeyTargetColumn={sankeyTargetColumn}
              valueColumn={valueColumn}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              series={series}
              aggregationMethod={aggregationMethod}
              showDataLabels={showDataLabels}
              supportsMultipleSeries={supportsMultipleSeries}
              chartColors={chartColors}
              columnFormats={columnFormats}
              topXLimit={topXLimit}
              histogramBins={histogramBins}
              mapboxApiKey={mapboxApiKey}
            />
          );
        })()}
      </div>
    </Card>
  );
});

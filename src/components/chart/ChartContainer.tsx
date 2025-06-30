
import { Card } from '@/components/ui/card';
import { ChartHeader } from './ChartHeader';
import { ChartRenderer } from './ChartRenderer';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { prepareChartData } from '@/lib/chartDataProcessor';
import { ColumnFormat } from '@/lib/columnFormatting';

interface ChartContainerProps {
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
  onSaveTile?: () => void;
  customTitle?: string;
  onTitleChange?: (title: string) => void;
  columnFormats?: ColumnFormat[];
  topXLimit?: number | null;
  histogramBins?: number;
}

export const ChartContainer = ({
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
  onSaveTile,
  customTitle,
  onTitleChange,
  columnFormats,
  topXLimit,
  histogramBins
}: ChartContainerProps) => {
  const numericColumns = columns.filter(col => col.type === 'numeric');

  // Debug logging for chart input
  console.log('Chart input:', { 
    xColumn: xColumn?.trim(), 
    yColumn: yColumn?.trim(), 
    dataSample: data.slice(0, 5),
    chartType,
    series,
    originalColumns: columns.map(c => c.name)
  });

  // Prepare chart data for both header display and chart rendering
  const chartData = prepareChartData(
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
  );

  // Handle different data types for different chart types
  const structuredDataChartTypes = ['sankey', 'heatmap', 'treemap'];
  const processedDataForChart = structuredDataChartTypes.includes(chartType) 
    ? chartData  // Pass structured data directly for charts that need it
    : (Array.isArray(chartData) ? chartData : []); // Convert to array for standard charts

  console.log('ChartContainer - Processed data for chart:', {
    chartType,
    originalDataLength: data.length,
    processedDataLength: Array.isArray(processedDataForChart) ? processedDataForChart.length : 'structured',
    isStructuredData: structuredDataChartTypes.includes(chartType),
    sample: Array.isArray(processedDataForChart) ? processedDataForChart.slice(0, 3) : processedDataForChart,
    xColumn: xColumn?.trim(),
    yColumn: yColumn?.trim()
  });

  return (
    <Card className="p-6 group">
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
      />
      
      <div className="w-full overflow-x-auto mt-6">
        <ChartRenderer
          data={processedDataForChart}
          columns={columns}
          chartType={chartType}
          xColumn={xColumn?.trim() || ''}
          yColumn={yColumn?.trim() || ''}
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
        />
      </div>
    </Card>
  );
};

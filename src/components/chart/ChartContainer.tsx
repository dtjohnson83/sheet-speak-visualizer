
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

  // Prepare chart data for both header display and chart rendering
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
    valueColumn,
    columnFormats,
    topXLimit,
    histogramBins
  );

  // Ensure we have array data for chart rendering (some chart types return different structures)
  const processedDataForChart = Array.isArray(chartData) ? chartData : [];

  console.log('ChartContainer - Processed data for chart:', {
    chartType,
    originalDataLength: data.length,
    processedDataLength: processedDataForChart.length,
    sample: processedDataForChart.slice(0, 3)
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
          xColumn={xColumn}
          yColumn={yColumn}
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

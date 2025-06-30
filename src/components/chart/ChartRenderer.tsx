
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
    xColumn,
    yColumn,
    series: series.map(s => s.column),
    sample: data.slice(0, 2)
  });

  // Validate that we have the minimum required data and configuration
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available to display.</p>
      </div>
    );
  }

  if (!xColumn || (!yColumn && chartType !== 'histogram')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select the required columns to display the chart.</p>
      </div>
    );
  }

  return (
    <ChartRenderers
      chartType={chartType}
      data={data}
      columns={columns}
      xColumn={xColumn}
      yColumn={yColumn}
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

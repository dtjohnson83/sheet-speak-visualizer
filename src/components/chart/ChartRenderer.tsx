
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

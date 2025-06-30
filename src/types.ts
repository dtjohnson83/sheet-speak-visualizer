
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';

export interface ChartRenderersProps {
  chartType: string;
  data: DataRow[] | any; // Allow both array and structured data types
  columns: ColumnInfo[];
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  sankeyTargetColumn?: string;
  valueColumn?: string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  series: SeriesConfig[];
  showDataLabels: boolean;
  chartColors: string[];
  aggregationMethod?: AggregationMethod;
}

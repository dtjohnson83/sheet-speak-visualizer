
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';

export interface ChartRenderersProps {
  chartType: string;
  data: DataRow[];
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
}

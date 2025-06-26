
import { Card } from '@/components/ui/card';
import { ChartHeader } from './ChartHeader';
import { ChartRenderer } from './ChartRenderer';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { prepareChartData } from '@/lib/chartDataProcessor';

interface ChartContainerProps {
  data: DataRow[];
  columns: ColumnInfo[];
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  sankeyTargetColumn?: string;
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
}

export const ChartContainer = ({
  data,
  columns,
  chartType,
  xColumn,
  yColumn,
  stackColumn,
  sankeyTargetColumn,
  sortColumn,
  sortDirection,
  series,
  aggregationMethod,
  showDataLabels,
  supportsMultipleSeries,
  chartColors,
  onSaveTile,
  customTitle,
  onTitleChange
}: ChartContainerProps) => {
  const numericColumns = columns.filter(col => col.type === 'numeric');

  // Prepare chart data for header display
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
    aggregationMethod
  );

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
          data={data}
          columns={columns}
          chartType={chartType}
          xColumn={xColumn}
          yColumn={yColumn}
          stackColumn={stackColumn}
          sankeyTargetColumn={sankeyTargetColumn}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          series={series}
          aggregationMethod={aggregationMethod}
          showDataLabels={showDataLabels}
          supportsMultipleSeries={supportsMultipleSeries}
          chartColors={chartColors}
        />
      </div>
    </Card>
  );
};

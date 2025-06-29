
import { ColumnInfo } from '@/pages/Index';
import { ChartTypeSelector } from './config/ChartTypeSelector';
import { AxisConfiguration } from './config/AxisConfiguration';
import { SpecializedConfiguration } from './config/SpecializedConfiguration';
import { SortConfiguration } from './config/SortConfiguration';
import { StyleConfiguration } from './config/StyleConfiguration';

interface ChartConfigurationProps {
  chartType: string;
  xColumn: string;
  setXColumn: (value: string) => void;
  yColumn: string;
  setYColumn: (value: string) => void;
  stackColumn: string;
  setStackColumn: (value: string) => void;
  sankeyTargetColumn: string;
  setSankeyTargetColumn: (value: string) => void;
  valueColumn: string;
  setValueColumn: (value: string) => void;
  sortColumn: string;
  setSortColumn: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
  setChartType: (value: any) => void;
  showDataLabels: boolean;
  setShowDataLabels: (value: boolean) => void;
  supportsDataLabels: boolean;
  selectedPalette: string;
  setSelectedPalette: (value: string) => void;
  topXLimit: number | null;
  setTopXLimit: (value: number | null) => void;
  supportsTopXLimit: boolean;
  histogramBins: number;
  setHistogramBins: (value: number) => void;
  columns: ColumnInfo[];
  numericColumns: ColumnInfo[];
  categoricalColumns: ColumnInfo[];
  dateColumns: ColumnInfo[];
}

export const ChartConfiguration = ({
  chartType,
  setChartType,
  xColumn,
  setXColumn,
  yColumn,
  setYColumn,
  stackColumn,
  setStackColumn,
  valueColumn,
  setValueColumn,
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  showDataLabels,
  setShowDataLabels,
  supportsDataLabels,
  selectedPalette,
  setSelectedPalette,
  topXLimit,
  setTopXLimit,
  supportsTopXLimit,
  histogramBins,
  setHistogramBins,
  columns,
  numericColumns,
  categoricalColumns,
  dateColumns
}: ChartConfigurationProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <ChartTypeSelector
          chartType={chartType}
          setChartType={setChartType}
        />

        <AxisConfiguration
          chartType={chartType}
          xColumn={xColumn}
          setXColumn={setXColumn}
          yColumn={yColumn}
          setYColumn={setYColumn}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
          dateColumns={dateColumns}
        />

        <SpecializedConfiguration
          chartType={chartType}
          stackColumn={stackColumn}
          setStackColumn={setStackColumn}
          valueColumn={valueColumn}
          setValueColumn={setValueColumn}
          histogramBins={histogramBins}
          setHistogramBins={setHistogramBins}
          topXLimit={topXLimit}
          setTopXLimit={setTopXLimit}
          supportsTopXLimit={supportsTopXLimit}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
        />

        <SortConfiguration
          sortColumn={sortColumn}
          setSortColumn={setSortColumn}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          columns={columns}
        />
      </div>

      <StyleConfiguration
        selectedPalette={selectedPalette}
        setSelectedPalette={setSelectedPalette}
        showDataLabels={showDataLabels}
        setShowDataLabels={setShowDataLabels}
        supportsDataLabels={supportsDataLabels}
      />
    </>
  );
};

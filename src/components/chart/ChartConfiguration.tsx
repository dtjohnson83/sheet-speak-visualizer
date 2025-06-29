
import { ColumnInfo } from '@/pages/Index';
import { ChartTypeSection } from './config/ChartTypeSection';
import { ColumnSelectorsSection } from './config/ColumnSelectorsSection';
import { SortControlsSection } from './config/SortControlsSection';
import { ChartOptionsSection } from './config/ChartOptionsSection';
import { AutoSelectSection } from './config/AutoSelectSection';

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
  columns,
  numericColumns,
  categoricalColumns,
  dateColumns
}: ChartConfigurationProps) => {
  
  // Debug logging
  console.log('ChartConfiguration received:', {
    chartType,
    columns: columns.map(col => ({ name: col.name, type: col.type, worksheet: col.worksheet || 'default' })),
    numericColumns: numericColumns.map(col => ({ name: col.name, type: col.type, worksheet: col.worksheet || 'default' })),
    categoricalColumns: categoricalColumns.map(col => ({ name: col.name, type: col.type, worksheet: col.worksheet || 'default' })),
    dateColumns: dateColumns.map(col => ({ name: col.name, type: col.type, worksheet: col.worksheet || 'default' })),
    currentSelections: { xColumn, yColumn, stackColumn, valueColumn, sortColumn }
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <ChartTypeSection
          chartType={chartType}
          setChartType={setChartType}
        />

        <ColumnSelectorsSection
          chartType={chartType}
          xColumn={xColumn}
          setXColumn={setXColumn}
          yColumn={yColumn}
          setYColumn={setYColumn}
          stackColumn={stackColumn}
          setStackColumn={setStackColumn}
          valueColumn={valueColumn}
          setValueColumn={setValueColumn}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
          dateColumns={dateColumns}
        />

        <SortControlsSection
          sortColumn={sortColumn}
          setSortColumn={setSortColumn}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          columns={columns}
        />
      </div>

      <ChartOptionsSection
        showDataLabels={showDataLabels}
        setShowDataLabels={setShowDataLabels}
        supportsDataLabels={supportsDataLabels}
        selectedPalette={selectedPalette}
        setSelectedPalette={setSelectedPalette}
      />

      <AutoSelectSection
        columns={columns}
        numericColumns={numericColumns}
        categoricalColumns={categoricalColumns}
        dateColumns={dateColumns}
        chartType={chartType}
        xColumn={xColumn}
        yColumn={yColumn}
        stackColumn={stackColumn}
        valueColumn={valueColumn}
        sortColumn={sortColumn}
        setXColumn={setXColumn}
        setYColumn={setYColumn}
        setStackColumn={setStackColumn}
        setValueColumn={setValueColumn}
        setSortColumn={setSortColumn}
      />
    </>
  );
};

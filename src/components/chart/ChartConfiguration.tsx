
import { Button } from '@/components/ui/button';
import { ColumnInfo } from '@/pages/Index';
import { ChartTypeSelector } from './ChartTypeSelector';
import { ColumnSelectors } from './ColumnSelectors';
import { SortControls } from './SortControls';
import { ChartOptions } from './ChartOptions';

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
  sankeyTargetColumn,
  setSankeyTargetColumn,
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
  const autoSelect = () => {
    if (!xColumn && categoricalColumns.length > 0) {
      setXColumn(categoricalColumns[0].name);
    }
    if (!yColumn && numericColumns.length > 0) {
      setYColumn(numericColumns[0].name);
    }
    if (chartType === 'stacked-bar' && !stackColumn && categoricalColumns.length > 1) {
      setStackColumn(categoricalColumns[1].name);
    }
    if (chartType === 'sankey' && !yColumn && categoricalColumns.length > 1) {
      setYColumn(categoricalColumns[1].name);
    }
    if ((chartType === 'heatmap' || chartType === 'sankey') && !valueColumn && numericColumns.length > 0) {
      setValueColumn(numericColumns[0].name);
    }
    if (sortColumn === 'none' && numericColumns.length > 0) {
      setSortColumn(numericColumns[0].name);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <ChartTypeSelector
          chartType={chartType}
          setChartType={setChartType}
        />

        <ColumnSelectors
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

        <SortControls
          sortColumn={sortColumn}
          setSortColumn={setSortColumn}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          columns={columns}
        />
      </div>

      <ChartOptions
        showDataLabels={showDataLabels}
        setShowDataLabels={setShowDataLabels}
        supportsDataLabels={supportsDataLabels}
        selectedPalette={selectedPalette}
        setSelectedPalette={setSelectedPalette}
      />

      <div className="flex justify-end mb-8">
        <Button 
          onClick={autoSelect}
          disabled={!columns.length}
        >
          Auto-select
        </Button>
      </div>
    </>
  );
};

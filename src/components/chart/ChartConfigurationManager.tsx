
import { ColumnInfo } from '@/pages/Index';
import { useChartState } from '@/hooks/useChartState';
import { SeriesManager } from './SeriesManager';
import { ChartConfiguration } from './ChartConfiguration';
import { AggregationConfiguration } from './AggregationConfiguration';

interface ChartConfigurationManagerProps {
  columns: ColumnInfo[];
  customTitle: string;
  setCustomTitle: (title: string) => void;
  valueColumn: string;
  setValueColumn: (value: string) => void;
}

export const ChartConfigurationManager = ({
  columns,
  customTitle,
  setCustomTitle,
  valueColumn,
  setValueColumn
}: ChartConfigurationManagerProps) => {
  const {
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
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    series,
    setSeries,
    aggregationMethod,
    setAggregationMethod,
    showDataLabels,
    setShowDataLabels,
    selectedPalette,
    setSelectedPalette,
    chartColors,
    supportsMultipleSeries,
    supportsDataLabels
  } = useChartState();

  console.log('ChartConfigurationManager columns:', columns.length, columns.map(col => ({ 
    name: col.name, 
    type: col.type, 
    worksheet: col.worksheet || 'default' 
  })));
  
  // Ensure we have valid columns and filter them properly
  const validColumns = columns.filter(col => col && col.name && col.type);
  
  // Filter columns properly, ensuring they exist and have the right types
  const numericColumns = validColumns.filter(col => col.type === 'numeric');
  const categoricalColumns = validColumns.filter(col => 
    col.type === 'categorical' || col.type === 'text'
  );
  const dateColumns = validColumns.filter(col => col.type === 'date');

  console.log('Filtered columns in manager:', {
    total: validColumns.length,
    numeric: numericColumns.length,
    categorical: categoricalColumns.length,
    date: dateColumns.length,
    numericNames: numericColumns.map(col => col.name),
    categoricalNames: categoricalColumns.map(col => col.name),
    dateNames: dateColumns.map(col => col.name)
  });

  return (
    <div className="space-y-4">
      <ChartConfiguration
        chartType={chartType}
        setChartType={setChartType}
        xColumn={xColumn}
        setXColumn={setXColumn}
        yColumn={yColumn}
        setYColumn={setYColumn}
        stackColumn={stackColumn}
        setStackColumn={setStackColumn}
        sankeyTargetColumn={sankeyTargetColumn}
        setSankeyTargetColumn={setSankeyTargetColumn}
        valueColumn={valueColumn}
        setValueColumn={setValueColumn}
        sortColumn={sortColumn}
        setSortColumn={setSortColumn}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        showDataLabels={showDataLabels}
        setShowDataLabels={setShowDataLabels}
        supportsDataLabels={supportsDataLabels}
        selectedPalette={selectedPalette}
        setSelectedPalette={setSelectedPalette}
        columns={validColumns}
        numericColumns={numericColumns}
        categoricalColumns={categoricalColumns}
        dateColumns={dateColumns}
      />

      <AggregationConfiguration
        aggregationMethod={aggregationMethod}
        setAggregationMethod={setAggregationMethod}
        yColumn={yColumn}
        chartType={chartType}
        numericColumns={numericColumns}
      />

      {supportsMultipleSeries && (
        <SeriesManager
          series={series}
          setSeries={setSeries}
          numericColumns={numericColumns}
          yColumn={yColumn}
          chartColors={chartColors}
        />
      )}
    </div>
  );
};

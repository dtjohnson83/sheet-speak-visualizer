
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

  console.log('ChartConfigurationManager active columns:', columns.map(col => ({ 
    name: col.name, 
    type: col.type, 
    worksheet: col.worksheet || 'default' 
  })));
  
  // Filter columns properly, ensuring they exist and have the right types
  const numericColumns = columns.filter(col => 
    col && col.type === 'numeric' && col.name
  );
  const categoricalColumns = columns.filter(col => 
    col && (col.type === 'categorical' || col.type === 'text') && col.name
  );
  const dateColumns = columns.filter(col => 
    col && col.type === 'date' && col.name
  );

  console.log('Filtered columns:', {
    numeric: numericColumns.map(col => col.name),
    categorical: categoricalColumns.map(col => col.name),
    date: dateColumns.map(col => col.name)
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
        columns={columns}
        numericColumns={numericColumns}
        categoricalColumns={categoricalColumns}
        dateColumns={dateColumns}
        chartState={{
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
          supportsDataLabels,
          valueColumn,
          setValueColumn,
          numericColumns,
          categoricalColumns,
          dateColumns
        }}
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


import { DataRow, ColumnInfo } from '@/pages/Index';
import { WorksheetData } from '@/types/worksheet';
import { useChartState } from '@/hooks/useChartState';
import { SeriesManager } from './chart/SeriesManager';
import { ChartConfiguration } from './chart/ChartConfiguration';
import { AggregationConfiguration } from './chart/AggregationConfiguration';
import { ChartContainer } from './chart/ChartContainer';
import { DataSourceSelector } from './chart/DataSourceSelector';
import { DashboardTileData } from './dashboard/DashboardTile';
import { useState } from 'react';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
  worksheets: WorksheetData[];
  selectedWorksheet: WorksheetData | null;
  onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void;
}

export const ChartVisualization = ({ 
  data, 
  columns, 
  worksheets, 
  selectedWorksheet, 
  onSaveTile 
}: ChartVisualizationProps) => {
  const [customTitle, setCustomTitle] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');
  const [chartDataSource, setChartDataSource] = useState<WorksheetData | null>(selectedWorksheet);

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

  // Use data from selected chart data source
  const activeData = chartDataSource?.data || data;
  const activeColumns = chartDataSource?.columns || columns;
  
  const numericColumns = activeColumns.filter(col => col.type === 'numeric');
  const categoricalColumns = activeColumns.filter(col => col.type === 'categorical' || col.type === 'text');
  const dateColumns = activeColumns.filter(col => col.type === 'date');

  const handleSaveTile = () => {
    if (!xColumn || !yColumn || !onSaveTile) return;
    
    const defaultTitle = `${chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} - ${xColumn} vs ${yColumn}`;
    const title = customTitle || defaultTitle;
    
    onSaveTile({
      title,
      chartType,
      xColumn,
      yColumn,
      stackColumn,
      sankeyTargetColumn,
      valueColumn,
      sortColumn,
      sortDirection,
      series,
      showDataLabels,
      worksheetId: chartDataSource?.id
    });
  };

  const handleDataSourceChange = (worksheet: WorksheetData | null) => {
    setChartDataSource(worksheet);
    // Reset column selections when changing data source
    setXColumn('');
    setYColumn('');
    setStackColumn('');
    setValueColumn('');
    setSortColumn('none');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        
        {worksheets.length > 1 && (
          <DataSourceSelector
            worksheets={worksheets}
            selectedWorksheet={chartDataSource}
            onWorksheetChange={handleDataSourceChange}
          />
        )}
        
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
          columns={activeColumns}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
          dateColumns={dateColumns}
        />

        <div className="mt-4">
          <AggregationConfiguration
            aggregationMethod={aggregationMethod}
            setAggregationMethod={setAggregationMethod}
            yColumn={yColumn}
            chartType={chartType}
            numericColumns={numericColumns}
          />
        </div>

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

      <ChartContainer
        data={activeData}
        columns={activeColumns}
        chartType={chartType}
        xColumn={xColumn}
        yColumn={yColumn}
        stackColumn={stackColumn}
        sankeyTargetColumn={sankeyTargetColumn}
        valueColumn={valueColumn}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        series={series}
        aggregationMethod={aggregationMethod}
        showDataLabels={showDataLabels}
        supportsMultipleSeries={supportsMultipleSeries}
        chartColors={chartColors}
        onSaveTile={handleSaveTile}
        customTitle={customTitle}
        onTitleChange={setCustomTitle}
      />
    </div>
  );
};

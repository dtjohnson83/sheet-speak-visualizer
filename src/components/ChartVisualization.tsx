
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useChartState } from '@/hooks/useChartState';
import { SeriesManager } from './chart/SeriesManager';
import { ChartConfiguration } from './chart/ChartConfiguration';
import { AggregationConfiguration } from './chart/AggregationConfiguration';
import { ChartContainer } from './chart/ChartContainer';
import { DashboardTileData } from './dashboard/DashboardTile';
import { ColumnFormat } from '@/lib/columnFormatting';
import { useState, useEffect } from 'react';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void;
  columnFormats?: ColumnFormat[];
}

export const ChartVisualization = ({ data, columns, onSaveTile, columnFormats }: ChartVisualizationProps) => {
  const [customTitle, setCustomTitle] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');

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
    topXLimit,
    setTopXLimit,
    histogramBins,
    setHistogramBins,
    chartColors,
    supportsMultipleSeries,
    supportsDataLabels,
    supportsTopXLimit
  } = useChartState();

  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => col.type === 'categorical' || col.type === 'text');
  const dateColumns = columns.filter(col => col.type === 'date');

  // Debug logging for series management
  useEffect(() => {
    console.log('ChartVisualization - State update:', {
      chartType,
      supportsMultipleSeries,
      xColumn,
      yColumn,
      numericColumnsCount: numericColumns.length,
      numericColumns: numericColumns.map(c => c.name),
      seriesCount: series.length,
      series: series.map(s => ({ id: s.id, column: s.column }))
    });
  }, [chartType, supportsMultipleSeries, xColumn, yColumn, numericColumns, series]);

  const handleSaveTile = () => {
    if (!xColumn || (!yColumn && chartType !== 'histogram') || !onSaveTile) return;
    
    const defaultTitle = `${chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} - ${xColumn}${yColumn ? ` vs ${yColumn}` : ''}`;
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
      showDataLabels
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        
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
          topXLimit={topXLimit}
          setTopXLimit={setTopXLimit}
          supportsTopXLimit={supportsTopXLimit}
          histogramBins={histogramBins}
          setHistogramBins={setHistogramBins}
          columns={columns}
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

        {/* Debug panel - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h5 className="font-medium mb-2">Debug Information</h5>
            <div className="text-sm space-y-1">
              <div>Chart Type: {chartType} (supports series: {supportsMultipleSeries ? 'Yes' : 'No'})</div>
              <div>Data Rows: {data.length}</div>
              <div>Total Columns: {columns.length}</div>
              <div>Numeric Columns: {numericColumns.length} ({numericColumns.map(c => c.name).join(', ')})</div>
              <div>Selected X: {xColumn || 'None'}</div>
              <div>Selected Y: {yColumn || 'None'}</div>
              <div>Series Count: {series.length}</div>
              <div>Top X Limit: {topXLimit || 'None'}</div>
            </div>
          </div>
        )}
      </div>

      <ChartContainer
        data={data}
        columns={columns}
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
        columnFormats={columnFormats}
        topXLimit={topXLimit}
        histogramBins={histogramBins}
      />
    </div>
  );
};

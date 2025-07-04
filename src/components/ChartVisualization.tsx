
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useChartState } from '@/hooks/useChartState';
import { SeriesManager } from './chart/SeriesManager';
import { ChartConfiguration } from './chart/ChartConfiguration';
import { AggregationConfiguration } from './chart/AggregationConfiguration';
import { ChartContainer } from './chart/ChartContainer';
import { AIChartGenerator } from './chart/AIChartGenerator';
import { SmartChartDefaults } from './chart/SmartChartDefaults';
import { DashboardTileData } from './dashboard/DashboardTile';
import { ColumnFormat } from '@/lib/columnFormatting';
import { useState, useEffect } from 'react';
import { useAIChartGeneration, AIChartSuggestion } from '@/hooks/useAIChartGeneration';

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
    histogramBins,
    setHistogramBins,
    chartColors,
    supportsMultipleSeries,
    supportsDataLabels
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
      sankeyTargetColumn,
      valueColumn,
      numericColumnsCount: numericColumns.length,
      numericColumns: numericColumns.map(c => c.name),
      seriesCount: series.length,
      series: series.map(s => ({ id: s.id, column: s.column }))
    });
  }, [chartType, supportsMultipleSeries, xColumn, yColumn, sankeyTargetColumn, valueColumn, numericColumns, series]);

  const handleSaveTile = () => {
    if (!xColumn || (!yColumn && chartType !== 'histogram') || !onSaveTile) return;
    
    const defaultTitle = `${chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} - ${xColumn}${yColumn ? ` vs ${yColumn}` : ''}`;
    const title = customTitle || defaultTitle;
    
    const tileData = {
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
    };

    console.log('ChartVisualization - handleSaveTile - Preparing tile data:', {
      chartType,
      sankeyTargetColumn,
      valueColumn,
      fullTileData: tileData
    });
    
    onSaveTile(tileData);
  };

  // Handle smart defaults application
  const handleApplySmartDefaults = (config: {
    chartType: string;
    xColumn: string;
    yColumn: string;
    aggregationMethod: string;
    reasoning: string;
  }) => {
    setChartType(config.chartType as any);
    setXColumn(config.xColumn);
    setYColumn(config.yColumn);
    setAggregationMethod(config.aggregationMethod as any);
    
    console.log('Applied smart defaults:', config);
  };

  // Handle AI suggestion application
  const handleApplyAISuggestion = (suggestion: AIChartSuggestion) => {
    setChartType(suggestion.chartType as any);
    setXColumn(suggestion.xColumn);
    setYColumn(suggestion.yColumn);
    setValueColumn(suggestion.valueColumn || '');
    setStackColumn(suggestion.stackColumn || '');
    setAggregationMethod(suggestion.aggregationMethod);
    setSeries(suggestion.series);
    setCustomTitle(suggestion.title);
    
    console.log('Applied AI suggestion:', suggestion);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        
        {/* Smart Chart Defaults */}
        <SmartChartDefaults
          data={data}
          columns={columns}
          currentChartType={chartType}
          onApplyDefaults={handleApplySmartDefaults}
        />

        {/* AI Chart Generator */}
        <AIChartGenerator 
          data={data}
          columns={columns}
          onApplySuggestion={handleApplyAISuggestion}
        />
        
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
          histogramBins={histogramBins}
          setHistogramBins={setHistogramBins}
          aggregationMethod={aggregationMethod}
          setAggregationMethod={setAggregationMethod}
          columns={columns}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
          dateColumns={dateColumns}
          data={data}
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
        histogramBins={histogramBins}
      />
    </div>
  );
};

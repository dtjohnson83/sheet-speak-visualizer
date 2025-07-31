
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesManager } from './chart/SeriesManager';
import { ChartConfiguration } from './chart/ChartConfiguration';
import { AggregationConfiguration } from './chart/AggregationConfiguration';
import { ChartContainer } from './chart/ChartContainer';
import { AIChartGenerator } from './chart/AIChartGenerator';
import { SmartChartDefaults } from './chart/SmartChartDefaults';
import { DashboardTileData } from './dashboard/DashboardTile';
import { ColumnFormat } from '@/lib/columnFormatting';
import { useEffect, useMemo } from 'react';
import { useChartConfiguration } from './chart/hooks/useChartConfiguration';
import { useGraphEnhancedSemanticFusion } from '@/hooks/useGraphEnhancedSemanticFusion';
import { useGraphChartAvailability } from '@/hooks/useGraphChartAvailability';
import { convertGraphToChartData, getGraphChartColumns } from '@/lib/graphChartDataProcessor';
import { Badge } from '@/components/ui/badge';
import { Zap, Network } from 'lucide-react';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void;
  columnFormats?: ColumnFormat[];
  dataSourceName?: string;
}

export const ChartVisualization = ({ data, columns, onSaveTile, columnFormats, dataSourceName }: ChartVisualizationProps) => {
  const {
    // State
    customTitle,
    valueColumn,
    hasUserInteracted,
    chartType,
    xColumn,
    yColumn,
    zColumn,
    stackColumn,
    sankeyTargetColumn,
    sortColumn,
    sortDirection,
    series,
    aggregationMethod,
    showDataLabels,
    selectedPalette,
    histogramBins,
    chartColors,
    supportsMultipleSeries,
    supportsDataLabels,
    
    // Setters
    setCustomTitle,
    setValueColumn,
    setXColumn,
    setYColumn,
    setZColumn,
    setStackColumn,
    setSankeyTargetColumn,
    setSortColumn,
    setSortDirection,
    setSeries,
    setAggregationMethod,
    setShowDataLabels,
    setSelectedPalette,
    setHistogramBins,
    
    // Handlers
    handleChartTypeChange,
    handleApplySmartDefaults,
    handleApplyAISuggestion,
    handleSaveTile
  } = useChartConfiguration();

  // Graph chart hooks and data processing
  const { relationships, entities } = useGraphEnhancedSemanticFusion();
  const { canShowGraphCharts, graphChartTypes } = useGraphChartAvailability();

  // Process data based on chart type - use graph data for graph charts
  const { chartData, chartColumns } = useMemo(() => {
    const isGraphChart = graphChartTypes.includes(chartType);
    
    if (isGraphChart && canShowGraphCharts) {
      return {
        chartData: convertGraphToChartData(chartType as any, relationships, entities),
        chartColumns: getGraphChartColumns(chartType as any)
      };
    }
    
    return {
      chartData: data,
      chartColumns: columns
    };
  }, [chartType, data, columns, relationships, entities, canShowGraphCharts, graphChartTypes]);

  const numericColumns = chartColumns.filter(col => col.type === 'numeric');
  const categoricalColumns = chartColumns.filter(col => col.type === 'categorical' || col.type === 'text');
  const dateColumns = chartColumns.filter(col => col.type === 'date');
  
  // Show graph chart indicator when using graph data
  const isUsingGraphData = graphChartTypes.includes(chartType) && canShowGraphCharts;

  // Debug logging for series management and column types
  useEffect(() => {
    console.log('ChartVisualization - State update:', {
      chartType,
      supportsMultipleSeries,
      xColumn,
      yColumn,
      sankeyTargetColumn,
      valueColumn,
      numericColumnsCount: numericColumns.length,
      numericColumns: numericColumns.map(c => ({ name: c.name, type: c.type })),
      categoricalColumns: categoricalColumns.map(c => ({ name: c.name, type: c.type })),
      dateColumns: dateColumns.map(c => ({ name: c.name, type: c.type })),
      seriesCount: series.length,
      series: series.map(s => ({ id: s.id, column: s.column, type: s.type }))
    });
  }, [chartType, supportsMultipleSeries, xColumn, yColumn, sankeyTargetColumn, valueColumn, numericColumns, categoricalColumns, dateColumns, series]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Data Visualization</h3>
          <div className="flex items-center gap-2">
            {isUsingGraphData && (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <Network className="h-3 w-3" />
                Cross-Dataset Graph
              </Badge>
            )}
            {dataSourceName && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {dataSourceName}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Smart Chart Defaults */}
        <SmartChartDefaults
          data={chartData}
          columns={chartColumns}
          currentChartType={chartType}
          hasUserInteracted={hasUserInteracted}
          onApplyDefaults={handleApplySmartDefaults}
        />

        {/* AI Chart Generator */}
        <AIChartGenerator 
          data={chartData}
          columns={chartColumns}
          onApplySuggestion={handleApplyAISuggestion}
        />
        
        <ChartConfiguration
          chartType={chartType}
          setChartType={handleChartTypeChange}
          xColumn={xColumn}
          setXColumn={setXColumn}
          yColumn={yColumn}
          setYColumn={setYColumn}
          zColumn={zColumn}
          setZColumn={setZColumn}
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
          columns={chartColumns}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
          dateColumns={dateColumns}
          data={chartData}
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
        data={chartData}
        columns={chartColumns}
        chartType={chartType}
        xColumn={xColumn}
        yColumn={yColumn}
        zColumn={zColumn}
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
        onSaveTile={() => handleSaveTile(onSaveTile)}
        customTitle={customTitle}
        onTitleChange={setCustomTitle}
        columnFormats={columnFormats}
        histogramBins={histogramBins}
      />
    </div>
  );
};

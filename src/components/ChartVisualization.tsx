
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesManager } from './chart/SeriesManager';
import { ChartConfiguration } from './chart/ChartConfiguration';
import { AggregationConfiguration } from './chart/AggregationConfiguration';
import { ChartContainer } from './chart/ChartContainer';
import { GeospatialDataDetector } from './chart/GeospatialDataDetector';
import { GeoChartValidator } from './chart/GeoChartValidator';
import { MapboxIntegration } from './chart/MapboxIntegration';
import { AIChartGenerator } from './chart/AIChartGenerator';


import { DashboardTileData } from './dashboard/DashboardTile';
import { ColumnFormat } from '@/lib/columnFormatting';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChartConfiguration } from './chart/hooks/useChartConfiguration';
import { useGraphEnhancedSemanticFusion } from '@/hooks/useGraphEnhancedSemanticFusion';
import { useGraphChartAvailability } from '@/hooks/useGraphChartAvailability';
import { convertGraphToChartData, getGraphChartColumns } from '@/lib/graphChartDataProcessor';
import { detectTemporalColumns, TemporalAnimationConfig } from '@/lib/chart/temporalDataProcessor';
import { Badge } from '@/components/ui/badge';
import { Zap, Network } from 'lucide-react';
import { useAIChartSuggestion } from './unified-ai/AIConfiguredChart';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void;
  columnFormats?: ColumnFormat[];
  dataSourceName?: string;
}

export const ChartVisualization = ({ data, columns, onSaveTile, columnFormats, dataSourceName }: ChartVisualizationProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [mapboxApiKey, setMapboxApiKey] = useState<string>('');
  const [temporalConfig, setTemporalConfig] = useState<TemporalAnimationConfig>({
    enabled: false,
    dateColumn: '',
    timeInterval: 'month',
    animationSpeed: 1000,
    autoPlay: false,
    loop: false,
    aggregationMethod: 'sum',
    showCumulative: false
  });

  // Initialize Mapbox API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('mapbox_api_key');
    if (storedKey) {
      setMapboxApiKey(storedKey);
    }
  }, []);

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
    xAxisLabel,
    yAxisLabel,
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
    setXAxisLabel,
    setYAxisLabel,
    
    // Handlers
    handleChartTypeChange,
    handleApplySmartDefaults,
    handleApplyAISuggestion,
    handleSaveTile
  } = useChartConfiguration();

  // Get AI chart suggestion from context (if available)
  const aiChartSuggestion = useAIChartSuggestion();

  // Apply AI suggestion when available
  useEffect(() => {
    if (aiChartSuggestion && !hasUserInteracted) {
      console.log('🎯 ChartVisualization - Applying AI suggestion from context:', {
        title: aiChartSuggestion.title,
        chartType: aiChartSuggestion.chartType,
        xColumn: aiChartSuggestion.xColumn,
        yColumn: aiChartSuggestion.yColumn,
        fullSuggestion: aiChartSuggestion
      });
      handleApplyAISuggestion(aiChartSuggestion);
    }
  }, [aiChartSuggestion, hasUserInteracted, handleApplyAISuggestion]);

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
  
  // Check if current chart is a geospatial chart
  const isGeoChart = chartType === 'map2d' || chartType === 'map3d';
  const needsMapboxKey = isGeoChart && !mapboxApiKey && !import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Auto-fix for geographic columns
  const handleGeoAutoFix = (suggestions: { longitudeColumn?: string; latitudeColumn?: string }) => {
    if (suggestions.longitudeColumn) {
      setXColumn(suggestions.longitudeColumn);
    }
    if (suggestions.latitudeColumn) {
      setYColumn(suggestions.latitudeColumn);
    }
  };

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
        

        <GeospatialDataDetector data={chartData} columns={chartColumns} />
        
        {/* AI Chart Generator */}
        <AIChartGenerator 
          data={chartData}
          columns={chartColumns}
          onApplySuggestion={handleApplyAISuggestion}
        />

        {/* Mapbox Configuration for map charts */}
        {isGeoChart && (
          <MapboxIntegration
            onApiKeySet={setMapboxApiKey}
            currentApiKey={mapboxApiKey}
            isRequired={needsMapboxKey}
          />
        )}

        {/* Geographic Data Validation */}
        {isGeoChart && xColumn && yColumn && (
          <GeoChartValidator
            data={chartData}
            columns={chartColumns}
            xColumn={xColumn}
            yColumn={yColumn}
            chartType={chartType as 'map2d' | 'map3d'}
            onAutoFix={handleGeoAutoFix}
          />
        )}
        
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
          xAxisLabel={xAxisLabel}
          setXAxisLabel={setXAxisLabel}
          yAxisLabel={yAxisLabel}
          setYAxisLabel={setYAxisLabel}
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

      <div ref={chartRef}>
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
          onSaveTile={() => handleSaveTile(onSaveTile, dataSourceName)}
          customTitle={customTitle}
          onTitleChange={setCustomTitle}
          columnFormats={columnFormats}
          histogramBins={histogramBins}
          mapboxApiKey={mapboxApiKey}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
        />
      </div>
    </div>
  );
};

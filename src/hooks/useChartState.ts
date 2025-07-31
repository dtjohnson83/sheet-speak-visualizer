
import { useState, useEffect } from 'react';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { COLOR_PALETTES } from '@/components/chart/ColorPaletteSelector';

export interface SeriesConfig {
  id: string;
  column: string;
  color: string;
  type: 'bar' | 'line' | 'area';
  aggregationMethod: AggregationMethod;
  yAxisId?: string;
}

export const useChartState = () => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'heatmap' | 'stacked-bar' | 'treemap' | 'histogram' | 'kpi' | 'bar3d' | 'scatter3d' | 'surface3d' | 'network' | 'network3d' | 'entity-relationship'>('bar');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');
  const [zColumn, setZColumn] = useState<string>('');
  const [stackColumn, setStackColumn] = useState<string>('');
  const [sankeyTargetColumn, setSankeyTargetColumn] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [series, setSeries] = useState<SeriesConfig[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('sum');
  const [showDataLabels, setShowDataLabels] = useState<boolean>(false);
  const [selectedPalette, setSelectedPalette] = useState<string>('Default');
  const [histogramBins, setHistogramBins] = useState<number>(10);

  // Get colors from selected palette
  const getChartColors = () => {
    const palette = COLOR_PALETTES.find(p => p.name === selectedPalette);
    return palette ? palette.colors : COLOR_PALETTES[0].colors;
  };

  const chartColors = getChartColors();

  const multiSeriesChartTypes = ['bar', 'line', 'area', 'scatter', 'network'];
  const supportsMultipleSeries = multiSeriesChartTypes.includes(chartType);

  // Charts that support data labels
  const dataLabelSupportedCharts = ['bar', 'line', 'area', 'pie', 'stacked-bar', 'histogram', 'treemap', 'bar3d', 'scatter3d', 'network', 'network3d', 'entity-relationship'];
  const supportsDataLabels = dataLabelSupportedCharts.includes(chartType);

  const handleChartTypeChange = (newType: any) => {
    console.log('useChartState - Chart type changing:', { from: chartType, to: newType });
    
    setChartType(newType);
    
    // Clear series if chart type doesn't support multiple series
    if (!multiSeriesChartTypes.includes(newType)) {
      console.log('useChartState - Clearing series (chart type does not support multiple series)');
      setSeries([]);
    }
    
    // Reset data labels if chart type doesn't support them
    if (!dataLabelSupportedCharts.includes(newType)) {
      console.log('useChartState - Disabling data labels (chart type does not support them)');
      setShowDataLabels(false);
    }
  };

  // Debug logging for series changes
  useEffect(() => {
    console.log('useChartState - Series updated:', {
      chartType,
      supportsMultipleSeries,
      seriesCount: series.length,
      series: series.map(s => ({ id: s.id, column: s.column, type: s.type }))
    });
  }, [series, chartType, supportsMultipleSeries]);

  // Enhanced setSeries with logging
  const handleSetSeries = (newSeries: SeriesConfig[]) => {
    console.log('useChartState - Setting series:', {
      previousCount: series.length,
      newCount: newSeries.length,
      chartType,
      supportsMultipleSeries,
      newSeries: newSeries.map(s => ({ id: s.id, column: s.column }))
    });
    setSeries(newSeries);
  };

  return {
    chartType,
    setChartType: handleChartTypeChange,
    xColumn,
    setXColumn,
    yColumn,
    setYColumn,
    zColumn,
    setZColumn,
    stackColumn,
    setStackColumn,
    sankeyTargetColumn,
    setSankeyTargetColumn,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    series,
    setSeries: handleSetSeries,
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
  };
};

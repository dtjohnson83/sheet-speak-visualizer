
import { useState } from 'react';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { COLOR_PALETTES } from '@/components/chart/ColorPaletteSelector';

export interface SeriesConfig {
  id: string;
  column: string;
  color: string;
  type: 'bar' | 'line';
  aggregationMethod: AggregationMethod;
}

export const useChartState = () => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'stacked-bar' | 'treemap' | 'sankey'>('bar');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');
  const [stackColumn, setStackColumn] = useState<string>('');
  const [sankeyTargetColumn, setSankeyTargetColumn] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [series, setSeries] = useState<SeriesConfig[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('sum');
  const [showDataLabels, setShowDataLabels] = useState<boolean>(false);
  const [selectedPalette, setSelectedPalette] = useState<string>('Default');

  // Get colors from selected palette
  const getChartColors = () => {
    const palette = COLOR_PALETTES.find(p => p.name === selectedPalette);
    return palette ? palette.colors : COLOR_PALETTES[0].colors;
  };

  const chartColors = getChartColors();

  const multiSeriesChartTypes = ['bar', 'line', 'scatter'];
  const supportsMultipleSeries = multiSeriesChartTypes.includes(chartType);

  // Charts that support data labels
  const dataLabelSupportedCharts = ['bar', 'line', 'stacked-bar'];
  const supportsDataLabels = dataLabelSupportedCharts.includes(chartType);

  const handleChartTypeChange = (newType: any) => {
    setChartType(newType);
    if (!multiSeriesChartTypes.includes(newType)) {
      setSeries([]);
    }
    // Reset data labels if chart type doesn't support them
    if (!dataLabelSupportedCharts.includes(newType)) {
      setShowDataLabels(false);
    }
  };

  return {
    chartType,
    setChartType: handleChartTypeChange,
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
  };
};

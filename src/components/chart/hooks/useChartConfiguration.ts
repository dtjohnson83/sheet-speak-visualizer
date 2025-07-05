import { useState } from 'react';
import { useChartState } from '@/hooks/useChartState';
import { AIChartSuggestion } from '@/hooks/useAIChartGeneration';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const useChartConfiguration = () => {
  const [customTitle, setCustomTitle] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  const chartState = useChartState();

  // Wrapper to track user interactions with chart type
  const handleChartTypeChange = (newChartType: any) => {
    console.log('ChartConfiguration - User manually changed chart type to:', newChartType);
    setHasUserInteracted(true);
    chartState.setChartType(newChartType);
  };

  // Handle smart defaults application
  const handleApplySmartDefaults = (config: {
    chartType: string;
    xColumn: string;
    yColumn: string;
    aggregationMethod: string;
    reasoning: string;
  }) => {
    console.log('Applied smart defaults:', config);
    setHasUserInteracted(true); // Mark as user interaction when manually applying suggestions
    chartState.setChartType(config.chartType as any);
    chartState.setXColumn(config.xColumn);
    chartState.setYColumn(config.yColumn);
    chartState.setAggregationMethod(config.aggregationMethod as any);
  };

  // Handle AI suggestion application
  const handleApplyAISuggestion = (suggestion: AIChartSuggestion) => {
    console.log('ChartConfiguration - Applying AI suggestion:', {
      currentChartType: chartState.chartType,
      suggestedChartType: suggestion.chartType,
      suggestion
    });
    
    chartState.setChartType(suggestion.chartType as any);
    chartState.setXColumn(suggestion.xColumn);
    chartState.setYColumn(suggestion.yColumn);
    setValueColumn(suggestion.valueColumn || '');
    chartState.setStackColumn(suggestion.stackColumn || '');
    chartState.setAggregationMethod(suggestion.aggregationMethod);
    chartState.setSeries(suggestion.series);
    setCustomTitle(suggestion.title);
    
    console.log('ChartConfiguration - AI suggestion applied, new chartType should be:', suggestion.chartType);
  };

  // Handle save tile functionality
  const handleSaveTile = (onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void) => {
    if (!chartState.xColumn || (!chartState.yColumn && chartState.chartType !== 'histogram') || !onSaveTile) return;
    
    const defaultTitle = `${chartState.chartType.charAt(0).toUpperCase() + chartState.chartType.slice(1).replace('-', ' ')} - ${chartState.xColumn}${chartState.yColumn ? ` vs ${chartState.yColumn}` : ''}`;
    const title = customTitle || defaultTitle;
    
    const tileData = {
      title,
      chartType: chartState.chartType,
      xColumn: chartState.xColumn,
      yColumn: chartState.yColumn,
      stackColumn: chartState.stackColumn,
      sankeyTargetColumn: chartState.sankeyTargetColumn,
      valueColumn,
      sortColumn: chartState.sortColumn,
      sortDirection: chartState.sortDirection,
      series: chartState.series,
      showDataLabels: chartState.showDataLabels
    };

    console.log('ChartConfiguration - handleSaveTile - Preparing tile data:', {
      chartType: chartState.chartType,
      sankeyTargetColumn: chartState.sankeyTargetColumn,
      valueColumn,
      fullTileData: tileData
    });
    
    onSaveTile(tileData);
  };

  return {
    // State
    customTitle,
    valueColumn,
    hasUserInteracted,
    ...chartState,
    
    // Setters
    setCustomTitle,
    setValueColumn,
    
    // Handlers
    handleChartTypeChange,
    handleApplySmartDefaults,
    handleApplyAISuggestion,
    handleSaveTile
  };
};
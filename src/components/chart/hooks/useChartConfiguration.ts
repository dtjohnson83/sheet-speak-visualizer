import { useState, useCallback, useEffect, useRef } from 'react';
import { useChartState } from '@/hooks/useChartState';
import { AIChartSuggestion } from '@/hooks/useAIChartGeneration';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const useChartConfiguration = () => {
  const [customTitle, setCustomTitle] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const [pendingAISuggestion, setPendingAISuggestion] = useState<AIChartSuggestion | null>(null);

  const chartState = useChartState();
  const appliedSuggestionRef = useRef<AIChartSuggestion | null>(null);

  // Apply AI suggestion with proper state synchronization
  useEffect(() => {
    if (pendingAISuggestion && !hasUserInteracted) {
      console.log('🎯 useChartConfiguration - Applying pending AI suggestion synchronously:', {
        suggestion: pendingAISuggestion,
        currentState: {
          chartType: chartState.chartType,
          xColumn: chartState.xColumn,
          yColumn: chartState.yColumn
        }
      });

      // Apply all state updates synchronously in a batch
      chartState.setChartType(pendingAISuggestion.chartType as any);
      chartState.setXColumn(pendingAISuggestion.xColumn);
      chartState.setYColumn(pendingAISuggestion.yColumn);
      setValueColumn(pendingAISuggestion.valueColumn || '');
      chartState.setStackColumn(pendingAISuggestion.stackColumn || '');
      chartState.setAggregationMethod(pendingAISuggestion.aggregationMethod);
      chartState.setSeries(pendingAISuggestion.series);
      setCustomTitle(pendingAISuggestion.title);
      
      console.log('🎯 Applied AI suggestion - valueColumn set to:', pendingAISuggestion.valueColumn);
      
      appliedSuggestionRef.current = pendingAISuggestion;
      setPendingAISuggestion(null);

      console.log('✅ useChartConfiguration - AI suggestion applied successfully');
    }
  }, [pendingAISuggestion, hasUserInteracted, chartState]);

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

  // Handle AI suggestion application with proper synchronization
  const handleApplyAISuggestion = useCallback((suggestion: AIChartSuggestion) => {
    console.log('🔄 ChartConfiguration - Queueing AI suggestion for synchronous application:', {
      suggestion: suggestion,
      hasUserInteracted,
      currentPending: !!pendingAISuggestion
    });

    // Don't apply if user has already interacted or if suggestion is already applied
    if (hasUserInteracted || appliedSuggestionRef.current === suggestion) {
      console.log('🚫 ChartConfiguration - Skipping AI suggestion application:', {
        hasUserInteracted,
        alreadyApplied: appliedSuggestionRef.current === suggestion
      });
      return;
    }

    // Queue the suggestion for synchronous application via useEffect
    setPendingAISuggestion(suggestion);
  }, [hasUserInteracted, pendingAISuggestion]);

  // Handle save tile functionality
  const handleSaveTile = (
    onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void,
    dataSourceName?: string
  ) => {
    if (!chartState.xColumn || (!chartState.yColumn && chartState.chartType !== 'histogram') || !onSaveTile) return;
    
    const defaultTitle = `${chartState.chartType.charAt(0).toUpperCase() + chartState.chartType.slice(1).replace('-', ' ')} - ${chartState.xColumn}${chartState.yColumn ? ` vs ${chartState.yColumn}` : ''}`;
    const title = customTitle || defaultTitle;
    
    const tileData = {
      title,
      chartType: chartState.chartType,
      xColumn: chartState.xColumn,
      yColumn: chartState.yColumn,
      stackColumn: chartState.stackColumn,
      valueColumn,
      sortColumn: chartState.sortColumn,
      sortDirection: chartState.sortDirection,
      series: chartState.series,
      showDataLabels: chartState.showDataLabels,
      datasetName: dataSourceName
    };

    console.log('ChartConfiguration - handleSaveTile - Preparing tile data:', {
      chartType: chartState.chartType,
      
      valueColumn,
      dataSourceName,
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
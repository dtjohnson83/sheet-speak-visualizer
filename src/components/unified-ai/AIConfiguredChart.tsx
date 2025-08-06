import React, { useEffect, createContext, useContext } from 'react';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { AIChartSuggestion } from '@/hooks/useAIChartGeneration';

interface AIConfiguredChartProps {
  data: DataRow[];
  columns: ColumnInfo[];
  chartSuggestion: AIChartSuggestion;
  onSaveTile?: (tileData: any) => void;
  dataSourceName?: string;
}

// Create a context to pass the AI suggestion to ChartVisualization
const AIChartSuggestionContext = createContext<AIChartSuggestion | null>(null);

export const useAIChartSuggestion = () => {
  return useContext(AIChartSuggestionContext);
};

export const AIConfiguredChart: React.FC<AIConfiguredChartProps> = ({
  data,
  columns,
  chartSuggestion,
  onSaveTile,
  dataSourceName = "AI Generated Chart"
}) => {
  console.log('🎯 AIConfiguredChart - Rendering with suggestion:', {
    title: chartSuggestion?.title,
    chartType: chartSuggestion?.chartType,
    xColumn: chartSuggestion?.xColumn,
    yColumn: chartSuggestion?.yColumn,
    hasChartSuggestion: !!chartSuggestion
  });

  return (
    <AIChartSuggestionContext.Provider value={chartSuggestion}>
      <ChartVisualization
        data={data}
        columns={columns}
        onSaveTile={onSaveTile}
        dataSourceName={dataSourceName}
      />
    </AIChartSuggestionContext.Provider>
  );
};
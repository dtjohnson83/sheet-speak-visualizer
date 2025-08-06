import React, { useEffect } from 'react';
import { ChartVisualization } from '@/components/ChartVisualization';
import { useChartConfiguration } from '@/components/chart/hooks/useChartConfiguration';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { AIChartSuggestion } from '@/hooks/useAIChartGeneration';

interface AIConfiguredChartProps {
  data: DataRow[];
  columns: ColumnInfo[];
  chartSuggestion: AIChartSuggestion;
  onSaveTile?: (tileData: any) => void;
  dataSourceName?: string;
}

export const AIConfiguredChart: React.FC<AIConfiguredChartProps> = ({
  data,
  columns,
  chartSuggestion,
  onSaveTile,
  dataSourceName = "AI Generated Chart"
}) => {
  const {
    handleApplyAISuggestion
  } = useChartConfiguration();

  // Apply AI suggestion when component mounts or suggestion changes
  useEffect(() => {
    if (chartSuggestion) {
      console.log('🎯 Applying AI chart suggestion:', chartSuggestion);
      handleApplyAISuggestion(chartSuggestion);
    }
  }, [chartSuggestion, handleApplyAISuggestion]);

  return (
    <ChartVisualization
      data={data}
      columns={columns}
      onSaveTile={onSaveTile}
      dataSourceName={dataSourceName}
    />
  );
};
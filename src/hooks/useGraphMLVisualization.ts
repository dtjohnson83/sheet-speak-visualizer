import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { GraphMLInsight } from '@/lib/graph/GraphMLAnalyzer';
import { SeriesConfig } from '@/hooks/useChartState';

export interface GraphMLVisualizationConfig {
  chartType: string;
  xColumn: string;
  yColumn: string;
  title: string;
  description: string;
  series: SeriesConfig[];
  insights: GraphMLInsight[];
}

export const useGraphMLVisualization = () => {
  const [visualizationConfig, setVisualizationConfig] = useState<GraphMLVisualizationConfig | null>(null);

  // Generate intelligent chart title based on Graph ML context
  const generateChartTitle = useCallback((
    chartType: string,
    xColumn: string,
    yColumn: string,
    insights: GraphMLInsight[],
    dataContext?: string
  ): string => {
    const stakeholderInsights = insights.filter(i => i.type === 'stakeholder');
    const communityInsights = insights.filter(i => i.type === 'community');
    const anomalyInsights = insights.filter(i => i.type === 'anomaly');
    
    // Context-aware title generation
    if (chartType === 'network' || chartType === 'network3d') {
      if (communityInsights.length > 0) {
        return `${dataContext || 'Entity'} Network Communities Analysis`;
      }
      if (anomalyInsights.length > 0) {
        return `${dataContext || 'Entity'} Network with Anomaly Detection`;
      }
      return `${dataContext || 'Entity'} Relationship Network`;
    }

    if (chartType === 'bar' || chartType === 'line') {
      const businessContext = stakeholderInsights.length > 0 
        ? stakeholderInsights[0].recommendations?.[0]?.split(' ')[0] || 'Business'
        : 'Business';
      
      const metricType = yColumn.toLowerCase().includes('count') ? 'Distribution' :
                        yColumn.toLowerCase().includes('score') ? 'Performance' :
                        yColumn.toLowerCase().includes('weight') ? 'Importance' : 'Metrics';
      
      return `${businessContext} ${metricType} by ${xColumn}`;
    }

    if (chartType === 'scatter') {
      return `${yColumn} vs ${xColumn} Relationship Analysis`;
    }

    if (chartType === 'pie') {
      return `${xColumn} Distribution Analysis`;
    }

    // Fallback with business context
    const context = dataContext || (stakeholderInsights.length > 0 ? 'Business' : 'Data');
    return `${context} Analysis: ${yColumn} by ${xColumn}`;
  }, []);

  // Generate intelligent axis labels
  const generateAxisLabels = useCallback((
    column: string,
    insights: GraphMLInsight[]
  ): string => {
    // Business-friendly label transformation
    const friendlyLabel = column
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .replace(/Id/g, 'ID');

    // Add context from insights
    const relevantInsight = insights.find(insight => 
      insight.type === 'stakeholder' && 
      (insight as any).relevantColumns?.includes(column)
    );

    if (relevantInsight) {
      const businessContext = (relevantInsight as any).businessImpact;
      if (businessContext && businessContext.length < 30) {
        return `${friendlyLabel} (${businessContext})`;
      }
    }

    // Add units or context hints
    if (column.toLowerCase().includes('count')) return `${friendlyLabel} (Count)`;
    if (column.toLowerCase().includes('score')) return `${friendlyLabel} (Score)`;
    if (column.toLowerCase().includes('weight')) return `${friendlyLabel} (Weight)`;
    if (column.toLowerCase().includes('percent')) return `${friendlyLabel} (%)`;

    return friendlyLabel;
  }, []);

  // Create visualization from Graph ML insights
  const createVisualizationFromInsights = useCallback((
    data: DataRow[],
    columns: ColumnInfo[],
    insights: GraphMLInsight[],
    dataContext?: string
  ): GraphMLVisualizationConfig => {
    // Determine best chart type based on insights
    let chartType = 'bar';
    const hasNetworkInsights = insights.some(i => i.type === 'community' || i.nodeIds);
    const hasAnomalies = insights.some(i => i.type === 'anomaly');
    
    if (hasNetworkInsights) {
      chartType = 'network';
    } else if (hasAnomalies && columns.some(col => col.type === 'numeric')) {
      chartType = 'scatter';
    }

    // Smart column selection
    const categoricalColumns = columns.filter(col => 
      col.type === 'categorical' || col.type === 'text'
    );
    const numericColumns = columns.filter(col => col.type === 'numeric');
    
    const entityColumns = columns.filter(col => 
      col.name.toLowerCase().includes('id') || 
      col.name.toLowerCase().includes('name') || 
      col.name.toLowerCase().includes('entity') ||
      col.type === 'categorical'
    );

    const relationshipColumns = columns.filter(col => 
      col.name.toLowerCase().includes('weight') || 
      col.name.toLowerCase().includes('strength') || 
      col.name.toLowerCase().includes('score') || 
      col.name.toLowerCase().includes('count') ||
      col.type === 'numeric'
    );

    let xColumn = '';
    let yColumn = '';

    if (chartType === 'network') {
      xColumn = entityColumns[0]?.name || categoricalColumns[0]?.name || columns[0]?.name || '';
      yColumn = entityColumns[1]?.name || relationshipColumns[0]?.name || numericColumns[0]?.name || '';
    } else {
      xColumn = entityColumns[0]?.name || categoricalColumns[0]?.name || columns[0]?.name || '';
      yColumn = relationshipColumns[0]?.name || numericColumns[0]?.name || columns[1]?.name || '';
    }

    const title = generateChartTitle(chartType, xColumn, yColumn, insights, dataContext);
    
    // Generate series with intelligent colors based on insights
    const series: SeriesConfig[] = [{
      id: 'graph-ml-series',
      column: yColumn,
      color: hasAnomalies ? '#ef4444' : hasNetworkInsights ? '#3b82f6' : '#8884d8',
      type: chartType === 'line' ? 'line' as const : 'bar' as const,
      aggregationMethod: 'sum' as const,
      yAxisId: 'left'
    }];

    return {
      chartType,
      xColumn,
      yColumn,
      title,
      description: `Generated from Graph ML analysis with ${insights.length} insights`,
      series,
      insights
    };
  }, [generateChartTitle]);

  return {
    visualizationConfig,
    setVisualizationConfig,
    generateChartTitle,
    generateAxisLabels,
    createVisualizationFromInsights
  };
};
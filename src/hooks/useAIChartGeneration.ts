import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';

export interface AIChartSuggestion {
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  valueColumn?: string;
  aggregationMethod: AggregationMethod;
  series: SeriesConfig[];
  title: string;
  reasoning: string;
  confidence: number;
}

export interface ChartAnalysis {
  dataTypes: Record<string, 'numeric' | 'categorical' | 'date' | 'text'>;
  patterns: string[];
  recommendations: string[];
  bestChartTypes: string[];
}

export const useAIChartGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSuggestion, setLastSuggestion] = useState<AIChartSuggestion | null>(null);

  // Analyze data characteristics
  const analyzeData = useCallback((data: DataRow[], columns: ColumnInfo[]): ChartAnalysis => {
    const dataTypes: Record<string, 'numeric' | 'categorical' | 'date' | 'text'> = {};
    const patterns: string[] = [];
    const recommendations: string[] = [];
    const bestChartTypes: string[] = [];

    // Analyze column types and data patterns
    columns.forEach(col => {
      dataTypes[col.name] = col.type;
      
      const uniqueValues = new Set(data.map(row => row[col.name])).size;
      const totalRows = data.length;
      const uniqueRatio = uniqueValues / totalRows;

      if (col.type === 'numeric') {
        if (uniqueRatio > 0.8) {
          patterns.push(`${col.name} has high variability (continuous data)`);
        } else if (uniqueRatio < 0.1) {
          patterns.push(`${col.name} has low variability (discrete values)`);
        }
      } else if (col.type === 'categorical') {
        if (uniqueValues <= 10) {
          patterns.push(`${col.name} has manageable categories (${uniqueValues})`);
        } else {
          patterns.push(`${col.name} has many categories (${uniqueValues}) - consider grouping`);
        }
      }
    });

    // Determine best chart types based on data structure
    const numericCols = columns.filter(c => c.type === 'numeric').length;
    const categoricalCols = columns.filter(c => c.type === 'categorical').length;
    const dateCols = columns.filter(c => c.type === 'date').length;

    if (dateCols > 0 && numericCols > 0) {
      bestChartTypes.push('line', 'area');
      recommendations.push('Time series data detected - line/area charts recommended');
    }

    if (categoricalCols > 0 && numericCols > 0) {
      bestChartTypes.push('bar', 'pie');
      recommendations.push('Categorical vs numeric data - bar/pie charts work well');
    }

    if (numericCols >= 2) {
      bestChartTypes.push('scatter');
      recommendations.push('Multiple numeric columns - scatter plot can show correlations');
    }

    if (categoricalCols >= 2) {
      bestChartTypes.push('heatmap');
      recommendations.push('Multiple categorical columns - heatmap can show relationships');
    }

    return { dataTypes, patterns, recommendations, bestChartTypes };
  }, []);

  // Generate AI chart suggestion based on natural language query
  const generateChartFromQuery = useCallback(async (
    query: string,
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<AIChartSuggestion> => {
    setIsGenerating(true);

    try {
      const analysis = analyzeData(data, columns);
      
      // Parse natural language query for intent
      const lowerQuery = query.toLowerCase();
      let suggestedChartType = 'bar';
      let confidence = 0.7;

      // Chart type detection based on keywords
      if (lowerQuery.includes('trend') || lowerQuery.includes('over time') || lowerQuery.includes('timeline')) {
        suggestedChartType = 'line';
        confidence = 0.9;
      } else if (lowerQuery.includes('compare') || lowerQuery.includes('comparison')) {
        suggestedChartType = 'bar';
        confidence = 0.85;
      } else if (lowerQuery.includes('distribution') || lowerQuery.includes('spread')) {
        suggestedChartType = 'histogram';
        confidence = 0.8;
      } else if (lowerQuery.includes('relationship') || lowerQuery.includes('correlation')) {
        suggestedChartType = 'scatter';
        confidence = 0.85;
      } else if (lowerQuery.includes('proportion') || lowerQuery.includes('percentage') || lowerQuery.includes('share')) {
        suggestedChartType = 'pie';
        confidence = 0.8;
      } else if (lowerQuery.includes('pattern') || lowerQuery.includes('heatmap')) {
        suggestedChartType = 'heatmap';
        confidence = 0.75;
      }

      // Smart column selection based on query and data analysis
      let xColumn = '';
      let yColumn = '';
      let valueColumn = '';

      // Find best columns based on query keywords and data types
      columns.forEach(col => {
        const colNameLower = col.name.toLowerCase();
        
        if (lowerQuery.includes(colNameLower)) {
          if (col.type === 'categorical' || col.type === 'date') {
            xColumn = col.name;
          } else if (col.type === 'numeric') {
            yColumn = col.name;
          }
        }
      });

      // Fallback to smart defaults if no specific columns mentioned
      if (!xColumn) {
        const categoricalCol = columns.find(c => c.type === 'categorical');
        const dateCol = columns.find(c => c.type === 'date');
        xColumn = dateCol?.name || categoricalCol?.name || columns[0]?.name || '';
      }

      if (!yColumn) {
        const numericCol = columns.find(c => c.type === 'numeric');
        yColumn = numericCol?.name || '';
      }

      // Generate appropriate aggregation method
      let aggregationMethod: AggregationMethod = 'sum';
      if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
        aggregationMethod = 'average';
      } else if (lowerQuery.includes('count')) {
        aggregationMethod = 'count';
      } else if (lowerQuery.includes('max') || lowerQuery.includes('maximum')) {
        aggregationMethod = 'max';
      } else if (lowerQuery.includes('min') || lowerQuery.includes('minimum')) {
        aggregationMethod = 'min';
      }

      // Generate series configuration for multi-series charts
      const series: SeriesConfig[] = [];
      if (['bar', 'line', 'area', 'scatter'].includes(suggestedChartType) && yColumn) {
        series.push({
          id: '1',
          column: yColumn,
          color: '#3b82f6',
          type: suggestedChartType as any,
          aggregationMethod
        });
      }

      const suggestion: AIChartSuggestion = {
        chartType: suggestedChartType,
        xColumn,
        yColumn,
        valueColumn: yColumn,
        aggregationMethod,
        series,
        title: `${suggestedChartType.charAt(0).toUpperCase() + suggestedChartType.slice(1)} Chart: ${xColumn} vs ${yColumn}`,
        reasoning: `Based on your query "${query}", I detected intent for ${suggestedChartType} visualization. Selected ${xColumn} for x-axis and ${yColumn} for y-axis with ${aggregationMethod} aggregation.`,
        confidence
      };

      setLastSuggestion(suggestion);
      return suggestion;

    } catch (error) {
      console.error('Failed to generate AI chart suggestion:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [analyzeData]);

  // Auto-select best chart type based on data characteristics
  const suggestOptimalChart = useCallback((data: DataRow[], columns: ColumnInfo[]): AIChartSuggestion => {
    const analysis = analyzeData(data, columns);
    
    let chartType = 'bar';
    let confidence = 0.6;
    let reasoning = 'Default bar chart selected';

    if (analysis.bestChartTypes.length > 0) {
      chartType = analysis.bestChartTypes[0];
      confidence = 0.8;
      reasoning = `Recommended ${chartType} chart based on data analysis: ${analysis.recommendations.join(', ')}`;
    }

    // Smart column selection
    const categoricalCol = columns.find(c => c.type === 'categorical');
    const numericCol = columns.find(c => c.type === 'numeric');
    const dateCol = columns.find(c => c.type === 'date');

    const xColumn = dateCol?.name || categoricalCol?.name || columns[0]?.name || '';
    const yColumn = numericCol?.name || '';

    const series: SeriesConfig[] = [];
    if (yColumn) {
      series.push({
        id: '1',
        column: yColumn,
        color: '#3b82f6',
        type: chartType as any,
        aggregationMethod: 'sum'
      });
    }

    const suggestion: AIChartSuggestion = {
      chartType,
      xColumn,
      yColumn,
      valueColumn: yColumn,
      aggregationMethod: 'sum',
      series,
      title: `Recommended ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      reasoning,
      confidence
    };

    setLastSuggestion(suggestion);
    return suggestion;
  }, [analyzeData]);

  return {
    isGenerating,
    lastSuggestion,
    generateChartFromQuery,
    suggestOptimalChart,
    analyzeData
  };
};
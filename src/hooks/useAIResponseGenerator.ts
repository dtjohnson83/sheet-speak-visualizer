import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useAIChartGeneration } from './useAIChartGeneration';

export interface AIResponseData {
  type: 'text' | 'kpi' | 'chart' | 'mixed';
  textContent?: string;
  kpiData?: {
    value: number;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
    previousValue?: number;
    format?: string;
    context?: string;
  };
  chartData?: {
    data: DataRow[];
    columns: ColumnInfo[];
    chartType: string;
    xColumn: string;
    yColumn: string;
    title?: string;
    description?: string;
  };
  confidence: number;
  reasoning?: string;
}

interface UseAIResponseGeneratorProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const useAIResponseGenerator = ({ data, columns }: UseAIResponseGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponseData | null>(null);
  const { generateChartFromQuery } = useAIChartGeneration();

  const analyzeQuery = useCallback((query: string): { intent: string; entities: string[]; queryType: 'value' | 'comparison' | 'trend' | 'relationship' | 'general' } => {
    const lowerQuery = query.toLowerCase();
    
    // Extract potential column names from query
    const entities = columns
      .map(col => col.name.toLowerCase())
      .filter(colName => lowerQuery.includes(colName));

    // Determine query intent
    if (lowerQuery.match(/\b(what is|how much|total|sum|average|mean|count)\b/)) {
      return { intent: 'value_request', entities, queryType: 'value' };
    }
    
    if (lowerQuery.match(/\b(compare|vs|versus|difference|higher|lower|best|worst)\b/)) {
      return { intent: 'comparison', entities, queryType: 'comparison' };
    }
    
    if (lowerQuery.match(/\b(trend|over time|change|growth|decline|pattern)\b/)) {
      return { intent: 'trend_analysis', entities, queryType: 'trend' };
    }
    
    if (lowerQuery.match(/\b(relationship|correlation|impact|affect|influence)\b/)) {
      return { intent: 'relationship_analysis', entities, queryType: 'relationship' };
    }

    if (lowerQuery.match(/\b(show|display|chart|graph|visualize|plot)\b/)) {
      return { intent: 'visualization', entities, queryType: 'comparison' };
    }

    return { intent: 'general_question', entities, queryType: 'general' };
  }, [columns]);

  const generateKPIResponse = useCallback((query: string, analysis: ReturnType<typeof analyzeQuery>): AIResponseData => {
    // Find numeric columns for KPI calculation
    const numericColumns = columns.filter(col => col.type === 'numeric');
    
    if (numericColumns.length === 0 || data.length === 0) {
      return {
        type: 'text',
        textContent: "I couldn't find any numeric data to calculate a KPI value.",
        confidence: 0.3
      };
    }

    // Try to find the most relevant column based on query
    let targetColumn = numericColumns[0];
    
    if (analysis.entities.length > 0) {
      const matchedColumn = numericColumns.find(col => 
        analysis.entities.includes(col.name.toLowerCase())
      );
      if (matchedColumn) targetColumn = matchedColumn;
    }

    // Calculate KPI value
    const values = data
      .map(row => parseFloat(String(row[targetColumn.name])))
      .filter(val => !isNaN(val));

    if (values.length === 0) {
      return {
        type: 'text',
        textContent: `No valid numeric values found in ${targetColumn.name}.`,
        confidence: 0.4
      };
    }

    let kpiValue: number;
    let label: string;
    let format = 'number';

    // Determine aggregation based on query
    if (query.match(/\b(total|sum)\b/i)) {
      kpiValue = values.reduce((sum, val) => sum + val, 0);
      label = `Total ${targetColumn.name}`;
    } else if (query.match(/\b(average|mean)\b/i)) {
      kpiValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      label = `Average ${targetColumn.name}`;
    } else if (query.match(/\b(count)\b/i)) {
      kpiValue = values.length;
      label = `Count of ${targetColumn.name}`;
    } else {
      // Default to total for value requests
      kpiValue = values.reduce((sum, val) => sum + val, 0);
      label = `Total ${targetColumn.name}`;
    }

    // Detect format based on column name
    if (targetColumn.name.toLowerCase().includes('revenue') || 
        targetColumn.name.toLowerCase().includes('price') ||
        targetColumn.name.toLowerCase().includes('cost')) {
      format = 'currency';
    } else if (targetColumn.name.toLowerCase().includes('rate') ||
               targetColumn.name.toLowerCase().includes('percent')) {
      format = 'percentage';
    }

    return {
      type: 'kpi',
      kpiData: {
        value: kpiValue,
        label,
        format,
        context: `Based on ${values.length} data points`
      },
      confidence: 0.8,
      reasoning: `Calculated ${label.toLowerCase()} from ${values.length} data points`
    };
  }, [data, columns]);

  const generateChartResponse = useCallback(async (query: string): Promise<AIResponseData> => {
    try {
      const chartSuggestion = await generateChartFromQuery(query, data, columns);
      
      return {
        type: 'chart',
        chartData: {
          data,
          columns,
          chartType: chartSuggestion.chartType,
          xColumn: chartSuggestion.xColumn,
          yColumn: chartSuggestion.yColumn,
          title: chartSuggestion.title,
          description: chartSuggestion.reasoning
        },
        confidence: chartSuggestion.confidence,
        reasoning: chartSuggestion.reasoning
      };
    } catch (error) {
      return {
        type: 'text',
        textContent: 'I encountered an error while generating a chart for your query.',
        confidence: 0.2
      };
    }
  }, [data, columns, generateChartFromQuery]);

  const generateResponse = useCallback(async (query: string): Promise<AIResponseData> => {
    setIsGenerating(true);
    
    try {
      const analysis = analyzeQuery(query);
      
      let response: AIResponseData;

      switch (analysis.queryType) {
        case 'value':
          response = generateKPIResponse(query, analysis);
          break;
          
        case 'comparison':
        case 'trend':
        case 'relationship':
          response = await generateChartResponse(query);
          break;
          
        case 'general':
        default:
          // For general questions, try to provide contextual information
          response = {
            type: 'text',
            textContent: `I can help you analyze your data. Your dataset contains ${data.length} rows with columns: ${columns.map(c => c.name).join(', ')}. Try asking me to show relationships, calculate totals, or visualize specific metrics.`,
            confidence: 0.6
          };
      }

      setLastResponse(response);
      return response;
      
    } catch (error) {
      const errorResponse: AIResponseData = {
        type: 'text',
        textContent: 'I encountered an error processing your query. Please try rephrasing your question.',
        confidence: 0.1
      };
      setLastResponse(errorResponse);
      return errorResponse;
    } finally {
      setIsGenerating(false);
    }
  }, [data, columns, analyzeQuery, generateKPIResponse, generateChartResponse]);

  return {
    isGenerating,
    lastResponse,
    generateResponse
  };
};
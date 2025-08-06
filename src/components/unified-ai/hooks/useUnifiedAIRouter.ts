import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useAIResponseGenerator } from '@/hooks/useAIResponseGenerator';
import { useAIChartGeneration } from '@/hooks/useAIChartGeneration';

export interface UnifiedResponse {
  id: string;
  query: string;
  timestamp: Date;
  textInsight?: string;
  kpis?: Array<{ label: string; value: string; change?: string; }>;
  chartSuggestion?: any;
  additionalInsights?: string[];
  suggestedFollowUps?: string[];
  sources: string[];
}

interface UseUnifiedAIRouterProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const useUnifiedAIRouter = ({ data, columns }: UseUnifiedAIRouterProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<UnifiedResponse | null>(null);
  
  const aiResponseGen = useAIResponseGenerator({ data, columns });
  const chartGen = useAIChartGeneration();

  const classifyQuery = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    
    const hasChartKeywords = /\b(chart|graph|plot|visualize|show|display|trend|pattern)\b/.test(lowerQuery);
    const hasKPIKeywords = /\b(total|sum|average|count|max|min|highest|lowest|performance|metrics)\b/.test(lowerQuery);
    const hasComparisonKeywords = /\b(compare|versus|vs|difference|better|worse|higher|lower)\b/.test(lowerQuery);
    const hasTrendKeywords = /\b(trend|over time|growth|decline|increase|decrease|change)\b/.test(lowerQuery);
    
    return {
      needsChart: hasChartKeywords || hasTrendKeywords || hasComparisonKeywords,
      needsKPI: hasKPIKeywords || hasComparisonKeywords,
      needsAnalysis: true, // Always provide text analysis
      complexity: hasComparisonKeywords || hasTrendKeywords ? 'complex' : 'simple'
    };
  }, []);

  const processUnifiedQuery = useCallback(async (query: string): Promise<UnifiedResponse> => {
    setIsProcessing(true);
    
    try {
      const classification = classifyQuery(query);
      const sources: string[] = [];
      
      // Generate parallel AI responses
      const [aiResponse, chartResponse] = await Promise.all([
        classification.needsKPI || classification.needsAnalysis 
          ? aiResponseGen.generateResponse(query) 
          : Promise.resolve(null),
        classification.needsChart 
          ? chartGen.generateChartFromQuery(query, data, columns) 
          : Promise.resolve(null)
      ]);

      if (aiResponse) sources.push('AI Response Generator');
      if (chartResponse) sources.push('Chart Generator');

      // Extract insights based on response types
      let textInsight = '';
      let kpis: Array<{ label: string; value: string; change?: string; }> = [];
      
      if (aiResponse) {
        if (aiResponse.type === 'text') {
          textInsight = aiResponse.content;
        } else if (aiResponse.type === 'kpi') {
          textInsight = aiResponse.explanation || '';
          kpis = aiResponse.data?.map((kpi: any) => ({
            label: kpi.label,
            value: kpi.value,
            change: kpi.change
          })) || [];
        } else if (aiResponse.type === 'mixed') {
          textInsight = aiResponse.textContent || '';
          kpis = aiResponse.kpiData || [];
        }
      }

      // Generate additional insights
      const additionalInsights: string[] = [];
      if (chartResponse) {
        additionalInsights.push(`Visualization confidence: ${Math.round(chartResponse.confidence * 100)}%`);
        if (chartResponse.reasoning) {
          additionalInsights.push(chartResponse.reasoning);
        }
      }

      // Generate follow-up suggestions
      const suggestedFollowUps = generateFollowUpSuggestions(query, classification, columns);

      const response: UnifiedResponse = {
        id: `unified-${Date.now()}`,
        query,
        timestamp: new Date(),
        textInsight: textInsight || `Based on your data analysis of ${data.length} records, here are the key findings for: "${query}"`,
        kpis: kpis.length > 0 ? kpis : undefined,
        chartSuggestion: chartResponse || undefined,
        additionalInsights,
        suggestedFollowUps,
        sources
      };

      setLastResponse(response);
      return response;
    } catch (error) {
      console.error('Error processing unified query:', error);
      
      // Create a fallback response with error information
      const fallbackResponse: UnifiedResponse = {
        id: `error-${Date.now()}`,
        query,
        timestamp: new Date(),
        textInsight: `I encountered an issue while analyzing your request: "${query}". Please try rephrasing your question or check if your data contains the information you're looking for.`,
        sources: ['Error Handler'],
        additionalInsights: [
          'Ensure your data has sufficient records for analysis',
          'Try asking more specific questions about your data',
          'Check that column names in your question match those in your dataset'
        ],
        suggestedFollowUps: [
          'What columns are available in my data?',
          'Show me a summary of my data',
          'What are the data types of my columns?'
        ]
      };
      
      setLastResponse(fallbackResponse);
      return fallbackResponse;
    } finally {
      setIsProcessing(false);
    }
  }, [data, columns, aiResponseGen, chartGen, classifyQuery]);

  const generateFollowUpSuggestions = (originalQuery: string, classification: any, columns: ColumnInfo[]): string[] => {
    const suggestions: string[] = [];
    
    if (classification.needsChart) {
      suggestions.push("Break down by category");
      suggestions.push("Show seasonal patterns");
    }
    
    if (classification.needsKPI) {
      suggestions.push("Compare with previous period");
      suggestions.push("Analyze top performers");
    }

    // Add column-specific suggestions
    const dateColumns = columns.filter(col => col.type === 'date');
    const numericColumns = columns.filter(col => col.type === 'numeric');
    
    if (dateColumns.length > 0) {
      suggestions.push("Analyze trends over time");
    }
    
    if (numericColumns.length > 1) {
      suggestions.push("Find correlations between metrics");
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  return {
    isProcessing,
    lastResponse,
    processUnifiedQuery
  };
};
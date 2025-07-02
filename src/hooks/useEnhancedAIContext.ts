import { useState, useCallback } from 'react';
import { EnhancedDataContext } from '@/components/ai-context/EnhancedDataContextManager';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface AIContextData {
  columns: Array<{
    name: string;
    type: string;
    values: any[];
    description?: string;
    businessMeaning?: string;
    unit?: string;
    isKPI?: boolean;
    expectedRange?: string;
  }>;
  sampleData: any[];
  totalRows: number;
  fileName?: string;
  enhancedContext?: {
    businessDomain: string;
    businessPurpose: string;
    timePeriod: string;
    objectives: string[];
    industry: string;
    primaryDateColumn: string;
    keyMetrics: string[];
    dimensions: string[];
    measures: string[];
    dataQuality: {
      completeness: number;
      consistency: number;
      validity: number;
    };
    businessRules: string[];
    commonPatterns: string[];
  };
}

export const useEnhancedAIContext = () => {
  const [enhancedContext, setEnhancedContext] = useState<EnhancedDataContext | null>(null);
  const [isContextCollected, setIsContextCollected] = useState(false);

  const setContext = useCallback((context: EnhancedDataContext) => {
    setEnhancedContext(context);
    setIsContextCollected(true);
  }, []);

  const clearContext = useCallback(() => {
    setEnhancedContext(null);
    setIsContextCollected(false);
  }, []);

  const buildAIContext = useCallback((
    data: DataRow[], 
    columns: ColumnInfo[], 
    fileName?: string,
    sampleSize: number = 10
  ): AIContextData => {
    // Build basic context
    const basicContext: AIContextData = {
      columns: columns.map(col => ({
        name: col.name,
        type: col.type,
        values: col.values.slice(0, sampleSize)
      })),
      sampleData: data.slice(0, Math.min(sampleSize, data.length)),
      totalRows: data.length,
      fileName
    };

    // Add enhanced context if available
    if (enhancedContext && isContextCollected) {
      const columnContextMap = new Map(
        enhancedContext.columnContexts.map(ctx => [ctx.name, ctx])
      );

      // Enhance column information
      basicContext.columns = basicContext.columns.map(col => {
        const ctx = columnContextMap.get(col.name);
        return {
          ...col,
          description: ctx?.description,
          businessMeaning: ctx?.businessMeaning,
          unit: ctx?.unit,
          isKPI: ctx?.isKPI,
          expectedRange: ctx?.expectedRange
        };
      });

      // Add enhanced business context
      basicContext.enhancedContext = {
        businessDomain: enhancedContext.businessContext.domain,
        businessPurpose: enhancedContext.businessContext.purpose,
        timePeriod: enhancedContext.businessContext.timePeriod,
        objectives: enhancedContext.businessContext.objectives,
        industry: enhancedContext.businessContext.industry,
        primaryDateColumn: enhancedContext.relationships.primaryDate,
        keyMetrics: enhancedContext.relationships.keyMetrics,
        dimensions: enhancedContext.relationships.dimensions,
        measures: enhancedContext.relationships.measures,
        dataQuality: enhancedContext.dataQuality,
        businessRules: enhancedContext.domainKnowledge.businessRules,
        commonPatterns: enhancedContext.domainKnowledge.commonPatterns
      };
    }

    return basicContext;
  }, [enhancedContext, isContextCollected]);

  const hasEnhancedContext = isContextCollected && enhancedContext !== null;

  return {
    enhancedContext,
    isContextCollected,
    hasEnhancedContext,
    setContext,
    clearContext,
    buildAIContext
  };
};
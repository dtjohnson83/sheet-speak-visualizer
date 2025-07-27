import { useState, useCallback, useEffect } from 'react';
import { DomainContext } from '@/components/agents/DomainSurvey';
import { DataRow, ColumnInfo } from '@/pages/Index';

const STORAGE_KEY = 'domain-context';

export interface GlobalDomainContext extends DomainContext {
  fileName?: string;
  worksheetName?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface EnhancedAIContextData {
  columns: Array<{
    name: string;
    type: string;
    values: any[];
    businessMeaning?: string;
    unit?: string;
    isKPI?: boolean;
    statistics?: any;
    sampleSize?: number;
    totalSize?: number;
    priority?: 'high' | 'medium' | 'low';
  }>;
  sampleData: any[];
  totalRows: number;
  fileName?: string;
  domainContext?: GlobalDomainContext;
  preComputedStats?: any;
  aggregations?: Record<string, any>;
  dataQuality?: {
    completeness: number;
    warnings: string[];
  };
  domainAnalysis?: {
    framework: string;
    keyMetricsFocus: string[];
    riskFactors: string[];
    opportunityIndicators: string[];
  };
}

export const useDomainContext = () => {
  const [domainContext, setDomainContext] = useState<GlobalDomainContext | null>(null);
  const [isContextCollected, setIsContextCollected] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  // Load context from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const context = JSON.parse(stored);
        setDomainContext(context);
        setIsContextCollected(true);
      } catch (error) {
        console.error('Failed to load domain context:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const setContext = useCallback((context: DomainContext, fileName?: string, worksheetName?: string) => {
    const enhancedContext: GlobalDomainContext = {
      ...context,
      fileName,
      worksheetName,
      createdAt: domainContext?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    setDomainContext(enhancedContext);
    setIsContextCollected(true);
    setShowSurvey(false);
    
    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enhancedContext));
  }, [domainContext?.createdAt]);

  const clearContext = useCallback(() => {
    setDomainContext(null);
    setIsContextCollected(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateContext = useCallback((updates: Partial<DomainContext>) => {
    if (!domainContext) return;
    
    const updatedContext: GlobalDomainContext = {
      ...domainContext,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    setDomainContext(updatedContext);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContext));
  }, [domainContext]);

  const triggerSurvey = useCallback((force = false) => {
    if (force || !isContextCollected) {
      setShowSurvey(true);
    }
  }, [isContextCollected, showSurvey]);

  const closeSurvey = useCallback(() => {
    setShowSurvey(false);
  }, []);

  const skipSurvey = useCallback(() => {
    setShowSurvey(false);
    setIsContextCollected(true);
  }, []);

  // Build AI context with domain information and statistical pre-computation
  const buildAIContext = useCallback((
    data: DataRow[], 
    columns: ColumnInfo[], 
    fileName?: string,
    sampleSize: number = 10,
    isAdmin: boolean = false
  ): EnhancedAIContextData => {
    // Import validation engine
    const { DataValidationEngine } = require('@/lib/dataAccuracy/DataValidationEngine');
    
    // Pre-validate and compute aggregations for fact-checking
    const validationResult = DataValidationEngine.validateAndPrecompute(data, columns, fileName);
    
    // For admins: use comprehensive data, for regular users: use optimized sample
    const maxRows = isAdmin ? Math.min(data.length, 10000) : Math.min(sampleSize, data.length);
    const maxColumnValues = isAdmin ? Math.min(columns[0]?.values.length || 0, 500) : sampleSize;
    
    // Build enhanced context with pre-computed statistical summaries
    const basicContext: EnhancedAIContextData = {
      columns: columns.map(col => {
        const colStats = validationResult.aggregations.get('columns')?.get(col.name);
        return {
          name: col.name,
          type: col.type,
          values: col.values.slice(0, maxColumnValues),
          // Add pre-computed statistics for AI reference
          statistics: colStats,
          sampleSize: Math.min(col.values.length, maxColumnValues),
          totalSize: col.values.length
        };
      }),
      sampleData: data.slice(0, maxRows),
      totalRows: data.length,
      fileName,
      // Add pre-computed aggregations and validation results
      preComputedStats: validationResult.statisticalSummary,
      aggregations: Object.fromEntries(validationResult.aggregations),
      dataQuality: {
        completeness: validationResult.statisticalSummary?.dataQuality?.completeness || 0,
        warnings: validationResult.warnings
      }
    };

    // Add domain context if available
    if (domainContext && isContextCollected) {
      basicContext.domainContext = domainContext;
      
      // Import domain processor
      const { DomainContextProcessor } = require('@/lib/domainContext/DomainContextProcessor');
      
      // Generate domain-specific analysis framework
      const domainPrompt = DomainContextProcessor.generateDomainSpecificPrompt(
        domainContext, data, columns
      );
      
      // Enhance column information based on domain
      basicContext.columns = basicContext.columns.map(col => {
        const enhanced = { ...col };
        
        // Add business meaning based on domain and column name
        if (domainContext.keyMetrics?.includes(col.name)) {
          enhanced.isKPI = true;
          enhanced.businessMeaning = 'Key Performance Indicator';
        }
        
        // Add domain-specific column insights
        const domainTerms = domainPrompt.industryTerminology;
        const matchingTerm = Array.from(domainTerms.keys()).find(term => 
          col.name.toLowerCase().includes(String(term).toLowerCase())
        );
        
        if (matchingTerm) {
          enhanced.businessMeaning = domainTerms.get(matchingTerm) || enhanced.businessMeaning;
        }
        
        // Domain-specific enhancements
        switch (domainContext.domain) {
          case 'finance':
            if (col.name.toLowerCase().includes('revenue') || col.name.toLowerCase().includes('sales')) {
              enhanced.businessMeaning = 'Financial Revenue Metric';
              enhanced.unit = 'Currency';
              enhanced.priority = 'high';
            }
            break;
          case 'marketing':
            if (col.name.toLowerCase().includes('conversion') || col.name.toLowerCase().includes('rate')) {
              enhanced.businessMeaning = 'Marketing Performance Metric';
              enhanced.unit = 'Percentage';
              enhanced.priority = 'high';
            }
            break;
          case 'operations':
            if (col.name.toLowerCase().includes('efficiency') || col.name.toLowerCase().includes('utilization')) {
              enhanced.businessMeaning = 'Operational Efficiency Metric';
              enhanced.unit = 'Percentage';
              enhanced.priority = 'high';
            }
            break;
        }
        
        return enhanced;
      });
      
      // Add domain-specific analysis context
      basicContext.domainAnalysis = {
        framework: domainPrompt.analysisFramework,
        keyMetricsFocus: domainPrompt.keyMetricsFocus,
        riskFactors: domainPrompt.riskFactors,
        opportunityIndicators: domainPrompt.opportunityIndicators
      };
    }

    return basicContext;
  }, [domainContext, isContextCollected]);

  const getContextSummary = useCallback(() => {
    if (!domainContext) return null;
    
    return {
      domain: domainContext.domain,
      industry: domainContext.industry,
      dataType: domainContext.dataType,
      keyMetrics: domainContext.keyMetrics?.slice(0, 3),
      objectives: domainContext.businessObjectives?.slice(0, 2),
      lastUpdated: domainContext.lastUpdated
    };
  }, [domainContext]);

  return {
    domainContext,
    isContextCollected,
    hasContext: isContextCollected && domainContext !== null,
    showSurvey,
    setContext,
    clearContext,
    updateContext,
    triggerSurvey,
    closeSurvey,
    skipSurvey,
    buildAIContext,
    getContextSummary
  };
};
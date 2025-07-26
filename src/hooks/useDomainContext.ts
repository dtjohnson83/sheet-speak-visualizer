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
  }>;
  sampleData: any[];
  totalRows: number;
  fileName?: string;
  domainContext?: GlobalDomainContext;
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
    console.log('triggerSurvey called with force:', force, 'isContextCollected:', isContextCollected);
    if (force || !isContextCollected) {
      console.log('Setting showSurvey to true');
      setShowSurvey(true);
    } else {
      console.log('Not showing survey - context already collected and force is false');
    }
  }, [isContextCollected]);

  const closeSurvey = useCallback(() => {
    setShowSurvey(false);
  }, []);

  const skipSurvey = useCallback(() => {
    setShowSurvey(false);
    // Mark as collected to prevent auto-showing again
    setIsContextCollected(true);
  }, []);

  // Build AI context with domain information
  const buildAIContext = useCallback((
    data: DataRow[], 
    columns: ColumnInfo[], 
    fileName?: string,
    sampleSize: number = 10,
    isAdmin: boolean = false
  ): EnhancedAIContextData => {
    // For admins: use more data, for regular users: use sample
    const maxRows = isAdmin ? Math.min(data.length, 50000) : Math.min(sampleSize, data.length);
    const maxColumnValues = isAdmin ? Math.min(columns[0]?.values.length || 0, 1000) : sampleSize;
    
    // Build basic context
    const basicContext: EnhancedAIContextData = {
      columns: columns.map(col => ({
        name: col.name,
        type: col.type,
        values: col.values.slice(0, maxColumnValues)
      })),
      sampleData: data.slice(0, maxRows),
      totalRows: data.length,
      fileName
    };

    // Add domain context if available
    if (domainContext && isContextCollected) {
      basicContext.domainContext = domainContext;
      
      // Enhance column information based on domain
      basicContext.columns = basicContext.columns.map(col => {
        const enhanced = { ...col };
        
        // Add business meaning based on domain and column name
        if (domainContext.domain && domainContext.keyMetrics?.includes(col.name)) {
          enhanced.isKPI = true;
          enhanced.businessMeaning = 'Key Performance Indicator';
        }
        
        // Add domain-specific insights
        if (domainContext.domain === 'finance' && col.name.toLowerCase().includes('revenue')) {
          enhanced.businessMeaning = 'Financial Revenue Metric';
          enhanced.unit = 'Currency';
        }
        
        return enhanced;
      });
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
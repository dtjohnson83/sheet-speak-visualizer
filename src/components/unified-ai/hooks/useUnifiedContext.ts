import { useState, useCallback } from 'react';
import { UnifiedResponse } from './useUnifiedAIRouter';

interface ContextItem {
  query: string;
  response: UnifiedResponse;
  timestamp: Date;
}

export const useUnifiedContext = () => {
  const [sessionHistory, setSessionHistory] = useState<ContextItem[]>([]);
  const [currentContext, setCurrentContext] = useState<string[]>([]);

  const addToContext = useCallback((query: string, response: UnifiedResponse) => {
    const contextItem: ContextItem = {
      query,
      response,
      timestamp: new Date()
    };

    setSessionHistory(prev => [...prev, contextItem]);
    
    // Update current context with relevant information
    const contextSummary = `Q: ${query} | Key findings: ${response.textInsight?.slice(0, 100)}...`;
    setCurrentContext(prev => [...prev.slice(-4), contextSummary]); // Keep last 5 interactions
  }, []);

  const getRelevantContext = useCallback((newQuery: string): string => {
    if (sessionHistory.length === 0) return '';
    
    // Simple relevance matching - could be enhanced with more sophisticated NLP
    const relevantItems = sessionHistory.filter(item => {
      const queryWords = newQuery.toLowerCase().split(' ');
      const itemText = `${item.query} ${item.response.textInsight}`.toLowerCase();
      return queryWords.some(word => word.length > 3 && itemText.includes(word));
    });

    if (relevantItems.length === 0) return '';

    return `Previous relevant context: ${relevantItems.slice(-2).map(item => 
      `${item.query} → ${item.response.textInsight?.slice(0, 150)}...`
    ).join(' | ')}`;
  }, [sessionHistory]);

  const clearContext = useCallback(() => {
    setSessionHistory([]);
    setCurrentContext([]);
  }, []);

  const exportSession = useCallback(() => {
    return {
      sessionId: `session-${Date.now()}`,
      timestamp: new Date(),
      interactions: sessionHistory,
      summary: currentContext
    };
  }, [sessionHistory, currentContext]);

  return {
    sessionHistory,
    currentContext,
    addToContext,
    getRelevantContext,
    clearContext,
    exportSession
  };
};
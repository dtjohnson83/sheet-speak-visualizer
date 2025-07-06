import { useState, useEffect } from 'react';
import { ProgressStatus } from '../types';

export interface TabManagementState {
  activeTab: string;
  expandedTiers: Record<string, boolean>;
}

export const useTabManagement = (data: any[], tiles: any[], showContextSetup: boolean) => {
  const [activeTab, setActiveTab] = useState("data-sources");
  const [expandedTiers, setExpandedTiers] = useState({
    foundation: true,
    analysis: false,
    ai: false,
    advanced: false
  });

  // Workflow progress tracking
  const hasData = data.length > 0;
  const hasCharts = tiles.length > 0;
  const hasAIContext = !showContextSetup;

  // Auto-expand tiers based on workflow progress
  useEffect(() => {
    setExpandedTiers(prev => ({
      ...prev,
      analysis: hasData || prev.analysis,
      ai: (hasData && hasCharts) || prev.ai,
      advanced: hasAIContext || prev.advanced
    }));
  }, [hasData, hasCharts, hasAIContext]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  const getTierProgress = (tierKey: string): ProgressStatus => {
    switch (tierKey) {
      case 'foundation': return hasData ? 'complete' : 'active';
      case 'analysis': return hasCharts ? 'complete' : hasData ? 'active' : 'pending';
      case 'ai': return hasAIContext ? 'complete' : (hasData && hasCharts) ? 'active' : 'pending';
      case 'advanced': return hasAIContext ? 'complete' : (hasData && hasCharts) ? 'active' : 'pending';
      default: return 'pending';
    }
  };

  return {
    activeTab,
    expandedTiers,
    hasData,
    hasCharts,
    hasAIContext,
    handleTabChange,
    toggleTier,
    getTierProgress
  };
};
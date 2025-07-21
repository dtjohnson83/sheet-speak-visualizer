import { Database, BarChart3, Layout, Bot, FileText, Shield, Settings, Target, Brain } from 'lucide-react';
import { TierInfo } from './types';

export const getTierDefinitions = (data: any[], tiles: any[]): Record<string, TierInfo> => ({
  foundation: {
    title: "Data Foundation",
    description: "Connect and prepare your data",
    icon: Database,
    color: "blue",
    tabs: [
      { id: "data-sources", label: "Data Sources", icon: Database, badge: null },
      { id: "preview", label: "Data Preview", icon: Database, badge: data.length > 0 ? data.length : null },
      { id: "smart-integration", label: "Smart Integration", icon: Brain, badge: null }
    ]
  },
  analysis: {
    title: "Analysis & Visualization", 
    description: "Create charts and dashboards",
    icon: BarChart3,
    color: "teal",
    tabs: [
      { id: "charts", label: "Visualizations", icon: BarChart3, badge: null },
      { id: "dashboard", label: "Dashboard", icon: Layout, badge: tiles.length > 0 ? tiles.length : null }
    ]
  },
  ai: {
    title: "AI Intelligence",
    description: "Chat, analyze, and predict", 
    icon: Bot,
    color: "green",
    tabs: [
      { id: "ai-chat", label: "AI Chat", icon: Bot, badge: null },
      { id: "ai-report", label: "AI Report", icon: FileText, badge: null },
      { id: "predictive", label: "Predictive AI", icon: Target, badge: null }
    ]
  },
  advanced: {
    title: "Advanced Operations",
    description: "Quality control and automation",
    icon: Settings,
    color: "amber",
    tabs: [
      { id: "data-quality", label: "Data Quality", icon: Shield, badge: null },
      { id: "agents", label: "AI Agents", icon: Settings, badge: null }
    ]
  }
});
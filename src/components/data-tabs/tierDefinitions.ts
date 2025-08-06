import { Database, BarChart3, Layout, Bot, FileText, Shield, Settings, Target, Brain } from 'lucide-react';
import { TierInfo } from './types';

export const getTierDefinitions = (data: any[], tiles: any[], savedDatasetsCount: number = 0): Record<string, TierInfo> => ({
  foundation: {
    title: "Data Foundation",
    description: "Connect and prepare your data",
    icon: Database,
    color: "blue",
    tabs: [
      { id: "data-sources", label: "Data Sources", icon: Database, badge: null },
      { id: "saved-datasets", label: "Saved Datasets", icon: FileText, badge: savedDatasetsCount > 0 ? savedDatasetsCount : null },
      { id: "preview", label: "Data Preview", icon: Database, badge: data.length > 0 ? data.length : null }
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
  advanced: {
    title: "Graph & ML Analytics", 
    description: "Advanced graph analysis and machine learning",
    icon: Brain,
    color: "amber",
    tabs: [
      { id: "agents", label: "AI Agents", icon: Bot, badge: null }
    ]
  }
});
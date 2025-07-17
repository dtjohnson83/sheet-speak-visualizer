import { Database, Eye, BarChart3, Layout, Brain, Bot, Layers } from 'lucide-react';

export interface TierDefinition {
  id: string;
  name: string;
  description: string;
  tabs: TabDefinition[];
}

export interface TabDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredData: boolean;
  shortcut: string;
}

export const tierDefinitions: TierDefinition[] = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Core data analysis features',
    tabs: [
      {
        id: 'sources',
        name: 'Sources',
        description: 'Upload or connect data sources',
        icon: 'Database',
        requiredData: false,
        shortcut: '1'
      },
      {
        id: 'preview',
        name: 'Preview',
        description: 'View and configure your data',
        icon: 'Eye',
        requiredData: true,
        shortcut: '2'
      },
      {
        id: 'datasets',
        name: 'Datasets',
        description: 'Manage multiple datasets, merge, and compare',
        icon: 'Layers',
        requiredData: false,
        shortcut: '3'
      }
    ]
  },
  {
    id: 'analysis',
    name: 'Analysis & Visualization',
    description: 'Create charts and build dashboards',
    tabs: [
      {
        id: 'charts',
        name: 'Charts',
        description: 'Create visualizations from your data',
        icon: 'BarChart3',
        requiredData: true,
        shortcut: '4'
      },
      {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'Build interactive dashboards',
        icon: 'Layout',
        requiredData: true,
        shortcut: '5'
      }
    ]
  },
  {
    id: 'intelligence',
    name: 'AI Intelligence',
    description: 'AI-powered insights and automation',
    tabs: [
      {
        id: 'ai',
        name: 'AI Assistant',
        description: 'Get AI insights about your data',
        icon: 'Brain',
        requiredData: true,
        shortcut: '6'
      },
      {
        id: 'agents',
        name: 'AI Agents',
        description: 'Automated data analysis agents',
        icon: 'Bot',
        requiredData: false,
        shortcut: '7'
      }
    ]
  }
];

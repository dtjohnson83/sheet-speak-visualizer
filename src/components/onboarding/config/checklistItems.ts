import { Upload, BarChart, Layout, Sparkles } from 'lucide-react';

export interface ChecklistItemConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actionText?: string;
  targetTab?: string;
}

export const getChecklistItems = (): ChecklistItemConfig[] => [
  {
    id: 'upload-data',
    title: 'Upload Your First Dataset',
    description: 'Connect a data source or upload a CSV/Excel file to get started',
    icon: Upload,
    actionText: 'Get Data',
    targetTab: 'data-sources'
  },
  {
    id: 'create-chart',
    title: 'Create Your First Visualization',
    description: 'Turn your data into a beautiful chart or graph',
    icon: BarChart,
    actionText: 'Create Chart',
    targetTab: 'charts'
  },
  {
    id: 'build-dashboard',
    title: 'Build a Dashboard',
    description: 'Save charts as tiles and create an interactive dashboard',
    icon: Layout,
    actionText: 'View Dashboard',
    targetTab: 'dashboard'
  },
  {
    id: 'try-ai',
    title: 'Try AI Features',
    description: 'Ask questions about your data or get AI-generated insights',
    icon: Sparkles,
    actionText: 'Try AI Chat',
    targetTab: 'ai-chat'
  }
];
import { Upload, BarChart, Layout, Sparkles, Database, Shield } from 'lucide-react';

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
    description: 'Connect a data source or upload a CSV/Excel file to experience enhanced data modeling',
    icon: Upload,
    actionText: 'Get Data',
    targetTab: 'data-sources'
  },
  {
    id: 'understand-quality',
    title: 'Understand Data Quality',
    description: 'Review your data quality profile and learn about completeness, validity, and accuracy scores',
    icon: Shield,
    actionText: 'View Quality',
    targetTab: 'preview'
  },
  {
    id: 'discover-relationships',
    title: 'Discover Data Relationships',
    description: 'Find connections between datasets using automatic relationship discovery',
    icon: Database,
    actionText: 'Discover',
    targetTab: 'preview'
  },
  {
    id: 'create-chart',
    title: 'Create Your First Visualization',
    description: 'Turn your enhanced data into beautiful charts with smart recommendations',
    icon: BarChart,
    actionText: 'Create Chart',
    targetTab: 'charts'
  },
  {
    id: 'build-dashboard',
    title: 'Build a Dashboard',
    description: 'Save charts as tiles and create interactive dashboards with cross-dataset insights',
    icon: Layout,
    actionText: 'View Dashboard',
    targetTab: 'dashboard'
  },
  {
    id: 'try-ai',
    title: 'Try Enhanced AI Features',
    description: 'Ask questions about your data quality, relationships, and get AI-powered insights',
    icon: Sparkles,
    actionText: 'Try AI Chat',
    targetTab: 'ai-chat'
  }
];
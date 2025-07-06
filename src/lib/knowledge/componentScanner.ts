import { logger } from '@/lib/logger';

interface ComponentInfo {
  name: string;
  path: string;
  props?: string[];
  description?: string;
  category: 'chart' | 'ui' | 'data' | 'dashboard' | 'other';
}

interface WorkflowStep {
  name: string;
  description: string;
  requiredData?: string[];
  nextSteps?: string[];
}

interface PlatformKnowledge {
  components: ComponentInfo[];
  workflows: Record<string, WorkflowStep[]>;
  features: Record<string, string>;
  troubleshooting: Record<string, { problem: string; solutions: string[] }>;
}

// Component registry - manually curated for security
const COMPONENT_REGISTRY: ComponentInfo[] = [
  // Chart Components
  {
    name: 'BarChart',
    path: '/charts',
    category: 'chart',
    description: 'Create bar charts to compare categories and values',
    props: ['xColumn', 'yColumn', 'stackColumn', 'chartColors']
  },
  {
    name: 'LineChart', 
    path: '/charts',
    category: 'chart',
    description: 'Create line charts to show trends over time',
    props: ['xColumn', 'yColumn', 'series', 'showDataLabels']
  },
  {
    name: 'PieChart',
    path: '/charts', 
    category: 'chart',
    description: 'Create pie charts to show proportions and percentages',
    props: ['valueColumn', 'labelColumn', 'chartColors']
  },
  {
    name: 'ScatterPlot',
    path: '/charts',
    category: 'chart', 
    description: 'Create scatter plots to show correlations between variables',
    props: ['xColumn', 'yColumn', 'sizeColumn', 'colorColumn']
  },
  {
    name: 'Heatmap',
    path: '/charts',
    category: 'chart',
    description: 'Create heatmaps to visualize data density and patterns',
    props: ['xColumn', 'yColumn', 'valueColumn', 'colorScale']
  },

  // Data Components
  {
    name: 'DataUpload',
    path: '/app',
    category: 'data',
    description: 'Upload CSV, Excel, or JSON files for analysis',
    props: ['onFileUpload', 'supportedFormats', 'maxFileSize']
  },
  {
    name: 'DataPreview',
    path: '/app', 
    category: 'data',
    description: 'Preview and validate your uploaded data',
    props: ['data', 'columns', 'pagination', 'filters']
  },
  {
    name: 'WorksheetSelector',
    path: '/app',
    category: 'data',
    description: 'Select specific worksheets from Excel files',
    props: ['worksheets', 'onSelect', 'defaultSelection']
  },

  // Dashboard Components  
  {
    name: 'DashboardCanvas',
    path: '/dashboard',
    category: 'dashboard',
    description: 'Drag-and-drop dashboard builder with resizable tiles',
    props: ['tiles', 'onTileUpdate', 'onTileRemove', 'gridSize']
  },
  {
    name: 'DashboardFilters',
    path: '/dashboard',
    category: 'dashboard', 
    description: 'Global filters that affect multiple dashboard charts',
    props: ['availableFilters', 'activeFilters', 'onFilterChange']
  },

  // AI Components
  {
    name: 'AIDataChat',
    path: '/app',
    category: 'other',
    description: 'Chat with your data using natural language queries',
    props: ['dataContext', 'onQuerySubmit', 'conversationHistory']
  },
  {
    name: 'AIChartGenerator', 
    path: '/charts',
    category: 'chart',
    description: 'Generate charts automatically from text descriptions',
    props: ['dataColumns', 'onChartGenerate', 'suggestions']
  }
];

// Workflow definitions
const WORKFLOW_DEFINITIONS: Record<string, WorkflowStep[]> = {
  'data-analysis': [
    {
      name: 'Upload Data',
      description: 'Upload your CSV, Excel, or JSON file',
      nextSteps: ['preview-data', 'select-worksheet']
    },
    {
      name: 'Preview Data', 
      description: 'Review your data structure and column types',
      requiredData: ['uploaded-file'],
      nextSteps: ['create-visualization', 'use-ai-chat']
    },
    {
      name: 'Create Visualization',
      description: 'Select chart type and configure axes',
      requiredData: ['validated-data'],
      nextSteps: ['customize-chart', 'save-to-dashboard']
    },
    {
      name: 'Customize Chart',
      description: 'Adjust colors, labels, and formatting',
      nextSteps: ['save-to-dashboard', 'export-chart']
    }
  ],

  'dashboard-creation': [
    {
      name: 'Create Charts',
      description: 'Build individual visualizations from your data',
      requiredData: ['uploaded-data'],
      nextSteps: ['save-charts', 'arrange-dashboard']
    },
    {
      name: 'Save to Dashboard',
      description: 'Add charts to your dashboard collection',
      nextSteps: ['arrange-dashboard', 'add-filters']
    },
    {
      name: 'Arrange Dashboard',
      description: 'Drag and resize tiles to create your layout',
      nextSteps: ['add-filters', 'save-dashboard']
    },
    {
      name: 'Add Filters',
      description: 'Create global filters to control multiple charts',
      nextSteps: ['save-dashboard', 'export-dashboard']
    }
  ],

  'ai-assistance': [
    {
      name: 'Ask Data Questions',
      description: 'Use AI chat to explore your data with natural language',
      requiredData: ['uploaded-data'],
      nextSteps: ['generate-insights', 'create-suggested-charts']
    },
    {
      name: 'Generate Chart Suggestions',
      description: 'Let AI suggest appropriate visualizations',
      nextSteps: ['customize-ai-charts', 'save-to-dashboard']
    },
    {
      name: 'Set Up AI Agents', 
      description: 'Configure automated data monitoring and alerts',
      nextSteps: ['configure-alerts', 'schedule-reports']
    }
  ]
};

// Feature explanations
const FEATURE_EXPLANATIONS: Record<string, string> = {
  'multiple-series': 'Add multiple data series to compare different metrics on the same chart',
  'data-labels': 'Show exact values on chart points for precise reading',
  'chart-stacking': 'Stack bars or areas to show cumulative totals',
  'axis-formatting': 'Customize number formats, scales, and labels on chart axes', 
  'color-themes': 'Apply consistent color palettes across all your visualizations',
  'responsive-design': 'Charts automatically adapt to different screen sizes',
  'data-filtering': 'Filter data before visualization to focus on specific segments',
  'export-options': 'Export charts as images, PDFs, or data files',
  'real-time-updates': 'Connect live data sources for automatic chart updates',
  'collaborative-sharing': 'Share dashboards and charts with team members'
};

// Troubleshooting database
const TROUBLESHOOTING_DB: Record<string, { problem: string; solutions: string[] }> = {
  'chart-empty': {
    problem: 'Chart appears empty or shows no data',
    solutions: [
      'Verify that X and Y columns are properly selected',
      'Check that selected columns contain numeric data for numeric charts',
      'Ensure data rows are not all empty or null',
      'Try filtering data to remove empty rows',
      'Switch to a different chart type that better suits your data'
    ]
  },
  'upload-failed': {
    problem: 'File upload is not working',
    solutions: [
      'Check that file format is supported (CSV, Excel .xlsx, JSON)',
      'Ensure file size is under the 10MB limit', 
      'Verify file is not password-protected or corrupted',
      'Try saving Excel files as .xlsx format',
      'Clear browser cache and try again'
    ]
  },
  'slow-performance': {
    problem: 'Application is running slowly',
    solutions: [
      'Large datasets (>50k rows) may take time to process',
      'Use data sampling option for very large files',
      'Close other browser tabs to free up memory',
      'Apply filters to reduce data before creating charts',
      'Consider breaking large datasets into smaller files'
    ]
  },
  'chart-formatting': {
    problem: 'Chart formatting or colors look wrong',
    solutions: [
      'Check chart type is appropriate for your data',
      'Verify column data types match chart requirements',
      'Use color palette selector to change themes',
      'Adjust axis formatting in chart configuration',
      'Try different chart types to find the best fit'
    ]
  }
};

export class ComponentScanner {
  private knowledge: PlatformKnowledge;

  constructor() {
    this.knowledge = {
      components: COMPONENT_REGISTRY,
      workflows: WORKFLOW_DEFINITIONS,
      features: FEATURE_EXPLANATIONS,
      troubleshooting: TROUBLESHOOTING_DB
    };
  }

  // Get component information by name or category
  getComponents(category?: ComponentInfo['category']): ComponentInfo[] {
    if (!category) return this.knowledge.components;
    return this.knowledge.components.filter(comp => comp.category === category);
  }

  // Get workflow steps for a specific process
  getWorkflow(workflowName: string): WorkflowStep[] | null {
    return this.knowledge.workflows[workflowName] || null;
  }

  // Get all available workflows
  getWorkflows(): string[] {
    return Object.keys(this.knowledge.workflows);
  }

  // Search for relevant information based on user query
  searchKnowledge(query: string): {
    components: ComponentInfo[];
    workflows: string[];
    features: string[];
    troubleshooting: string[];
  } {
    const lowerQuery = query.toLowerCase();
    
    const relevantComponents = this.knowledge.components.filter(comp => 
      comp.name.toLowerCase().includes(lowerQuery) ||
      comp.description?.toLowerCase().includes(lowerQuery) ||
      comp.category.toLowerCase().includes(lowerQuery)
    );

    const relevantWorkflows = Object.keys(this.knowledge.workflows).filter(workflow =>
      workflow.toLowerCase().includes(lowerQuery) ||
      this.knowledge.workflows[workflow].some(step => 
        step.name.toLowerCase().includes(lowerQuery) ||
        step.description.toLowerCase().includes(lowerQuery)
      )
    );

    const relevantFeatures = Object.keys(this.knowledge.features).filter(feature =>
      feature.toLowerCase().includes(lowerQuery) ||
      this.knowledge.features[feature].toLowerCase().includes(lowerQuery)
    );

    const relevantTroubleshooting = Object.keys(this.knowledge.troubleshooting).filter(key =>
      key.toLowerCase().includes(lowerQuery) ||
      this.knowledge.troubleshooting[key].problem.toLowerCase().includes(lowerQuery) ||
      this.knowledge.troubleshooting[key].solutions.some(solution => 
        solution.toLowerCase().includes(lowerQuery)
      )
    );

    logger.debug('Knowledge search results', {
      query,
      results: {
        components: relevantComponents.length,
        workflows: relevantWorkflows.length, 
        features: relevantFeatures.length,
        troubleshooting: relevantTroubleshooting.length
      }
    }, 'ComponentScanner');

    return {
      components: relevantComponents,
      workflows: relevantWorkflows,
      features: relevantFeatures,
      troubleshooting: relevantTroubleshooting
    };
  }

  // Get feature explanation
  getFeatureExplanation(featureName: string): string | null {
    return this.knowledge.features[featureName] || null;
  }

  // Get troubleshooting information
  getTroubleshootingInfo(issueKey: string): { problem: string; solutions: string[] } | null {
    return this.knowledge.troubleshooting[issueKey] || null;
  }

  // Get contextual suggestions based on current state
  getContextualSuggestions(context: {
    route: string;
    dataLoaded: boolean;
    chartType?: string;
    userWorkflow?: string;
  }): {
    nextSteps: string[];
    relevantFeatures: string[];
    helpfulTips: string[];
  } {
    const suggestions = {
      nextSteps: [] as string[],
      relevantFeatures: [] as string[],
      helpfulTips: [] as string[]
    };

    // Route-based suggestions
    if (context.route === '/app' && !context.dataLoaded) {
      suggestions.nextSteps.push('Upload your data file to get started');
      suggestions.relevantFeatures.push('File upload supports CSV, Excel, and JSON');
      suggestions.helpfulTips.push('Demo datasets are available if you want to explore first');
    }

    if (context.route === '/app' && context.dataLoaded) {
      suggestions.nextSteps.push('Create your first visualization');
      suggestions.relevantFeatures.push('AI chat can help you explore your data');
      suggestions.helpfulTips.push('Start with a simple bar or line chart');
    }

    if (context.route.includes('charts') && context.chartType) {
      suggestions.nextSteps.push('Customize colors and formatting');
      suggestions.nextSteps.push('Save chart to dashboard');
      suggestions.relevantFeatures.push('Multiple series support');
      suggestions.helpfulTips.push('Data labels can make charts more readable');
    }

    if (context.route.includes('dashboard')) {
      suggestions.nextSteps.push('Add more charts to your dashboard');
      suggestions.relevantFeatures.push('Global filters affect all charts');
      suggestions.helpfulTips.push('Drag and resize tiles to arrange your layout');
    }

    return suggestions;
  }
}

// Singleton instance
export const componentScanner = new ComponentScanner();
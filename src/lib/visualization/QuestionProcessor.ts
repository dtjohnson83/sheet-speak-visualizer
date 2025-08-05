import { DataRow, ColumnInfo } from '@/pages/Index';

export type QuestionIntent = 
  | 'trend_analysis'
  | 'comparison'
  | 'distribution'
  | 'correlation'
  | 'anomaly_detection'
  | 'performance_metrics'
  | 'relationship_mapping'
  | 'forecasting'
  | 'segmentation'
  | 'risk_assessment';

export type VisualizationType = 
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'scatter_plot'
  | 'heatmap'
  | 'network_graph'
  | 'treemap'
  | 'funnel_chart'
  | 'gauge_chart'
  | 'area_chart';

export interface QuestionAnalysis {
  originalQuestion: string;
  intent: QuestionIntent;
  confidence: number;
  entities: string[];
  timeframe?: string;
  metrics: string[];
  dimensions: string[];
  filters?: Record<string, any>;
  suggestedVisualization: VisualizationType;
  businessContext: string;
  executiveSummary: string;
}

export interface VisualizationSpec {
  type: VisualizationType;
  title: string;
  description: string;
  dataTransformation: string;
  chartConfig: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: 'sum' | 'count' | 'average' | 'max' | 'min';
    colorBy?: string;
    size?: string;
  };
  insights: string[];
  recommendations: string[];
}

export class QuestionProcessor {
  private intentPatterns: Record<QuestionIntent, string[]>;
  private visualizationMapping: Record<QuestionIntent, VisualizationType[]>;

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    this.intentPatterns = {
      trend_analysis: [
        'trend', 'over time', 'historical', 'growth', 'decline', 'pattern',
        'change', 'evolution', 'progression', 'development', 'timeline'
      ],
      comparison: [
        'compare', 'vs', 'versus', 'difference', 'best', 'worst', 'top',
        'bottom', 'highest', 'lowest', 'better', 'worse', 'rank'
      ],
      distribution: [
        'distribution', 'spread', 'breakdown', 'composition', 'share',
        'percentage', 'proportion', 'mix', 'allocation', 'split'
      ],
      correlation: [
        'correlation', 'relationship', 'related', 'connected', 'impact',
        'influence', 'affect', 'dependency', 'association', 'link'
      ],
      anomaly_detection: [
        'outlier', 'anomaly', 'unusual', 'strange', 'unexpected', 'irregular',
        'deviation', 'abnormal', 'exception', 'odd', 'suspicious'
      ],
      performance_metrics: [
        'performance', 'KPI', 'metric', 'score', 'rating', 'efficiency',
        'productivity', 'effectiveness', 'success', 'achievement'
      ],
      relationship_mapping: [
        'network', 'connections', 'relationships', 'interactions', 'flows',
        'dependencies', 'hierarchy', 'structure', 'ecosystem', 'map'
      ],
      forecasting: [
        'predict', 'forecast', 'future', 'projection', 'estimate', 'expect',
        'anticipate', 'outlook', 'prospect', 'tendency', 'likelihood'
      ],
      segmentation: [
        'segment', 'group', 'cluster', 'category', 'type', 'classification',
        'division', 'partition', 'bucket', 'cohort', 'demographics'
      ],
      risk_assessment: [
        'risk', 'threat', 'danger', 'vulnerability', 'exposure', 'hazard',
        'concern', 'issue', 'problem', 'challenge', 'compliance'
      ]
    };

    this.visualizationMapping = {
      trend_analysis: ['line_chart', 'area_chart'],
      comparison: ['bar_chart', 'line_chart'],
      distribution: ['pie_chart', 'treemap', 'bar_chart'],
      correlation: ['scatter_plot', 'heatmap'],
      anomaly_detection: ['scatter_plot', 'line_chart'],
      performance_metrics: ['gauge_chart', 'bar_chart'],
      relationship_mapping: ['network_graph', 'heatmap'],
      forecasting: ['line_chart', 'area_chart'],
      segmentation: ['pie_chart', 'treemap', 'bar_chart'],
      risk_assessment: ['heatmap', 'gauge_chart', 'bar_chart']
    };
  }

  async analyzeQuestion(
    question: string, 
    data: DataRow[], 
    columns: ColumnInfo[]
  ): Promise<QuestionAnalysis> {
    const normalizedQuestion = question.toLowerCase();
    
    // Detect intent
    const intent = this.detectIntent(normalizedQuestion);
    const confidence = this.calculateConfidence(normalizedQuestion, intent);
    
    // Extract entities and metrics
    const entities = this.extractEntities(normalizedQuestion, columns);
    const metrics = this.extractMetrics(normalizedQuestion, columns);
    const dimensions = this.extractDimensions(normalizedQuestion, columns);
    const timeframe = this.extractTimeframe(normalizedQuestion);
    
    // Suggest visualization
    const suggestedVisualization = this.suggestVisualization(intent, data, columns);
    
    // Generate business context
    const businessContext = this.generateBusinessContext(intent, entities, metrics);
    const executiveSummary = this.generateExecutiveSummary(question, intent, entities);

    return {
      originalQuestion: question,
      intent,
      confidence,
      entities,
      timeframe,
      metrics,
      dimensions,
      suggestedVisualization,
      businessContext,
      executiveSummary
    };
  }

  generateVisualizationSpec(
    analysis: QuestionAnalysis,
    data: DataRow[],
    columns: ColumnInfo[]
  ): VisualizationSpec {
    const { intent, suggestedVisualization, metrics, dimensions } = analysis;
    
    return {
      type: suggestedVisualization,
      title: this.generateChartTitle(analysis),
      description: this.generateChartDescription(analysis),
      dataTransformation: this.generateDataTransformation(analysis, columns),
      chartConfig: this.generateChartConfig(analysis, columns),
      insights: this.generateInsights(analysis, data),
      recommendations: this.generateRecommendations(analysis, intent)
    };
  }

  private detectIntent(question: string): QuestionIntent {
    let bestIntent: QuestionIntent = 'performance_metrics';
    let maxScore = 0;

    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      const score = patterns.reduce((acc, pattern) => {
        return acc + (question.includes(pattern) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent as QuestionIntent;
      }
    }

    return bestIntent;
  }

  private calculateConfidence(question: string, intent: QuestionIntent): number {
    const patterns = this.intentPatterns[intent];
    const matches = patterns.filter(pattern => question.includes(pattern)).length;
    return Math.min(0.9, 0.3 + (matches * 0.2));
  }

  private extractEntities(question: string, columns: ColumnInfo[]): string[] {
    const entities: string[] = [];
    
    // Extract column names mentioned in the question
    for (const column of columns) {
      const columnName = column.name.toLowerCase();
      const variations = [
        columnName,
        columnName.replace(/_/g, ' '),
        columnName.replace(/([A-Z])/g, ' $1').toLowerCase().trim()
      ];
      
      if (variations.some(variation => question.includes(variation))) {
        entities.push(column.name);
      }
    }

    // Extract business entities
    const businessEntities = [
      'customer', 'product', 'revenue', 'sales', 'marketing', 'employee',
      'order', 'campaign', 'lead', 'conversion', 'profit', 'cost',
      'user', 'transaction', 'inventory', 'quality', 'performance'
    ];

    for (const entity of businessEntities) {
      if (question.includes(entity)) {
        entities.push(entity);
      }
    }

    return [...new Set(entities)];
  }

  private extractMetrics(question: string, columns: ColumnInfo[]): string[] {
    const metricKeywords = ['total', 'sum', 'average', 'count', 'max', 'min', 'rate', 'percentage'];
    const metrics: string[] = [];

    // Look for numeric columns that could be metrics
    const numericColumns = columns.filter(col => col.type === 'numeric');
    
    for (const column of numericColumns) {
      const columnName = column.name.toLowerCase();
      if (question.includes(columnName) || 
          metricKeywords.some(keyword => question.includes(keyword))) {
        metrics.push(column.name);
      }
    }

    return [...new Set(metrics)];
  }

  private extractDimensions(question: string, columns: ColumnInfo[]): string[] {
    const dimensions: string[] = [];
    
    // Look for categorical columns that could be dimensions
    const categoricalColumns = columns.filter(col => col.type === 'categorical' || col.type === 'text');
    
    for (const column of categoricalColumns) {
      const columnName = column.name.toLowerCase();
      if (question.includes(columnName)) {
        dimensions.push(column.name);
      }
    }

    return [...new Set(dimensions)];
  }

  private extractTimeframe(question: string): string | undefined {
    const timeframes = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'last week', 'last month', 'last year'];
    
    for (const timeframe of timeframes) {
      if (question.includes(timeframe)) {
        return timeframe;
      }
    }

    return undefined;
  }

  private suggestVisualization(
    intent: QuestionIntent,
    data: DataRow[],
    columns: ColumnInfo[]
  ): VisualizationType {
    const possibleVisualizations = this.visualizationMapping[intent];
    
    // Simple heuristic: choose based on data characteristics
    const numericColumns = columns.filter(col => col.type === 'numeric').length;
    const categoricalColumns = columns.filter(col => col.type === 'categorical').length;
    
    if (possibleVisualizations.includes('network_graph') && data.length > 20) {
      return 'network_graph';
    }
    
    if (possibleVisualizations.includes('scatter_plot') && numericColumns >= 2) {
      return 'scatter_plot';
    }
    
    if (possibleVisualizations.includes('pie_chart') && categoricalColumns >= 1) {
      return 'pie_chart';
    }
    
    return possibleVisualizations[0];
  }

  private generateBusinessContext(intent: QuestionIntent, entities: string[], metrics: string[]): string {
    const contextMap: Record<QuestionIntent, string> = {
      trend_analysis: `Analyzing temporal patterns in ${entities.join(', ')} to identify growth opportunities and potential risks.`,
      comparison: `Comparative analysis of ${entities.join(', ')} to identify top performers and optimization opportunities.`,
      distribution: `Understanding the composition and allocation of ${entities.join(', ')} across different segments.`,
      correlation: `Investigating relationships between ${entities.join(', ')} to uncover insights for strategic decision-making.`,
      anomaly_detection: `Identifying unusual patterns in ${entities.join(', ')} that may indicate opportunities or risks.`,
      performance_metrics: `Evaluating key performance indicators for ${entities.join(', ')} to assess business health.`,
      relationship_mapping: `Mapping connections and dependencies between ${entities.join(', ')} to optimize operations.`,
      forecasting: `Predicting future trends in ${entities.join(', ')} to support strategic planning.`,
      segmentation: `Grouping ${entities.join(', ')} into meaningful segments for targeted strategies.`,
      risk_assessment: `Assessing potential risks and vulnerabilities in ${entities.join(', ')} operations.`
    };

    return contextMap[intent] || 'Analyzing business data to generate actionable insights.';
  }

  private generateExecutiveSummary(question: string, intent: QuestionIntent, entities: string[]): string {
    return `Business Intelligence Analysis: ${question}\n\nThis ${intent.replace('_', ' ')} focuses on ${entities.slice(0, 3).join(', ')} to provide actionable insights for strategic decision-making. The analysis will help identify opportunities for optimization, risk mitigation, and performance improvement.`;
  }

  private generateChartTitle(analysis: QuestionAnalysis): string {
    const { intent, entities } = analysis;
    const primaryEntity = entities[0] || 'Business Metrics';
    
    const titleMap: Record<QuestionIntent, string> = {
      trend_analysis: `${primaryEntity} Trends Over Time`,
      comparison: `${primaryEntity} Performance Comparison`,
      distribution: `${primaryEntity} Distribution Analysis`,
      correlation: `${primaryEntity} Relationship Analysis`,
      anomaly_detection: `${primaryEntity} Anomaly Detection`,
      performance_metrics: `${primaryEntity} Performance Dashboard`,
      relationship_mapping: `${primaryEntity} Network Analysis`,
      forecasting: `${primaryEntity} Forecast Analysis`,
      segmentation: `${primaryEntity} Segmentation Analysis`,
      risk_assessment: `${primaryEntity} Risk Assessment`
    };

    return titleMap[intent] || `${primaryEntity} Analysis`;
  }

  private generateChartDescription(analysis: QuestionAnalysis): string {
    return `${analysis.businessContext} This visualization provides insights based on the question: "${analysis.originalQuestion}"`;
  }

  private generateDataTransformation(analysis: QuestionAnalysis, columns: ColumnInfo[]): string {
    const { metrics, dimensions } = analysis;
    
    return `Data aggregated by ${dimensions.join(', ') || 'category'} with metrics: ${metrics.join(', ') || 'default measures'}`;
  }

  private generateChartConfig(analysis: QuestionAnalysis, columns: ColumnInfo[]): VisualizationSpec['chartConfig'] {
    const { metrics, dimensions, suggestedVisualization } = analysis;
    
    const numericColumns = columns.filter(col => col.type === 'numeric');
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    
    const config: VisualizationSpec['chartConfig'] = {
      aggregation: 'sum'
    };

    if (suggestedVisualization === 'scatter_plot' && numericColumns.length >= 2) {
      config.xAxis = numericColumns[0]?.name;
      config.yAxis = numericColumns[1]?.name;
    } else if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      config.xAxis = categoricalColumns[0]?.name;
      config.yAxis = numericColumns[0]?.name;
      config.groupBy = categoricalColumns[0]?.name;
    }

    if (dimensions.length > 0) {
      config.colorBy = dimensions[0];
    }

    return config;
  }

  private generateInsights(analysis: QuestionAnalysis, data: DataRow[]): string[] {
    const { intent, entities } = analysis;
    const dataSize = data.length;
    
    const insights: string[] = [
      `Analysis based on ${dataSize} data points covering ${entities.join(', ')}.`,
      `${intent.replace('_', ' ')} reveals key patterns for business optimization.`,
      `Confidence level: ${Math.round(analysis.confidence * 100)}% based on question analysis.`
    ];

    // Add intent-specific insights
    switch (intent) {
      case 'trend_analysis':
        insights.push('Temporal patterns indicate opportunities for growth optimization.');
        break;
      case 'comparison':
        insights.push('Performance variations suggest areas for improvement and best practice sharing.');
        break;
      case 'risk_assessment':
        insights.push('Risk factors identified require immediate attention and mitigation strategies.');
        break;
    }

    return insights;
  }

  private generateRecommendations(analysis: QuestionAnalysis, intent: QuestionIntent): string[] {
    const recommendationMap: Record<QuestionIntent, string[]> = {
      trend_analysis: [
        'Monitor key trend indicators regularly',
        'Implement predictive analytics for early trend detection',
        'Develop strategies to capitalize on positive trends'
      ],
      comparison: [
        'Focus resources on top-performing areas',
        'Investigate root causes of performance differences',
        'Implement best practices across all segments'
      ],
      distribution: [
        'Optimize resource allocation based on distribution patterns',
        'Identify opportunities for portfolio rebalancing',
        'Address underperforming segments'
      ],
      correlation: [
        'Leverage strong correlations for strategic planning',
        'Investigate unexpected relationships for innovation opportunities',
        'Monitor key relationships for early warning signals'
      ],
      anomaly_detection: [
        'Investigate root causes of anomalies immediately',
        'Implement automated anomaly monitoring',
        'Develop response protocols for future anomalies'
      ],
      performance_metrics: [
        'Set performance benchmarks and targets',
        'Implement regular performance review cycles',
        'Develop improvement action plans for underperforming areas'
      ],
      relationship_mapping: [
        'Optimize network connections and dependencies',
        'Identify key influencers and leverage their impact',
        'Strengthen critical relationships and reduce single points of failure'
      ],
      forecasting: [
        'Use forecasts for strategic planning and resource allocation',
        'Implement scenario planning based on predictions',
        'Monitor actual vs predicted performance for model improvement'
      ],
      segmentation: [
        'Develop targeted strategies for each segment',
        'Allocate resources based on segment potential',
        'Create personalized approaches for high-value segments'
      ],
      risk_assessment: [
        'Implement immediate risk mitigation strategies',
        'Develop comprehensive risk management framework',
        'Establish regular risk monitoring and reporting'
      ]
    };

    return recommendationMap[intent] || [
      'Review analysis results with key stakeholders',
      'Develop action plan based on insights',
      'Monitor progress and adjust strategies as needed'
    ];
  }
}
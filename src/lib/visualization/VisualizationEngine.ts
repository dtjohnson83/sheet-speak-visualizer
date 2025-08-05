import { DataRow, ColumnInfo } from '@/pages/Index';
import { QuestionAnalysis, VisualizationSpec, VisualizationType } from './QuestionProcessor';
import { SimpleGraphAnalyzer, SimpleGraphInsight } from '@/lib/analytics/SimpleGraphAnalyzer';
import { parseDate, detectTemporalColumns } from '@/lib/chart/temporalDataProcessor';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface NetworkGraphData {
  nodes: Array<{
    id: string;
    label: string;
    value: number;
    group?: string;
    color?: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    value: number;
    label?: string;
  }>;
}

export interface ProcessedVisualization {
  id: string;
  type: VisualizationType;
  title: string;
  description: string;
  chartData?: ChartData;
  networkData?: NetworkGraphData;
  metadata: {
    totalDataPoints: number;
    keyMetrics: Record<string, number | string>;
    insights: string[];
    recommendations: string[];
    confidence: number;
  };
  businessImpact: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    financialImpact: string;
    timeframe: string;
    stakeholders: string[];
  };
}

export class VisualizationEngine {
  private colorPalette = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5A5A', '#6366F1', '#06B6D4', '#84CC16', '#F97316'
  ];
  private graphAnalyzer = new SimpleGraphAnalyzer();

  async generateVisualization(
    analysis: QuestionAnalysis,
    spec: VisualizationSpec,
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<ProcessedVisualization> {
    const processedData = this.processDataForVisualization(data, columns, spec);
    
    return {
      id: `viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: spec.type,
      title: spec.title,
      description: spec.description,
      chartData: this.generateChartData(processedData, spec),
      networkData: spec.type === 'network_graph' ? this.generateNetworkData(processedData, spec) : undefined,
      metadata: {
        totalDataPoints: data.length,
        keyMetrics: this.calculateKeyMetrics(processedData, spec, columns),
        insights: spec.insights,
        recommendations: spec.recommendations,
        confidence: analysis.confidence
      },
      businessImpact: this.assessBusinessImpact(analysis, processedData)
    };
  }

  private processDataForVisualization(
    data: DataRow[],
    columns: ColumnInfo[],
    spec: VisualizationSpec
  ): { processed: any[]; summary: Record<string, any> } {
    const { chartConfig } = spec;
    
    if (!chartConfig.xAxis || !chartConfig.yAxis) {
      // Fallback processing
      return this.createFallbackData(data, columns);
    }

    // Check if x-axis is a temporal column
    const temporalColumns = detectTemporalColumns(columns, data);
    const isXAxisTemporal = temporalColumns.some(col => col.name === chartConfig.xAxis);

    const processed = data.map(row => {
      let xValue = row[chartConfig.xAxis!];
      
      // Parse date values if x-axis is temporal
      if (isXAxisTemporal) {
        const parsedDate = parseDate(xValue);
        if (parsedDate) {
          xValue = parsedDate.toISOString(); // Use ISO string for consistent sorting
        }
      }
      
      return {
        x: xValue,
        y: this.parseNumericValue(row[chartConfig.yAxis!]),
        group: chartConfig.groupBy ? row[chartConfig.groupBy] : 'default',
        original: row,
        parsedDate: isXAxisTemporal ? parseDate(row[chartConfig.xAxis!]) : null
      };
    }).filter(item => item.y !== null && (isXAxisTemporal ? item.parsedDate !== null : true));

    // Sort by date if x-axis is temporal
    if (isXAxisTemporal) {
      processed.sort((a, b) => {
        if (a.parsedDate && b.parsedDate) {
          return a.parsedDate.getTime() - b.parsedDate.getTime();
        }
        return 0;
      });
    }

    const summary = this.calculateSummaryStatistics(processed);

    return { processed, summary };
  }

  private createFallbackData(data: DataRow[], columns: ColumnInfo[]): { processed: any[]; summary: Record<string, any> } {
    const numericColumns = columns.filter(col => col.type === 'numeric');
    const categoricalColumns = columns.filter(col => col.type === 'categorical');

    if (numericColumns.length === 0) {
      // Count categorical values
      const categoryColumn = categoricalColumns[0]?.name;
      if (categoryColumn) {
        const counts = data.reduce((acc, row) => {
          const value = String(row[categoryColumn] || 'Unknown');
          acc[value] = (acc[value] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const processed = Object.entries(counts).map(([key, value]) => ({
          x: key,
          y: value,
          group: 'count'
        }));

        return { processed, summary: { total: data.length, categories: Object.keys(counts).length } };
      }
    }

    // Default to first numeric column
    const targetColumn = numericColumns[0]?.name;
    if (targetColumn) {
      const processed = data.map((row, index) => ({
        x: index.toString(),
        y: this.parseNumericValue(row[targetColumn]),
        group: 'default'
      })).filter(item => item.y !== null);

      return { processed, summary: this.calculateSummaryStatistics(processed) };
    }

    // Ultimate fallback
    return {
      processed: [{ x: 'No Data', y: 0, group: 'default' }],
      summary: { total: 0 }
    };
  }

  private parseNumericValue(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private calculateSummaryStatistics(processed: any[]): Record<string, any> {
    const values = processed.map(p => p.y).filter(v => v !== null);
    
    if (values.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    }

    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  private generateChartData(
    processedData: { processed: any[]; summary: Record<string, any> },
    spec: VisualizationSpec
  ): ChartData {
    const { processed } = processedData;

    switch (spec.type) {
      case 'pie_chart':
        return this.generatePieChartData(processed);
      case 'bar_chart':
        return this.generateBarChartData(processed);
      case 'line_chart':
      case 'area_chart':
        return this.generateLineChartData(processed, spec.type === 'area_chart');
      case 'scatter_plot':
        return this.generateScatterPlotData(processed);
      default:
        return this.generateBarChartData(processed);
    }
  }

  private generatePieChartData(processed: any[]): ChartData {
    // Group by x value and sum y values
    const grouped = processed.reduce((acc, item) => {
      const key = String(item.x);
      acc[key] = (acc[key] || 0) + item.y;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(grouped);
    const data = Object.values(grouped) as number[];

    return {
      labels,
      datasets: [{
        label: 'Distribution',
        data,
        backgroundColor: labels.map((_, index) => this.colorPalette[index % this.colorPalette.length])
      }]
    };
  }

  private generateBarChartData(processed: any[]): ChartData {
    // Group by x value and sum y values
    const grouped = processed.reduce((acc, item) => {
      const key = String(item.x);
      acc[key] = (acc[key] || 0) + item.y;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(grouped);
    const data = Object.values(grouped) as number[];

    return {
      labels,
      datasets: [{
        label: 'Values',
        data,
        backgroundColor: this.colorPalette[0],
        borderColor: this.colorPalette[0],
        borderWidth: 1
      }]
    };
  }

  private generateLineChartData(processed: any[], filled: boolean = false): ChartData {
    // Data is already sorted in processDataForVisualization if temporal
    const labels = processed.map(item => {
      // Format date labels for better readability if it's a date
      if (item.parsedDate) {
        return item.parsedDate.toLocaleDateString();
      }
      return String(item.x);
    });
    const data = processed.map(item => item.y);

    return {
      labels,
      datasets: [{
        label: 'Trend',
        data,
        borderColor: this.colorPalette[0],
        backgroundColor: filled ? this.colorPalette[0] + '30' : 'transparent',
        fill: filled,
        borderWidth: 2
      }]
    };
  }

  private generateScatterPlotData(processed: any[]): ChartData {
    return {
      labels: processed.map(item => String(item.x)),
      datasets: [{
        label: 'Data Points',
        data: processed.map(item => item.y),
        backgroundColor: this.colorPalette[0],
        borderColor: this.colorPalette[0]
      }]
    };
  }

  private generateNetworkData(
    processedData: { processed: any[]; summary: Record<string, any> },
    spec: VisualizationSpec
  ): NetworkGraphData {
    const { processed } = processedData;
    
    // Create nodes and edges based on data relationships
    const nodes: NetworkGraphData['nodes'] = [];
    const edges: NetworkGraphData['edges'] = [];
    const nodeMap = new Map<string, number>();

    // Create nodes from unique x and group values
    processed.forEach(item => {
      const nodeId = String(item.x);
      if (!nodeMap.has(nodeId)) {
        nodes.push({
          id: nodeId,
          label: nodeId,
          value: item.y,
          group: String(item.group),
          color: this.colorPalette[nodes.length % this.colorPalette.length]
        });
        nodeMap.set(nodeId, item.y);
      }
    });

    // Create edges based on data relationships
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 1; j < Math.min(nodes.length, i + 4); j++) {
        const strength = Math.random() * 10; // Simulate relationship strength
        if (strength > 5) {
          edges.push({
            from: nodes[i].id,
            to: nodes[j].id,
            value: strength,
            label: `${strength.toFixed(1)}`
          });
        }
      }
    }

    return { nodes, edges };
  }

  private calculateKeyMetrics(
    processedData: { processed: any[]; summary: Record<string, any> },
    spec?: VisualizationSpec,
    columns?: ColumnInfo[]
  ): Record<string, number | string> {
    const { processed, summary } = processedData;
    
    // Identify the primary analysis column based on the spec
    const primaryColumn = spec?.chartConfig?.yAxis || spec?.chartConfig?.xAxis || 'value';
    const primaryColumnInfo = columns?.find(col => col.name === primaryColumn);
    const columnDisplayName = primaryColumnInfo?.name || primaryColumn;
    
    // Create more descriptive metric names that include the column being analyzed
    const cleanColumnName = columnDisplayName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    
    return {
      totalDataPoints: processed.length,
      [`Average ${columnDisplayName}`]: Math.round((summary.avg || 0) * 100) / 100,
      [`Maximum ${columnDisplayName}`]: Math.round((summary.max || 0) * 100) / 100,
      [`Minimum ${columnDisplayName}`]: Math.round((summary.min || 0) * 100) / 100,
      [`Total ${columnDisplayName}`]: Math.round((summary.sum || 0) * 100) / 100,
      [`Variation (${columnDisplayName})`]: summary.avg ? 
        Math.round((Math.sqrt(summary.variance || 0) / summary.avg) * 100 * 100) / 100 : 0,
      analyzedColumn: columnDisplayName
    };
  }

  private assessBusinessImpact(
    analysis: QuestionAnalysis,
    processedData: { processed: any[]; summary: Record<string, any> }
  ): ProcessedVisualization['businessImpact'] {
    const { intent, confidence } = analysis;
    const { summary } = processedData;

    // Determine priority based on intent and data characteristics
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    if (intent === 'risk_assessment' || intent === 'anomaly_detection') {
      priority = 'critical';
    } else if (intent === 'performance_metrics' || intent === 'trend_analysis') {
      priority = 'high';
    } else if (confidence > 0.7) {
      priority = 'high';
    }

    // Estimate financial impact
    const dataSize = processedData.processed.length;
    const avgValue = summary.avg || 0;
    const estimatedImpact = Math.round(dataSize * avgValue * 0.1); // Simple heuristic

    return {
      priority,
      financialImpact: estimatedImpact > 1000 ? 
        `$${(estimatedImpact / 1000).toFixed(1)}K potential impact` : 
        `$${estimatedImpact} potential impact`,
      timeframe: this.getTimeframeByIntent(intent),
      stakeholders: this.getStakeholdersByIntent(intent)
    };
  }

  private getTimeframeByIntent(intent: string): string {
    const timeframes = {
      'risk_assessment': 'Immediate action required',
      'anomaly_detection': '1-2 weeks',
      'performance_metrics': '1 month',
      'trend_analysis': '2-3 months',
      'forecasting': '3-6 months'
    };
    
    return timeframes[intent as keyof typeof timeframes] || '1-2 months';
  }

  private getStakeholdersByIntent(intent: string): string[] {
    const stakeholders = {
      'risk_assessment': ['Risk Manager', 'Executive Team', 'Compliance Officer'],
      'performance_metrics': ['Operations Manager', 'Department Head', 'Executive Team'],
      'trend_analysis': ['Strategy Team', 'Marketing Manager', 'CEO'],
      'forecasting': ['Planning Team', 'Finance Director', 'Executive Team'],
      'comparison': ['Operations Manager', 'Team Leaders', 'Executive Team']
    };
    
    return stakeholders[intent as keyof typeof stakeholders] || ['Manager', 'Executive Team'];
  }

  generateAutomatedInsights(visualization: ProcessedVisualization): string[] {
    const { chartData, metadata, type } = visualization;
    const insights: string[] = [];

    if (!chartData) return insights;

    // Generate insights based on visualization type and data
    switch (type) {
      case 'pie_chart':
        insights.push(...this.analyzePieChart(chartData, metadata));
        break;
      case 'bar_chart':
        insights.push(...this.analyzeBarChart(chartData, metadata));
        break;
      case 'line_chart':
        insights.push(...this.analyzeLineChart(chartData, metadata));
        break;
      case 'scatter_plot':
        insights.push(...this.analyzeScatterPlot(chartData, metadata));
        break;
    }

    return insights;
  }

  generateGraphInsights(
    data: DataRow[], 
    columns: ColumnInfo[], 
    intent: string
  ): SimpleGraphInsight[] {
    const allInsights: SimpleGraphInsight[] = [];
    
    // Generate different types of insights based on intent
    if (intent.includes('connect') || intent.includes('relation')) {
      allInsights.push(...this.graphAnalyzer.analyzeForConnections(data, columns));
    }
    
    if (intent.includes('pattern') || intent.includes('trend')) {
      allInsights.push(...this.graphAnalyzer.analyzeForPatterns(data, columns));
    }
    
    if (intent.includes('group') || intent.includes('cluster') || intent.includes('similar')) {
      allInsights.push(...this.graphAnalyzer.analyzeForGroups(data, columns));
    }
    
    if (intent.includes('outlier') || intent.includes('unusual') || intent.includes('anomal')) {
      allInsights.push(...this.graphAnalyzer.analyzeForOutliers(data, columns));
    }
    
    // If no specific intent matched, provide a mix of insights
    if (allInsights.length === 0) {
      allInsights.push(...this.graphAnalyzer.analyzeForGroups(data, columns));
      allInsights.push(...this.graphAnalyzer.analyzeForPatterns(data, columns));
      allInsights.push(...this.graphAnalyzer.analyzeForOutliers(data, columns));
    }
    
    return allInsights.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzePieChart(chartData: ChartData, metadata: any): string[] {
    const insights: string[] = [];
    const data = chartData.datasets[0]?.data || [];
    const labels = chartData.labels || [];
    
    if (data.length === 0) return insights;

    const total = data.reduce((sum, value) => sum + value, 0);
    const maxIndex = data.indexOf(Math.max(...data));
    const maxPercentage = ((data[maxIndex] / total) * 100).toFixed(1);
    
    insights.push(`${labels[maxIndex]} represents the largest segment at ${maxPercentage}% of the total.`);
    
    // Check for concentration
    const top3 = data.slice().sort((a, b) => b - a).slice(0, 3).reduce((sum, val) => sum + val, 0);
    const top3Percentage = ((top3 / total) * 100).toFixed(1);
    
    if (parseFloat(top3Percentage) > 80) {
      insights.push(`High concentration: Top 3 segments account for ${top3Percentage}% of the total.`);
    }

    return insights;
  }

  private analyzeBarChart(chartData: ChartData, metadata: any): string[] {
    const insights: string[] = [];
    const data = chartData.datasets[0]?.data || [];
    const labels = chartData.labels || [];
    
    if (data.length === 0) return insights;

    const maxIndex = data.indexOf(Math.max(...data));
    const minIndex = data.indexOf(Math.min(...data));
    
    insights.push(`Highest value: ${labels[maxIndex]} (${data[maxIndex]})`);
    insights.push(`Lowest value: ${labels[minIndex]} (${data[minIndex]})`);
    
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    const aboveAverage = data.filter(val => val > avg).length;
    
    insights.push(`${aboveAverage} out of ${data.length} categories are above average (${avg.toFixed(1)}).`);

    return insights;
  }

  private analyzeLineChart(chartData: ChartData, metadata: any): string[] {
    const insights: string[] = [];
    const data = chartData.datasets[0]?.data || [];
    
    if (data.length < 2) return insights;

    // Trend analysis
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const change = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
    
    if (parseFloat(change) > 0) {
      insights.push(`Positive trend: ${change}% increase from start to end.`);
    } else {
      insights.push(`Negative trend: ${Math.abs(parseFloat(change))}% decrease from start to end.`);
    }

    // Volatility analysis
    const differences = data.slice(1).map((val, i) => Math.abs(val - data[i]));
    const avgVolatility = differences.reduce((sum, val) => sum + val, 0) / differences.length;
    
    if (avgVolatility > (Math.max(...data) - Math.min(...data)) * 0.1) {
      insights.push('High volatility detected in the data series.');
    }

    return insights;
  }

  private analyzeScatterPlot(chartData: ChartData, metadata: any): string[] {
    const insights: string[] = [];
    const data = chartData.datasets[0]?.data || [];
    
    if (data.length < 3) return insights;

    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    const outliers = data.filter(val => Math.abs(val - avg) > 2 * stdDev);
    
    if (outliers.length > 0) {
      insights.push(`${outliers.length} potential outliers detected (beyond 2 standard deviations).`);
    }

    insights.push(`Data spread: Standard deviation of ${stdDev.toFixed(2)}.`);

    return insights;
  }
}

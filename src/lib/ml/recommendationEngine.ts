import { DataRow, ColumnInfo } from '@/pages/Index';
import { MLInsight } from './types';

export function generateSmartRecommendations(
  data: DataRow[],
  columns: ColumnInfo[],
  issues: any[],
  insights: MLInsight[]
): MLInsight[] {
  const recommendations: MLInsight[] = [];
  
  // Analyze issue distribution
  const issuesByColumn = new Map<string, number>();
  issues.forEach(issue => {
    issuesByColumn.set(issue.column, (issuesByColumn.get(issue.column) || 0) + 1);
  });
  
  // High-impact column recommendations
  const problematicColumns = Array.from(issuesByColumn.entries())
    .filter(([, count]) => count > 2)
    .sort(([, a], [, b]) => b - a);
  
  if (problematicColumns.length > 0) {
    const [topColumn, issueCount] = problematicColumns[0];
    recommendations.push({
      id: `smart_rec_${Date.now()}_column`,
      type: 'recommendation',
      title: 'Prioritize Column Validation',
      description: `Focus on implementing comprehensive validation for "${topColumn}" which has ${issueCount} different types of issues.`,
      confidence: Math.min(issueCount / 5, 0.95),
      severity: 'high',
      column: topColumn,
      impact: 75,
      timestamp: new Date(),
      action: `Create validation pipeline for ${topColumn}`,
      metadata: {
        issue_count: issueCount,
        recommendation_type: 'validation_priority'
      }
    });
  }
  
  // Data volume recommendations
  if (data.length > 10000) {
    recommendations.push({
      id: `smart_rec_${Date.now()}_performance`,
      type: 'recommendation',
      title: 'Implement Sampling Strategy',
      description: `With ${data.length} rows, consider implementing data sampling for faster quality analysis while maintaining statistical significance.`,
      confidence: 0.8,
      severity: 'medium',
      impact: 60,
      timestamp: new Date(),
      action: 'Set up stratified sampling',
      metadata: {
        data_size: data.length,
        recommendation_type: 'performance_optimization'
      }
    });
  }
  
  return recommendations;
}
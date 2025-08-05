import { DataRow, ColumnInfo } from '@/pages/Index';
import { MLInsight } from './types';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedRecommendation extends MLInsight {
  financialImpact: {
    description: string;
    range: { min: number; max: number };
    confidence: number;
    basis: string;
  };
  timeframe: {
    description: string;
    weeks: number;
    phases: string[];
    dependencies: string[];
  };
  priority: {
    score: number;
    level: 'critical' | 'high' | 'medium' | 'low';
    urgency: string;
    strategicAlignment: number;
  };
  dataPoints: {
    affected: number;
    confidence: number;
    successProbability: number;
    keyMetrics: string[];
  };
  implementation: {
    steps: string[];
    resources: string[];
    risks: string[];
  };
}

export async function generateSmartRecommendations(
  data: DataRow[],
  columns: ColumnInfo[],
  issues: any[],
  insights: MLInsight[],
  businessContext?: {
    industry?: string;
    companySize?: string;
    revenue?: number;
    objectives?: string[];
    timeframe?: string;
  }
): Promise<EnhancedRecommendation[]> {
  try {
    // Call the AI business analyst edge function for enhanced recommendations
    const { data: result, error } = await supabase.functions.invoke('ai-business-analyst', {
      body: {
        data,
        columns,
        issues,
        insights,
        businessContext
      }
    });

    if (error) {
      console.error('Error calling ai-business-analyst:', error);
      return generateFallbackRecommendations(data, columns, issues, insights);
    }

    return result.recommendations || [];
  } catch (error) {
    console.error('Error generating enhanced recommendations:', error);
    return generateFallbackRecommendations(data, columns, issues, insights);
  }
}

// Fallback to basic recommendations if AI service fails
function generateFallbackRecommendations(
  data: DataRow[],
  columns: ColumnInfo[],
  issues: any[],
  insights: MLInsight[]
): EnhancedRecommendation[] {
  const recommendations: EnhancedRecommendation[] = [];
  
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
    const estimatedImpact = Math.min(issueCount * 10000, 50000);
    
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
      },
      financialImpact: {
        description: `Data quality issues in ${topColumn} typically cost businesses 15-25% in operational inefficiency`,
        range: { min: estimatedImpact * 0.5, max: estimatedImpact },
        confidence: 0.75,
        basis: 'Industry standard estimates for data quality impact'
      },
      timeframe: {
        description: 'Recommended 4-6 week implementation with immediate fixes possible',
        weeks: 5,
        phases: ['Assessment', 'Rule Definition', 'Implementation', 'Testing', 'Deployment'],
        dependencies: ['Data governance approval', 'IT resource allocation']
      },
      priority: {
        score: 85,
        level: 'high',
        urgency: `${issueCount} critical issues affecting data reliability`,
        strategicAlignment: 80
      },
      dataPoints: {
        affected: Math.round(data.length * 0.3),
        confidence: 0.8,
        successProbability: 0.85,
        keyMetrics: ['Data accuracy', 'Processing time', 'Error rates']
      },
      implementation: {
        steps: [
          'Audit current validation rules',
          'Define comprehensive validation framework',
          'Implement automated checks',
          'Set up monitoring and alerts'
        ],
        resources: ['Data analyst (0.5 FTE)', 'Developer (0.25 FTE)'],
        risks: ['Initial performance impact', 'False positive validation errors']
      }
    });
  }
  
  // Data volume recommendations
  if (data.length > 10000) {
    const performanceImpact = Math.min(data.length * 0.5, 25000);
    
    recommendations.push({
      id: `smart_rec_${Date.now()}_performance`,
      type: 'recommendation',
      title: 'Implement Performance Optimization',
      description: `With ${data.length} rows, implement performance optimization to improve processing speed and reduce costs.`,
      confidence: 0.8,
      severity: 'medium',
      impact: 60,
      timestamp: new Date(),
      action: 'Set up performance optimization',
      metadata: {
        data_size: data.length,
        recommendation_type: 'performance_optimization'
      },
      financialImpact: {
        description: 'Performance optimization typically reduces processing costs by 30-50%',
        range: { min: performanceImpact * 0.3, max: performanceImpact },
        confidence: 0.7,
        basis: 'Based on dataset size and typical optimization gains'
      },
      timeframe: {
        description: '6-8 week optimization project with incremental improvements',
        weeks: 7,
        phases: ['Analysis', 'Indexing', 'Caching', 'Testing', 'Deployment'],
        dependencies: ['Database access', 'Performance testing environment']
      },
      priority: {
        score: 70,
        level: 'medium',
        urgency: 'Large dataset affecting processing efficiency',
        strategicAlignment: 75
      },
      dataPoints: {
        affected: data.length,
        confidence: 0.85,
        successProbability: 0.90,
        keyMetrics: ['Query speed', 'Resource usage', 'System throughput']
      },
      implementation: {
        steps: [
          'Performance baseline measurement',
          'Database optimization',
          'Query optimization',
          'Monitoring setup'
        ],
        resources: ['Database specialist (0.3 FTE)', 'DevOps engineer (0.2 FTE)'],
        risks: ['Temporary downtime during optimization', 'Complexity increase']
      }
    });
  }
  
  return recommendations;
}
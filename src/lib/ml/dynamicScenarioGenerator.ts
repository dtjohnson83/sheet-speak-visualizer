// Dynamic Scenario Generator that adapts to actual data patterns
import { BusinessPrediction, BusinessScenario } from '@/hooks/usePredictiveAnalytics';
import { PreAnalysisResult } from './preAnalysisLayer';

export interface ScenarioConfig {
  basedOnTrend: boolean;
  includeInterventions: boolean;
  confidenceThreshold: number;
  riskAssessment: boolean;
}

export class DynamicScenarioGenerator {
  static generateAdaptiveScenarios(
    predictions: BusinessPrediction[],
    preAnalysis: PreAnalysisResult,
    config: ScenarioConfig = {
      basedOnTrend: true,
      includeInterventions: true,
      confidenceThreshold: 0.5,
      riskAssessment: true
    }
  ): BusinessScenario[] {
    console.log('=== Dynamic Scenario Generation ===');
    console.log('Primary trend:', preAnalysis.trendAnalysis.primaryTrend);
    console.log('Data health:', preAnalysis.dataHealth.status);
    
    const scenarios: BusinessScenario[] = [];
    
    // Determine scenario types based on actual data state
    const scenarioTypes = this.determineScenarioTypes(preAnalysis);
    
    scenarioTypes.forEach(type => {
      const scenario = this.generateScenarioByType(type, predictions, preAnalysis, config);
      if (scenario) {
        scenarios.push(scenario);
      }
    });
    
    return scenarios.slice(0, 4); // Limit to 4 most relevant scenarios
  }

  private static determineScenarioTypes(preAnalysis: PreAnalysisResult): string[] {
    const types: string[] = [];
    const { primaryTrend } = preAnalysis.trendAnalysis;
    const { status } = preAnalysis.dataHealth;
    
    // Always include current trajectory scenario
    types.push('current_trajectory');
    
    // Add scenarios based on trend direction
    switch (primaryTrend) {
      case 'strong_positive':
      case 'weak_positive':
        types.push('accelerated_growth', 'sustainable_growth');
        if (preAnalysis.trendAnalysis.volatility > 0.3) {
          types.push('volatility_correction');
        }
        break;
        
      case 'strong_negative':
      case 'weak_negative':
        types.push('turnaround_strategy', 'crisis_mitigation');
        if (status !== 'critical') {
          types.push('gradual_recovery');
        }
        break;
        
      case 'stable':
        types.push('optimization_scenario', 'breakthrough_innovation');
        if (preAnalysis.predictiveReadiness.score > 0.7) {
          types.push('strategic_expansion');
        }
        break;
    }
    
    // Add data quality improvement scenario if needed
    if (status === 'fair' || status === 'poor') {
      types.push('data_quality_improvement');
    }
    
    return types.slice(0, 4); // Return most relevant scenarios
  }

  private static generateScenarioByType(
    type: string,
    predictions: BusinessPrediction[],
    preAnalysis: PreAnalysisResult,
    config: ScenarioConfig
  ): BusinessScenario | null {
    const baseId = `scenario_${type}_${Date.now()}`;
    
    switch (type) {
      case 'current_trajectory':
        return this.generateCurrentTrajectoryScenario(baseId, predictions, preAnalysis);
        
      case 'accelerated_growth':
        return this.generateAcceleratedGrowthScenario(baseId, predictions, preAnalysis);
        
      case 'sustainable_growth':
        return this.generateSustainableGrowthScenario(baseId, predictions, preAnalysis);
        
      case 'turnaround_strategy':
        return this.generateTurnaroundScenario(baseId, predictions, preAnalysis);
        
      case 'crisis_mitigation':
        return this.generateCrisisMitigationScenario(baseId, predictions, preAnalysis);
        
      case 'gradual_recovery':
        return this.generateGradualRecoveryScenario(baseId, predictions, preAnalysis);
        
      case 'optimization_scenario':
        return this.generateOptimizationScenario(baseId, predictions, preAnalysis);
        
      case 'breakthrough_innovation':
        return this.generateBreakthroughScenario(baseId, predictions, preAnalysis);
        
      case 'strategic_expansion':
        return this.generateStrategicExpansionScenario(baseId, predictions, preAnalysis);
        
      case 'volatility_correction':
        return this.generateVolatilityCorrectionScenario(baseId, predictions, preAnalysis);
        
      case 'data_quality_improvement':
        return this.generateDataQualityScenario(baseId, predictions, preAnalysis);
        
      default:
        return null;
    }
  }

  private static generateCurrentTrajectoryScenario(
    id: string,
    predictions: BusinessPrediction[],
    preAnalysis: PreAnalysisResult
  ): BusinessScenario {
    const trendMultiplier = this.getTrendMultiplier(preAnalysis.trendAnalysis.primaryTrend, 'current');
    const confidence = Math.max(0.6, preAnalysis.predictiveReadiness.confidence);
    
    return {
      id,
      name: 'Current Trajectory',
      title: 'Continue Current Path',
      description: `Maintain current operations with ${preAnalysis.trendAnalysis.primaryTrend.replace('_', ' ')} trend continuing`,
      confidence,
      assumptions: {
        marketGrowth: trendMultiplier,
        customerRetention: this.getRetentionAssumption(preAnalysis, 'current'),
        operationalEfficiency: 1.0
      },
      predictions: predictions.map(p => ({
        type: p.type,
        prediction: p.prediction * trendMultiplier,
        unit: p.unit
      })),
      potentialImpact: Math.abs(trendMultiplier - 1),
      riskLevel: this.assessRiskLevel(preAnalysis, 'current'),
      recommendations: this.getCurrentTrajectoryRecommendations(preAnalysis)
    };
  }

  private static generateAcceleratedGrowthScenario(
    id: string,
    predictions: BusinessPrediction[],
    preAnalysis: PreAnalysisResult
  ): BusinessScenario {
    const growthMultiplier = 1.3; // Aggressive growth
    const confidence = Math.max(0.4, preAnalysis.predictiveReadiness.confidence - 0.2);
    
    return {
      id,
      name: 'Accelerated Growth',
      title: 'Aggressive Expansion Strategy',
      description: 'Implement aggressive growth initiatives to maximize positive momentum',
      confidence,
      assumptions: {
        marketGrowth: growthMultiplier,
        customerRetention: 0.85,
        operationalEfficiency: 1.15
      },
      predictions: predictions.map(p => ({
        type: p.type,
        prediction: p.prediction * growthMultiplier,
        unit: p.unit
      })),
      potentialImpact: 0.30,
      riskLevel: 'high',
      recommendations: [
        'Increase marketing investment by 50%',
        'Expand to new market segments',
        'Scale operational capacity',
        'Implement growth tracking systems',
        'Prepare risk mitigation strategies'
      ]
    };
  }

  private static generateTurnaroundScenario(
    id: string,
    predictions: BusinessPrediction[],
    preAnalysis: PreAnalysisResult
  ): BusinessScenario {
    const recoveryMultiplier = 1.1; // Modest recovery
    const confidence = Math.max(0.5, preAnalysis.predictiveReadiness.confidence);
    
    return {
      id,
      name: 'Turnaround Strategy',
      title: 'Strategic Business Recovery',
      description: 'Implement comprehensive turnaround strategy to reverse negative trends',
      confidence,
      assumptions: {
        marketGrowth: recoveryMultiplier,
        customerRetention: 0.75,
        operationalEfficiency: 1.05
      },
      predictions: predictions.map(p => ({
        type: p.type,
        prediction: p.prediction * recoveryMultiplier,
        unit: p.unit
      })),
      potentialImpact: 0.15,
      riskLevel: 'medium',
      recommendations: [
        'Conduct root cause analysis of decline',
        'Implement cost optimization measures',
        'Focus on customer retention',
        'Restructure underperforming operations',
        'Monitor key performance indicators daily'
      ]
    };
  }

  private static generateCrisisMitigationScenario(
    id: string,
    predictions: BusinessPrediction[],
    preAnalysis: PreAnalysisResult
  ): BusinessScenario {
    const stabilizationMultiplier = 0.95; // Defensive positioning
    const confidence = Math.min(0.8, preAnalysis.predictiveReadiness.confidence + 0.1);
    
    return {
      id,
      name: 'Crisis Mitigation',
      title: 'Emergency Stabilization',
      description: 'Emergency measures to stabilize operations and prevent further decline',
      confidence,
      assumptions: {
        marketGrowth: stabilizationMultiplier,
        customerRetention: 0.70,
        operationalEfficiency: 0.95
      },
      predictions: predictions.map(p => ({
        type: p.type,
        prediction: p.prediction * stabilizationMultiplier,
        unit: p.unit
      })),
      potentialImpact: 0.10,
      riskLevel: 'low',
      recommendations: [
        'Implement immediate cost controls',
        'Focus on core profitable activities',
        'Secure emergency funding if needed',
        'Communicate transparently with stakeholders',
        'Develop 90-day action plan'
      ]
    };
  }

  private static generateOptimizationScenario(
    id: string,
    predictions: BusinessPrediction[],
    preAnalysis: PreAnalysisResult
  ): BusinessScenario {
    const optimizationMultiplier = 1.15;
    const confidence = Math.max(0.7, preAnalysis.predictiveReadiness.confidence);
    
    return {
      id,
      name: 'Optimization',
      title: 'Operational Excellence',
      description: 'Focus on operational efficiency and process optimization',
      confidence,
      assumptions: {
        marketGrowth: 1.05,
        customerRetention: 0.90,
        operationalEfficiency: optimizationMultiplier
      },
      predictions: predictions.map(p => ({
        type: p.type,
        prediction: p.prediction * optimizationMultiplier,
        unit: p.unit
      })),
      potentialImpact: 0.15,
      riskLevel: 'low',
      recommendations: [
        'Implement process automation',
        'Optimize resource allocation',
        'Enhance quality control systems',
        'Train staff on best practices',
        'Monitor efficiency metrics'
      ]
    };
  }

  // Additional scenario generators...
  private static generateSustainableGrowthScenario(id: string, predictions: BusinessPrediction[], preAnalysis: PreAnalysisResult): BusinessScenario {
    return {
      id,
      name: 'Sustainable Growth',
      title: 'Balanced Expansion',
      description: 'Steady, sustainable growth while maintaining operational stability',
      confidence: preAnalysis.predictiveReadiness.confidence,
      assumptions: { marketGrowth: 1.15, customerRetention: 0.88, operationalEfficiency: 1.08 },
      predictions: predictions.map(p => ({ type: p.type, prediction: p.prediction * 1.15, unit: p.unit })),
      potentialImpact: 0.18,
      riskLevel: 'medium',
      recommendations: ['Gradual capacity expansion', 'Customer satisfaction focus', 'Quality maintenance']
    };
  }

  private static generateGradualRecoveryScenario(id: string, predictions: BusinessPrediction[], preAnalysis: PreAnalysisResult): BusinessScenario {
    return {
      id,
      name: 'Gradual Recovery',
      title: 'Step-by-Step Improvement',
      description: 'Gradual recovery through incremental improvements',
      confidence: preAnalysis.predictiveReadiness.confidence + 0.1,
      assumptions: { marketGrowth: 1.08, customerRetention: 0.80, operationalEfficiency: 1.03 },
      predictions: predictions.map(p => ({ type: p.type, prediction: p.prediction * 1.08, unit: p.unit })),
      potentialImpact: 0.12,
      riskLevel: 'medium',
      recommendations: ['Focus on core strengths', 'Incremental improvements', 'Patient execution']
    };
  }

  private static generateBreakthroughScenario(id: string, predictions: BusinessPrediction[], preAnalysis: PreAnalysisResult): BusinessScenario {
    return {
      id,
      name: 'Breakthrough Innovation',
      title: 'Innovation-Led Growth',
      description: 'Major breakthrough through innovation and new offerings',
      confidence: Math.max(0.3, preAnalysis.predictiveReadiness.confidence - 0.3),
      assumptions: { marketGrowth: 1.40, customerRetention: 0.85, operationalEfficiency: 1.20 },
      predictions: predictions.map(p => ({ type: p.type, prediction: p.prediction * 1.40, unit: p.unit })),
      potentialImpact: 0.40,
      riskLevel: 'high',
      recommendations: ['R&D investment', 'Market disruption strategy', 'Innovation culture']
    };
  }

  private static generateStrategicExpansionScenario(id: string, predictions: BusinessPrediction[], preAnalysis: PreAnalysisResult): BusinessScenario {
    return {
      id,
      name: 'Strategic Expansion',
      title: 'Market Expansion',
      description: 'Strategic expansion into new markets and segments',
      confidence: preAnalysis.predictiveReadiness.confidence - 0.1,
      assumptions: { marketGrowth: 1.25, customerRetention: 0.82, operationalEfficiency: 1.12 },
      predictions: predictions.map(p => ({ type: p.type, prediction: p.prediction * 1.25, unit: p.unit })),
      potentialImpact: 0.25,
      riskLevel: 'medium',
      recommendations: ['Market research', 'Strategic partnerships', 'Phased expansion']
    };
  }

  private static generateVolatilityCorrectionScenario(id: string, predictions: BusinessPrediction[], preAnalysis: PreAnalysisResult): BusinessScenario {
    return {
      id,
      name: 'Volatility Correction',
      title: 'Stability Enhancement',
      description: 'Reduce volatility while maintaining growth trajectory',
      confidence: preAnalysis.predictiveReadiness.confidence + 0.1,
      assumptions: { marketGrowth: 1.08, customerRetention: 0.90, operationalEfficiency: 1.05 },
      predictions: predictions.map(p => ({ type: p.type, prediction: p.prediction * 1.08, unit: p.unit })),
      potentialImpact: 0.12,
      riskLevel: 'low',
      recommendations: ['Risk management', 'Process standardization', 'Predictable operations']
    };
  }

  private static generateDataQualityScenario(id: string, predictions: BusinessPrediction[], preAnalysis: PreAnalysisResult): BusinessScenario {
    return {
      id,
      name: 'Data Quality Improvement',
      title: 'Enhanced Analytics Foundation',
      description: 'Improve data quality to enable better decision making',
      confidence: 0.8,
      assumptions: { marketGrowth: 1.05, customerRetention: 0.85, operationalEfficiency: 1.10 },
      predictions: predictions.map(p => ({ type: p.type, prediction: p.prediction * 1.05, unit: p.unit })),
      potentialImpact: 0.15,
      riskLevel: 'low',
      recommendations: ['Data governance', 'Quality monitoring', 'Analytics training']
    };
  }

  // Helper methods
  private static getTrendMultiplier(trend: string, scenario: string): number {
    const multipliers: Record<string, Record<string, number>> = {
      'strong_positive': { current: 1.15, optimistic: 1.30, pessimistic: 1.05 },
      'weak_positive': { current: 1.08, optimistic: 1.20, pessimistic: 1.00 },
      'stable': { current: 1.02, optimistic: 1.10, pessimistic: 0.95 },
      'weak_negative': { current: 0.95, optimistic: 1.05, pessimistic: 0.85 },
      'strong_negative': { current: 0.85, optimistic: 0.95, pessimistic: 0.75 }
    };
    
    return multipliers[trend]?.[scenario] || 1.0;
  }

  private static getRetentionAssumption(preAnalysis: PreAnalysisResult, scenario: string): number {
    const base = 0.80;
    const healthBonus = preAnalysis.dataHealth.score * 0.15;
    const stabilityBonus = (1 - preAnalysis.trendAnalysis.volatility) * 0.10;
    
    return Math.min(0.95, base + healthBonus + stabilityBonus);
  }

  private static assessRiskLevel(preAnalysis: PreAnalysisResult, scenario: string): 'high' | 'medium' | 'low' {
    const riskScore = 
      (1 - preAnalysis.dataHealth.score) * 0.4 +
      preAnalysis.trendAnalysis.volatility * 0.3 +
      (preAnalysis.anomalies.detected ? 0.2 : 0) +
      (1 - preAnalysis.predictiveReadiness.confidence) * 0.1;
    
    if (riskScore > 0.6) return 'high';
    if (riskScore > 0.3) return 'medium';
    return 'low';
  }

  private static getCurrentTrajectoryRecommendations(preAnalysis: PreAnalysisResult): string[] {
    const recommendations: string[] = [];
    
    if (preAnalysis.dataHealth.score < 0.7) {
      recommendations.push('Improve data collection and quality');
    }
    
    if (preAnalysis.trendAnalysis.volatility > 0.3) {
      recommendations.push('Implement volatility reduction measures');
    }
    
    if (preAnalysis.anomalies.detected) {
      recommendations.push('Investigate and address data anomalies');
    }
    
    recommendations.push('Monitor key performance indicators');
    recommendations.push('Maintain current successful practices');
    
    return recommendations;
  }
}
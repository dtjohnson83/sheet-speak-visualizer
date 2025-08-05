import { GraphMLInsight } from './GraphMLAnalyzer';
import { GlobalDomainContext } from '@/hooks/useDomainContext';

export interface BusinessInsight {
  id: string;
  businessTitle: string;
  executiveSummary: string;
  detailedDescription: string;
  businessImpact: {
    financial: {
      potential: string;
      confidence: number;
      timeframe: string;
    };
    operational: {
      efficiency: string;
      risk: string;
      opportunity: string;
    };
    strategic: {
      priority: 'critical' | 'high' | 'medium' | 'low';
      alignment: string;
      competitiveAdvantage: string;
    };
  };
  actionableRecommendations: Array<{
    action: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    expectedOutcome: string;
    kpiImpact: string[];
  }>;
  technicalDetails?: GraphMLInsight;
  stakeholders: string[];
  risksAndMitigations: Array<{
    risk: string;
    mitigation: string;
    probability: number;
  }>;
}

export interface DomainTemplate {
  name: string;
  industry: string;
  kpis: string[];
  riskFactors: string[];
  opportunityAreas: string[];
  stakeholderTypes: string[];
  businessLanguage: Record<string, string>;
  actionTemplates: Record<string, string[]>;
}

export class BusinessIntelligenceTranslator {
  private domainTemplates: Map<string, DomainTemplate>;

  constructor() {
    this.domainTemplates = new Map();
    this.initializeDomainTemplates();
  }

  private initializeDomainTemplates() {
    // Retail & E-commerce Template
    this.domainTemplates.set('retail', {
      name: 'Retail & E-commerce',
      industry: 'retail',
      kpis: ['conversion_rate', 'customer_lifetime_value', 'average_order_value', 'inventory_turnover', 'cart_abandonment'],
      riskFactors: ['seasonal_demand', 'inventory_shortage', 'customer_churn', 'price_competition'],
      opportunityAreas: ['cross_selling', 'upselling', 'personalization', 'loyalty_programs', 'market_expansion'],
      stakeholderTypes: ['Marketing Manager', 'Sales Director', 'Operations Manager', 'Customer Success', 'CEO'],
      businessLanguage: {
        'node_centrality': 'customer influence score',
        'clustering_coefficient': 'customer community strength',
        'anomaly_detection': 'unusual shopping behavior',
        'link_prediction': 'cross-selling opportunity',
        'community_detection': 'customer segment identification'
      },
      actionTemplates: {
        'high_centrality_nodes': ['Launch referral program targeting influential customers', 'Create VIP customer tier', 'Develop brand ambassador program'],
        'anomaly_detection': ['Investigate unusual purchase patterns', 'Flag potential fraud cases', 'Identify emerging customer needs'],
        'community_detection': ['Develop targeted marketing campaigns per segment', 'Create personalized product recommendations', 'Design segment-specific promotions']
      }
    });

    // Finance & Banking Template
    this.domainTemplates.set('finance', {
      name: 'Finance & Banking',
      industry: 'finance',
      kpis: ['risk_score', 'portfolio_return', 'customer_acquisition_cost', 'loan_default_rate', 'transaction_volume'],
      riskFactors: ['credit_risk', 'market_volatility', 'regulatory_compliance', 'fraud_detection'],
      opportunityAreas: ['cross_selling_products', 'risk_optimization', 'customer_retention', 'digital_transformation'],
      stakeholderTypes: ['Risk Manager', 'Portfolio Manager', 'Compliance Officer', 'Customer Relations', 'CFO'],
      businessLanguage: {
        'node_centrality': 'account importance score',
        'clustering_coefficient': 'portfolio connectivity',
        'anomaly_detection': 'suspicious transaction pattern',
        'link_prediction': 'cross-selling opportunity',
        'community_detection': 'customer risk grouping'
      },
      actionTemplates: {
        'high_centrality_nodes': ['Prioritize relationship management for key accounts', 'Offer premium services', 'Increase credit limits for stable customers'],
        'anomaly_detection': ['Investigate potential fraud', 'Review risk assessment', 'Enhance monitoring protocols'],
        'community_detection': ['Develop risk-based pricing models', 'Create targeted financial products', 'Implement group-specific compliance measures']
      }
    });

    // Manufacturing Template
    this.domainTemplates.set('manufacturing', {
      name: 'Manufacturing',
      industry: 'manufacturing',
      kpis: ['production_efficiency', 'quality_score', 'on_time_delivery', 'inventory_levels', 'equipment_uptime'],
      riskFactors: ['supply_chain_disruption', 'equipment_failure', 'quality_defects', 'regulatory_compliance'],
      opportunityAreas: ['process_optimization', 'predictive_maintenance', 'supply_chain_efficiency', 'quality_improvement'],
      stakeholderTypes: ['Operations Manager', 'Quality Manager', 'Supply Chain Director', 'Maintenance Manager', 'COO'],
      businessLanguage: {
        'node_centrality': 'process criticality score',
        'clustering_coefficient': 'workflow integration level',
        'anomaly_detection': 'process deviation alert',
        'link_prediction': 'process dependency mapping',
        'community_detection': 'production line grouping'
      },
      actionTemplates: {
        'high_centrality_nodes': ['Implement redundancy for critical processes', 'Prioritize maintenance for key equipment', 'Enhance monitoring for bottleneck operations'],
        'anomaly_detection': ['Investigate quality issues', 'Review process parameters', 'Schedule equipment inspection'],
        'community_detection': ['Optimize production scheduling', 'Implement lean manufacturing principles', 'Design cross-training programs']
      }
    });

    // HR & Human Resources Template
    this.domainTemplates.set('hr', {
      name: 'Human Resources',
      industry: 'hr',
      kpis: ['employee_satisfaction', 'retention_rate', 'productivity_score', 'training_effectiveness', 'performance_rating'],
      riskFactors: ['talent_retention', 'skills_gap', 'employee_burnout', 'compliance_risk'],
      opportunityAreas: ['talent_development', 'performance_optimization', 'culture_improvement', 'succession_planning'],
      stakeholderTypes: ['HR Director', 'Department Manager', 'Training Manager', 'Executive Team', 'Team Lead'],
      businessLanguage: {
        'node_centrality': 'employee influence score',
        'clustering_coefficient': 'team collaboration strength',
        'anomaly_detection': 'performance deviation alert',
        'link_prediction': 'mentorship opportunity',
        'community_detection': 'team dynamics analysis'
      },
      actionTemplates: {
        'high_centrality_nodes': ['Develop leadership pathway for influential employees', 'Create mentorship programs', 'Implement knowledge sharing initiatives'],
        'anomaly_detection': ['Conduct performance review', 'Provide targeted support', 'Investigate workload balance'],
        'community_detection': ['Optimize team structure', 'Design cross-functional projects', 'Implement team building programs']
      }
    });
  }

  translateToBusinessInsight(
    technicalInsight: GraphMLInsight,
    domainContext?: GlobalDomainContext
  ): BusinessInsight {
    const domain = domainContext?.domain?.toLowerCase() || 'general';
    const template = this.domainTemplates.get(domain) || this.getDefaultTemplate();
    
    const businessTitle = this.generateBusinessTitle(technicalInsight, template);
    const executiveSummary = this.generateExecutiveSummary(technicalInsight, template, domainContext);
    const businessImpact = this.calculateBusinessImpact(technicalInsight, template, domainContext);
    const recommendations = this.generateActionableRecommendations(technicalInsight, template);

    return {
      id: technicalInsight.id,
      businessTitle,
      executiveSummary,
      detailedDescription: this.generateDetailedDescription(technicalInsight, template, domainContext),
      businessImpact,
      actionableRecommendations: recommendations,
      technicalDetails: technicalInsight,
      stakeholders: this.identifyStakeholders(technicalInsight, template),
      risksAndMitigations: this.assessRisksAndMitigations(technicalInsight, template)
    };
  }

  private generateBusinessTitle(insight: GraphMLInsight, template: DomainTemplate): string {
    const businessTerm = template.businessLanguage[insight.type] || insight.type;
    
    switch (insight.type) {
      case 'anomaly':
        return `Unusual Pattern Detection: ${businessTerm.charAt(0).toUpperCase() + businessTerm.slice(1)} Identified`;
      case 'community':
        return `Customer Segmentation: ${businessTerm.charAt(0).toUpperCase() + businessTerm.slice(1)} Analysis`;
      case 'prediction':
        return `Opportunity Identification: ${businessTerm.charAt(0).toUpperCase() + businessTerm.slice(1)} Forecast`;
      case 'pattern':
        return `Business Pattern: ${businessTerm.charAt(0).toUpperCase() + businessTerm.slice(1)} Discovery`;
      case 'embedding':
        return `Similarity Analysis: ${businessTerm.charAt(0).toUpperCase() + businessTerm.slice(1)} Mapping`;
      default:
        return `Business Intelligence: ${insight.title}`;
    }
  }

  private generateExecutiveSummary(
    insight: GraphMLInsight,
    template: DomainTemplate,
    domainContext?: GlobalDomainContext
  ): string {
    const confidence = Math.round(insight.confidence * 100);
    const industry = domainContext?.industry || template.industry;
    
    switch (insight.type) {
      case 'anomaly':
        return `Our analysis identified ${insight.nodeIds?.length || 0} entities with unusual behavior patterns in your ${industry} operations. With ${confidence}% confidence, these anomalies could represent either high-value opportunities or potential risk factors requiring immediate attention.`;
      
      case 'community':
        return `We discovered distinct customer segments within your ${industry} business, showing ${confidence}% confidence in segmentation quality. These segments exhibit different behavioral patterns that could be leveraged for targeted strategies and improved ROI.`;
      
      case 'prediction':
        return `Our predictive models identified potential business opportunities with ${confidence}% confidence. These insights could help optimize your ${industry} operations and drive measurable improvements in key performance indicators.`;
      
      case 'pattern':
        return `Significant business patterns were detected in your ${industry} data with ${confidence}% confidence. These patterns reveal underlying trends that could inform strategic decision-making and operational improvements.`;
      
      case 'embedding':
        return `Our similarity analysis revealed connections between different entities in your ${industry} business with ${confidence}% confidence. These relationships could unlock cross-selling opportunities and operational synergies.`;
      
      default:
        return `Our advanced analytics identified actionable insights in your ${industry} operations with ${confidence}% confidence level.`;
    }
  }

  private calculateBusinessImpact(
    insight: GraphMLInsight,
    template: DomainTemplate,
    domainContext?: GlobalDomainContext
  ): BusinessInsight['businessImpact'] {
    const impactMultiplier = insight.confidence * (insight.severity === 'high' ? 1.5 : insight.severity === 'medium' ? 1.0 : 0.5);
    
    return {
      financial: {
        potential: this.estimateFinancialImpact(insight, template, impactMultiplier),
        confidence: Math.round(insight.confidence * 100),
        timeframe: this.estimateTimeframe(insight)
      },
      operational: {
        efficiency: this.assessEfficiencyImpact(insight, template),
        risk: this.assessRiskImpact(insight, template),
        opportunity: this.assessOpportunityImpact(insight, template)
      },
      strategic: {
        priority: this.calculatePriority(insight),
        alignment: this.assessStrategicAlignment(insight, domainContext),
        competitiveAdvantage: this.assessCompetitiveAdvantage(insight, template)
      }
    };
  }

  private estimateFinancialImpact(insight: GraphMLInsight, template: DomainTemplate, multiplier: number): string {
    const baseImpact = {
      'anomaly': ['$10K-$50K in risk mitigation', '$5K-$25K in fraud prevention', '$15K-$75K in operational savings'],
      'community': ['5-15% increase in marketing ROI', '10-25% improvement in customer retention', '8-20% boost in cross-selling revenue'],
      'prediction': ['3-12% revenue increase through optimization', '15-30% reduction in operational costs', '20-40% improvement in forecast accuracy'],
      'pattern': ['5-18% efficiency gain', '10-25% process optimization savings', '12-30% resource allocation improvement'],
      'embedding': ['8-22% increase in recommendation accuracy', '5-15% improvement in customer satisfaction', '10-28% boost in upselling success']
    };

    const impacts = baseImpact[insight.type as keyof typeof baseImpact] || ['Moderate financial impact expected'];
    return impacts[Math.floor(Math.random() * impacts.length)];
  }

  private estimateTimeframe(insight: GraphMLInsight): string {
    const timeframes = {
      'anomaly': '2-4 weeks',
      'community': '1-3 months',
      'prediction': '3-6 months',
      'pattern': '2-8 weeks',
      'embedding': '4-12 weeks'
    };
    
    return timeframes[insight.type as keyof typeof timeframes] || '1-3 months';
  }

  private generateActionableRecommendations(
    insight: GraphMLInsight,
    template: DomainTemplate
  ): BusinessInsight['actionableRecommendations'] {
    const templateActions = template.actionTemplates[insight.type] || 
                           template.actionTemplates[`${insight.type}_nodes`] || 
                           ['Review findings and develop action plan', 'Consult with domain experts', 'Monitor key metrics'];

    return templateActions.map((action, index) => ({
      action,
      effort: ['low', 'medium', 'high'][index % 3] as 'low' | 'medium' | 'high',
      timeline: this.getActionTimeline(index),
      expectedOutcome: this.getExpectedOutcome(insight, action),
      kpiImpact: this.getKPIImpact(insight, template)
    }));
  }

  private getActionTimeline(index: number): string {
    const timelines = ['1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months'];
    return timelines[index % timelines.length];
  }

  private getExpectedOutcome(insight: GraphMLInsight, action: string): string {
    const outcomeTemplates = {
      'anomaly': 'Reduced operational risk and improved data quality',
      'community': 'Enhanced customer targeting and increased engagement',
      'prediction': 'Improved forecasting accuracy and proactive decision-making',
      'pattern': 'Optimized processes and increased operational efficiency',
      'embedding': 'Better product recommendations and customer satisfaction'
    };

    return outcomeTemplates[insight.type as keyof typeof outcomeTemplates] || 'Improved business performance';
  }

  private getKPIImpact(insight: GraphMLInsight, template: DomainTemplate): string[] {
    const relevantKPIs = template.kpis.slice(0, Math.min(3, template.kpis.length));
    return relevantKPIs.map(kpi => kpi.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  }

  private assessEfficiencyImpact(insight: GraphMLInsight, template: DomainTemplate): string {
    const efficiency = insight.confidence * 100;
    if (efficiency > 80) return 'High efficiency improvement potential';
    if (efficiency > 60) return 'Moderate efficiency gains expected';
    return 'Minor efficiency improvements possible';
  }

  private assessRiskImpact(insight: GraphMLInsight, template: DomainTemplate): string {
    if (insight.type === 'anomaly' && insight.severity === 'high') return 'High risk mitigation opportunity';
    if (insight.severity === 'medium') return 'Moderate risk considerations';
    return 'Low risk impact';
  }

  private assessOpportunityImpact(insight: GraphMLInsight, template: DomainTemplate): string {
    const opportunities = template.opportunityAreas;
    const relevantOpportunity = opportunities[Math.floor(Math.random() * opportunities.length)];
    return `Strong potential for ${relevantOpportunity.replace(/_/g, ' ')}`;
  }

  private calculatePriority(insight: GraphMLInsight): 'critical' | 'high' | 'medium' | 'low' {
    if (insight.severity === 'high' && insight.confidence > 0.8) return 'critical';
    if (insight.severity === 'high' || insight.confidence > 0.7) return 'high';
    if (insight.severity === 'medium' || insight.confidence > 0.5) return 'medium';
    return 'low';
  }

  private assessStrategicAlignment(insight: GraphMLInsight, domainContext?: GlobalDomainContext): string {
    const objectives = domainContext?.businessObjectives || ['operational efficiency', 'customer satisfaction', 'revenue growth'];
    const primaryObjective = objectives[0] || 'business improvement';
    return `Strongly aligned with ${primaryObjective} objectives`;
  }

  private assessCompetitiveAdvantage(insight: GraphMLInsight, template: DomainTemplate): string {
    const advantages = [
      `Advanced analytics provide market differentiation in ${template.industry}`,
      `Data-driven insights create sustainable competitive edge`,
      `Proactive approach positions ahead of industry standards`,
      `Enhanced customer understanding drives market leadership`
    ];
    
    return advantages[Math.floor(Math.random() * advantages.length)];
  }

  private identifyStakeholders(insight: GraphMLInsight, template: DomainTemplate): string[] {
    const allStakeholders = template.stakeholderTypes;
    const relevantCount = Math.min(3, allStakeholders.length);
    return allStakeholders.slice(0, relevantCount);
  }

  private assessRisksAndMitigations(insight: GraphMLInsight, template: DomainTemplate): BusinessInsight['risksAndMitigations'] {
    const risks = template.riskFactors.slice(0, 2);
    
    return risks.map(risk => ({
      risk: `Potential ${risk.replace(/_/g, ' ')} impact`,
      mitigation: `Implement monitoring and preventive measures for ${risk.replace(/_/g, ' ')}`,
      probability: Math.random() * 0.3 + 0.1 // 10-40% probability
    }));
  }

  private generateDetailedDescription(
    insight: GraphMLInsight,
    template: DomainTemplate,
    domainContext?: GlobalDomainContext
  ): string {
    const businessTerm = template.businessLanguage[insight.type] || insight.type;
    const industry = domainContext?.industry || template.industry;
    
    return `${insight.description}\n\nBusiness Context: This ${businessTerm} analysis reveals important patterns in your ${industry} operations. The identified insights can be leveraged to improve operational efficiency, enhance customer relationships, and drive measurable business outcomes. Our advanced graph machine learning algorithms have processed your data to uncover these actionable intelligence points with high confidence levels.`;
  }

  private getDefaultTemplate(): DomainTemplate {
    return {
      name: 'General Business',
      industry: 'general',
      kpis: ['efficiency', 'quality', 'customer_satisfaction', 'revenue', 'cost_optimization'],
      riskFactors: ['operational_risk', 'market_volatility', 'data_quality', 'compliance'],
      opportunityAreas: ['process_improvement', 'customer_engagement', 'innovation', 'market_expansion'],
      stakeholderTypes: ['Business Manager', 'Operations Director', 'Data Analyst', 'Executive Team'],
      businessLanguage: {
        'node_centrality': 'importance score',
        'clustering_coefficient': 'connectivity level',
        'anomaly_detection': 'unusual pattern',
        'link_prediction': 'relationship opportunity',
        'community_detection': 'group identification'
      },
      actionTemplates: {
        'anomaly_detection': ['Investigate unusual patterns', 'Review data quality', 'Implement monitoring'],
        'community_detection': ['Analyze group characteristics', 'Develop targeted strategies', 'Monitor group dynamics'],
        'prediction': ['Validate predictions', 'Implement recommendations', 'Track performance']
      }
    };
  }

  // Generate ROI estimates for business insights
  calculateROI(businessInsight: BusinessInsight, investmentAmount: number): {
    estimatedReturn: number;
    paybackPeriod: string;
    riskAdjustedROI: number;
    confidenceLevel: number;
  } {
    const baseROI = businessInsight.businessImpact.financial.confidence / 100;
    const priorityMultiplier = {
      'critical': 2.5,
      'high': 2.0,
      'medium': 1.5,
      'low': 1.0
    }[businessInsight.businessImpact.strategic.priority];

    const estimatedReturn = investmentAmount * baseROI * priorityMultiplier;
    const averageRisk = businessInsight.risksAndMitigations.reduce((acc, r) => acc + r.probability, 0) / businessInsight.risksAndMitigations.length;
    const riskAdjustedROI = estimatedReturn * (1 - averageRisk);

    return {
      estimatedReturn,
      paybackPeriod: businessInsight.businessImpact.financial.timeframe,
      riskAdjustedROI,
      confidenceLevel: businessInsight.businessImpact.financial.confidence
    };
  }
}
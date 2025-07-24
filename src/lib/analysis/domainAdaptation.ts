import { DatasetInsights, ColumnStatistics } from './statisticalAnalysis';

export interface DomainContext {
  dataType: 'sales' | 'financial' | 'marketing' | 'operations' | 'hr' | 'scientific' | 'customer' | 'mixed';
  terminology: Record<string, string>;
  successMetrics: string[];
  warningSignals: string[];
  actionVerbs: Record<string, string[]>;
  urgencyIndicators: Record<string, string[]>;
}

export interface AdaptedResponse {
  executiveSummary: string;
  keyFindings: string[];
  recommendations: string[];
  urgencyLevel: 'immediate' | 'urgent' | 'moderate' | 'low';
  terminology: string;
  confidenceStatement: string;
}

const DOMAIN_CONTEXTS: Record<string, DomainContext> = {
  sales: {
    dataType: 'sales',
    terminology: {
      'improvement': 'revenue growth',
      'decline': 'sales drop',
      'stability': 'consistent performance',
      'volatility': 'fluctuating sales',
      'trend': 'sales trajectory',
      'pattern': 'buying behavior',
      'correlation': 'sales relationship'
    },
    successMetrics: ['revenue growth', 'conversion rates', 'customer acquisition', 'deal closure'],
    warningSignals: ['declining conversion', 'longer sales cycles', 'customer churn', 'pipeline shrinkage'],
    actionVerbs: {
      critical: ['intervene immediately', 'escalate', 'redirect resources', 'implement emergency measures'],
      urgent: ['accelerate', 'prioritize', 'focus efforts', 'optimize'],
      moderate: ['enhance', 'improve', 'develop', 'strengthen'],
      low: ['maintain', 'monitor', 'continue', 'sustain']
    },
    urgencyIndicators: {
      immediate: ['critical revenue decline', 'major customer loss', 'pipeline collapse'],
      urgent: ['declining trends', 'competitive pressure', 'missed targets'],
      moderate: ['optimization opportunities', 'growth potential', 'efficiency gains'],
      low: ['stable performance', 'minor adjustments', 'maintenance']
    }
  },
  
  financial: {
    dataType: 'financial',
    terminology: {
      'improvement': 'financial strengthening',
      'decline': 'financial deterioration',
      'stability': 'fiscal stability',
      'volatility': 'financial volatility',
      'trend': 'financial trajectory',
      'pattern': 'spending behavior',
      'correlation': 'financial relationship'
    },
    successMetrics: ['profitability', 'cash flow', 'cost efficiency', 'ROI'],
    warningSignals: ['cash flow issues', 'rising costs', 'declining margins', 'budget overruns'],
    actionVerbs: {
      critical: ['restructure immediately', 'cut costs', 'secure funding', 'implement controls'],
      urgent: ['optimize spending', 'improve margins', 'accelerate collections', 'reduce expenses'],
      moderate: ['enhance efficiency', 'diversify revenue', 'invest wisely', 'plan strategically'],
      low: ['maintain reserves', 'monitor performance', 'continue practices', 'steady growth']
    },
    urgencyIndicators: {
      immediate: ['cash flow crisis', 'major losses', 'bankruptcy risk'],
      urgent: ['declining profitability', 'cost overruns', 'margin pressure'],
      moderate: ['efficiency opportunities', 'investment needs', 'growth planning'],
      low: ['stable finances', 'adequate reserves', 'controlled spending']
    }
  },
  
  marketing: {
    dataType: 'marketing',
    terminology: {
      'improvement': 'campaign success',
      'decline': 'engagement drop',
      'stability': 'consistent reach',
      'volatility': 'variable performance',
      'trend': 'marketing momentum',
      'pattern': 'audience behavior',
      'correlation': 'channel synergy'
    },
    successMetrics: ['engagement rates', 'lead generation', 'brand awareness', 'conversion'],
    warningSignals: ['declining engagement', 'poor conversion', 'audience fatigue', 'channel saturation'],
    actionVerbs: {
      critical: ['pivot strategy', 'reallocate budget', 'launch emergency campaign', 'rebrand'],
      urgent: ['optimize campaigns', 'retarget audience', 'test new channels', 'adjust messaging'],
      moderate: ['enhance content', 'expand reach', 'test variations', 'improve targeting'],
      low: ['maintain momentum', 'continue strategy', 'monitor metrics', 'sustain efforts']
    },
    urgencyIndicators: {
      immediate: ['brand crisis', 'massive engagement drop', 'negative viral spread'],
      urgent: ['declining performance', 'competitive threats', 'audience loss'],
      moderate: ['optimization needs', 'growth opportunities', 'new channels'],
      low: ['stable performance', 'minor tweaks', 'maintenance mode']
    }
  },
  
  operations: {
    dataType: 'operations',
    terminology: {
      'improvement': 'operational efficiency',
      'decline': 'performance degradation',
      'stability': 'steady operations',
      'volatility': 'operational instability',
      'trend': 'performance trajectory',
      'pattern': 'operational rhythm',
      'correlation': 'process dependency'
    },
    successMetrics: ['efficiency ratios', 'throughput', 'quality metrics', 'uptime'],
    warningSignals: ['bottlenecks', 'quality issues', 'downtime', 'capacity constraints'],
    actionVerbs: {
      critical: ['halt operations', 'emergency repairs', 'bypass systems', 'crisis management'],
      urgent: ['eliminate bottlenecks', 'increase capacity', 'fix processes', 'optimize workflow'],
      moderate: ['streamline processes', 'improve efficiency', 'upgrade systems', 'train staff'],
      low: ['maintain standards', 'monitor performance', 'routine maintenance', 'continuous improvement']
    },
    urgencyIndicators: {
      immediate: ['system failure', 'safety issues', 'complete shutdown'],
      urgent: ['major bottlenecks', 'quality problems', 'capacity issues'],
      moderate: ['efficiency opportunities', 'process improvements', 'upgrades needed'],
      low: ['stable operations', 'minor optimizations', 'preventive maintenance']
    }
  },
  
  customer: {
    dataType: 'customer',
    terminology: {
      'improvement': 'customer satisfaction growth',
      'decline': 'satisfaction decline',
      'stability': 'consistent experience',
      'volatility': 'inconsistent service',
      'trend': 'customer journey',
      'pattern': 'usage behavior',
      'correlation': 'satisfaction drivers'
    },
    successMetrics: ['satisfaction scores', 'retention rates', 'loyalty metrics', 'referrals'],
    warningSignals: ['churn increase', 'satisfaction decline', 'complaint rise', 'negative feedback'],
    actionVerbs: {
      critical: ['recover customers', 'address grievances', 'prevent churn', 'crisis response'],
      urgent: ['improve experience', 'resolve issues', 'enhance service', 'rebuild trust'],
      moderate: ['enhance satisfaction', 'expand services', 'improve touchpoints', 'strengthen relationships'],
      low: ['maintain service', 'monitor feedback', 'continue excellence', 'steady improvement']
    },
    urgencyIndicators: {
      immediate: ['mass customer exodus', 'viral complaints', 'service crisis'],
      urgent: ['rising churn', 'satisfaction drop', 'competitive losses'],
      moderate: ['experience gaps', 'service improvements', 'loyalty building'],
      low: ['stable satisfaction', 'minor enhancements', 'relationship maintenance']
    }
  },
  
  scientific: {
    dataType: 'scientific',
    terminology: {
      'improvement': 'positive correlation',
      'decline': 'negative trend',
      'stability': 'statistical stability',
      'volatility': 'high variance',
      'trend': 'statistical trend',
      'pattern': 'data pattern',
      'correlation': 'statistical correlation'
    },
    successMetrics: ['statistical significance', 'effect size', 'confidence intervals', 'reproducibility'],
    warningSignals: ['low significance', 'high variance', 'outliers', 'bias indicators'],
    actionVerbs: {
      critical: ['investigate anomalies', 'validate findings', 'control variables', 'verify data'],
      urgent: ['analyze further', 'increase sample size', 'control confounders', 'replicate study'],
      moderate: ['explore patterns', 'expand analysis', 'investigate relationships', 'refine methods'],
      low: ['monitor variables', 'maintain protocols', 'continue observation', 'document findings']
    },
    urgencyIndicators: {
      immediate: ['data corruption', 'methodological flaws', 'critical errors'],
      urgent: ['statistical concerns', 'validity issues', 'reproducibility problems'],
      moderate: ['analysis opportunities', 'pattern exploration', 'method improvements'],
      low: ['stable measurements', 'routine analysis', 'ongoing monitoring']
    }
  }
};

export const detectDataDomain = (insights: DatasetInsights, fileName?: string): DomainContext => {
  const columnNames = insights.keyColumns.map(col => col.name.toLowerCase());
  const fileNameLower = fileName?.toLowerCase() || '';
  
  // Score each domain based on keyword matching
  const domainScores: Record<string, number> = {};
  
  Object.entries(DOMAIN_CONTEXTS).forEach(([domain, context]) => {
    let score = 0;
    
    // File name analysis
    if (fileNameLower.includes(domain)) score += 5;
    
    // Column name analysis
    columnNames.forEach(colName => {
      if (domain === 'sales' && (colName.includes('sales') || colName.includes('revenue') || colName.includes('customer'))) score += 3;
      if (domain === 'financial' && (colName.includes('cost') || colName.includes('profit') || colName.includes('budget'))) score += 3;
      if (domain === 'marketing' && (colName.includes('campaign') || colName.includes('engagement') || colName.includes('conversion'))) score += 3;
      if (domain === 'operations' && (colName.includes('efficiency') || colName.includes('process') || colName.includes('production'))) score += 3;
      if (domain === 'customer' && (colName.includes('satisfaction') || colName.includes('support') || colName.includes('feedback'))) score += 3;
      if (domain === 'scientific' && (colName.includes('test') || colName.includes('experiment') || colName.includes('measurement'))) score += 3;
    });
    
    domainScores[domain] = score;
  });
  
  // Find the highest scoring domain
  const bestDomain = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  return DOMAIN_CONTEXTS[bestDomain] || DOMAIN_CONTEXTS.customer; // Default to customer
};

export const generateAdaptedResponse = (
  insights: DatasetInsights,
  domainContext: DomainContext,
  persona: string = 'general'
): AdaptedResponse => {
  const { businessHealth, overallTrend, confidenceLevel } = insights;
  
  // Determine urgency level based on business health and trends
  const urgencyLevel = determineUrgencyLevel(businessHealth, overallTrend);
  
  // Generate domain-specific executive summary
  const executiveSummary = generateExecutiveSummary(insights, domainContext, urgencyLevel);
  
  // Generate key findings with domain terminology
  const keyFindings = generateKeyFindings(insights, domainContext);
  
  // Generate domain-specific recommendations
  const recommendations = generateDomainRecommendations(insights, domainContext, urgencyLevel);
  
  // Generate confidence statement
  const confidenceStatement = generateConfidenceStatement(confidenceLevel, insights.dataQuality);
  
  return {
    executiveSummary,
    keyFindings,
    recommendations,
    urgencyLevel,
    terminology: domainContext.dataType,
    confidenceStatement
  };
};

const determineUrgencyLevel = (businessHealth: any, overallTrend: any): 'immediate' | 'urgent' | 'moderate' | 'low' => {
  if (businessHealth.score < 0.3 || businessHealth.criticalIssues.length > 2) return 'immediate';
  if (businessHealth.score < 0.5 || overallTrend.direction === 'decreasing') return 'urgent';
  if (businessHealth.score < 0.7 || overallTrend.direction === 'volatile') return 'moderate';
  return 'low';
};

const generateExecutiveSummary = (insights: DatasetInsights, domain: DomainContext, urgency: string): string => {
  const { businessHealth, overallTrend, confidenceLevel } = insights;
  const terminology = domain.terminology;
  
  const healthDesc = businessHealth.score > 0.7 ? 'strong' : businessHealth.score > 0.4 ? 'moderate' : 'concerning';
  const trendDesc = terminology[overallTrend.direction] || overallTrend.direction;
  const confidenceDesc = confidenceLevel > 0.8 ? 'high confidence' : confidenceLevel > 0.5 ? 'moderate confidence' : 'limited confidence';
  
  let summary = `${domain.dataType.toUpperCase()} ANALYSIS: ${healthDesc} ${terminology.trend || 'performance'} showing ${trendDesc} (${confidenceDesc}).`;
  
  if (urgency === 'immediate') {
    summary += ` IMMEDIATE ACTION REQUIRED: Critical issues detected requiring urgent intervention.`;
  } else if (urgency === 'urgent') {
    summary += ` URGENT ATTENTION NEEDED: Declining patterns require prompt action.`;
  } else if (urgency === 'moderate') {
    summary += ` OPTIMIZATION OPPORTUNITY: Performance can be enhanced through targeted improvements.`;
  } else {
    summary += ` STABLE PERFORMANCE: Continue current strategies with minor adjustments.`;
  }
  
  return summary;
};

const generateKeyFindings = (insights: DatasetInsights, domain: DomainContext): string[] => {
  const findings: string[] = [];
  const { keyColumns, correlationMatrix, businessHealth } = insights;
  
  // Trend findings
  const criticalColumns = keyColumns.filter(col => col.businessMetrics.riskLevel === 'critical');
  const improvedColumns = keyColumns.filter(col => col.trend.direction === 'increasing');
  
  if (criticalColumns.length > 0) {
    findings.push(`${criticalColumns.length} critical ${domain.terminology.pattern || 'metrics'} showing ${domain.terminology.decline || 'negative trends'}`);
  }
  
  if (improvedColumns.length > 0) {
    findings.push(`${improvedColumns.length} ${domain.terminology.pattern || 'metrics'} demonstrate ${domain.terminology.improvement || 'positive growth'}`);
  }
  
  // Correlation findings
  const strongCorrelations = Array.from(correlationMatrix.entries()).flatMap(([col1, correlations]) =>
    Array.from(correlations.entries()).filter(([col2, corr]) => col1 !== col2 && Math.abs(corr) > 0.7)
  );
  
  if (strongCorrelations.length > 0) {
    findings.push(`Strong ${domain.terminology.correlation || 'relationships'} identified between key ${domain.terminology.pattern || 'variables'}`);
  }
  
  // Business health findings
  if (businessHealth.opportunities.length > 0) {
    findings.push(`${businessHealth.opportunities.length} strategic opportunities for ${domain.terminology.improvement || 'enhancement'}`);
  }
  
  return findings;
};

const generateDomainRecommendations = (insights: DatasetInsights, domain: DomainContext, urgency: string): string[] => {
  const recommendations: string[] = [];
  const { businessHealth, keyColumns } = insights;
  
  const actionVerbs = domain.actionVerbs[urgency] || domain.actionVerbs.moderate;
  const criticalColumns = keyColumns.filter(col => col.businessMetrics.riskLevel === 'critical');
  
  // Add domain-specific recommendations
  criticalColumns.forEach(col => {
    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    recommendations.push(`${verb} ${col.name} - showing ${col.trend.direction} trend with ${(col.trend.confidence * 100).toFixed(0)}% confidence`);
  });
  
  // Add business health recommendations
  businessHealth.recommendations.forEach(rec => {
    const domainSpecificRec = rec.replace(/general terms/g, domain.dataType);
    recommendations.push(domainSpecificRec);
  });
  
  // Add domain-specific strategic recommendations
  if (urgency === 'immediate') {
    recommendations.push(...domain.urgencyIndicators.immediate.map(indicator => 
      `Address ${indicator} through immediate ${domain.terminology.improvement || 'corrective action'}`
    ));
  }
  
  return recommendations.slice(0, 5); // Limit to top 5 recommendations
};

const generateConfidenceStatement = (confidence: number, dataQuality: any): string => {
  const confidencePercent = (confidence * 100).toFixed(0);
  const qualityPercent = (dataQuality.completeness * 100).toFixed(0);
  
  if (confidence > 0.8) {
    return `HIGH CONFIDENCE (${confidencePercent}%): Analysis based on ${qualityPercent}% complete data with strong statistical patterns.`;
  } else if (confidence > 0.5) {
    return `MODERATE CONFIDENCE (${confidencePercent}%): Analysis based on ${qualityPercent}% complete data with identifiable patterns.`;
  } else {
    return `LIMITED CONFIDENCE (${confidencePercent}%): Analysis based on ${qualityPercent}% complete data with weak patterns. Additional data recommended.`;
  }
};
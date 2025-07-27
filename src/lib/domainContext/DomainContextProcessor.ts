import { GlobalDomainContext } from '@/hooks/useDomainContext';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface DomainSpecificPrompt {
  systemPrompt: string;
  analysisFramework: string;
  industryTerminology: Map<string, string>;
  keyMetricsFocus: string[];
  riskFactors: string[];
  opportunityIndicators: string[];
}

export class DomainContextProcessor {
  static generateDomainSpecificPrompt(
    domainContext: GlobalDomainContext,
    data: DataRow[],
    columns: ColumnInfo[]
  ): DomainSpecificPrompt {
    const domain = domainContext.domain;
    const industry = domainContext.industry;

    // Base system prompt with domain-specific instructions
    let systemPrompt = `You are a specialized ${domain} data analyst with expertise in ${industry} industry.`;
    
    // Industry-specific analysis framework
    let analysisFramework = '';
    let industryTerminology = new Map<string, string>();
    let keyMetricsFocus: string[] = [];
    let riskFactors: string[] = [];
    let opportunityIndicators: string[] = [];

    switch (domain) {
      case 'finance':
        systemPrompt += ` Focus on financial performance, risk assessment, and compliance metrics. Prioritize revenue trends, cost analysis, and profitability indicators.`;
        analysisFramework = this.getFinanceAnalysisFramework();
        industryTerminology = this.getFinanceTerminology();
        keyMetricsFocus = ['revenue', 'profit', 'margin', 'cost', 'roi', 'cash flow'];
        riskFactors = ['declining_revenue', 'increasing_costs', 'negative_margins', 'cash_flow_issues'];
        opportunityIndicators = ['revenue_growth', 'cost_reduction', 'margin_improvement', 'new_markets'];
        break;

      case 'marketing':
        systemPrompt += ` Focus on marketing performance, customer acquisition, and campaign effectiveness. Prioritize conversion rates, customer lifetime value, and channel performance.`;
        analysisFramework = this.getMarketingAnalysisFramework();
        industryTerminology = this.getMarketingTerminology();
        keyMetricsFocus = ['conversion', 'acquisition', 'retention', 'cac', 'ltv', 'roas'];
        riskFactors = ['low_conversion', 'high_cac', 'poor_retention', 'declining_roas'];
        opportunityIndicators = ['high_engagement', 'growing_segments', 'improving_conversion', 'expanding_reach'];
        break;

      case 'operations':
        systemPrompt += ` Focus on operational efficiency, process optimization, and resource utilization. Prioritize productivity metrics, quality indicators, and cost efficiency.`;
        analysisFramework = this.getOperationsAnalysisFramework();
        industryTerminology = this.getOperationsTerminology();
        keyMetricsFocus = ['efficiency', 'productivity', 'utilization', 'quality', 'throughput', 'cycle_time'];
        riskFactors = ['low_efficiency', 'quality_issues', 'bottlenecks', 'resource_waste'];
        opportunityIndicators = ['process_improvement', 'automation_potential', 'efficiency_gains', 'quality_enhancement'];
        break;

      case 'sales':
        systemPrompt += ` Focus on sales performance, pipeline health, and revenue generation. Prioritize conversion rates, deal velocity, and team productivity.`;
        analysisFramework = this.getSalesAnalysisFramework();
        industryTerminology = this.getSalesTerminology();
        keyMetricsFocus = ['pipeline', 'conversion', 'velocity', 'quota', 'revenue', 'deals'];
        riskFactors = ['declining_pipeline', 'low_conversion', 'quota_miss', 'long_cycles'];
        opportunityIndicators = ['pipeline_growth', 'improved_conversion', 'faster_cycles', 'upsell_potential'];
        break;

      case 'hr':
        systemPrompt += ` Focus on human resources metrics, employee engagement, and workforce analytics. Prioritize retention, performance, and satisfaction indicators.`;
        analysisFramework = this.getHRAnalysisFramework();
        industryTerminology = this.getHRTerminology();
        keyMetricsFocus = ['retention', 'engagement', 'performance', 'satisfaction', 'turnover', 'productivity'];
        riskFactors = ['high_turnover', 'low_engagement', 'performance_issues', 'skill_gaps'];
        opportunityIndicators = ['high_retention', 'engaged_workforce', 'skill_development', 'performance_improvement'];
        break;

      default:
        systemPrompt += ` Provide comprehensive business analysis focusing on key performance indicators and actionable insights.`;
        analysisFramework = this.getGenericAnalysisFramework();
        keyMetricsFocus = domainContext.keyMetrics || [];
    }

    // Add specific business objectives from domain context
    if (domainContext.businessObjectives && domainContext.businessObjectives.length > 0) {
      systemPrompt += ` Key business objectives: ${domainContext.businessObjectives.join(', ')}.`;
    }

    // Add data context awareness
    systemPrompt += ` The dataset contains ${columns.length} columns and ${data.length} rows. `;
    
    // Identify domain-relevant columns
    const relevantColumns = this.identifyRelevantColumns(columns, keyMetricsFocus);
    if (relevantColumns.length > 0) {
      systemPrompt += `Pay special attention to these domain-relevant columns: ${relevantColumns.join(', ')}.`;
    }

    return {
      systemPrompt,
      analysisFramework,
      industryTerminology,
      keyMetricsFocus,
      riskFactors,
      opportunityIndicators
    };
  }

  private static identifyRelevantColumns(columns: ColumnInfo[], keyMetrics: string[]): string[] {
    return columns
      .filter(col => 
        keyMetrics.some(metric => 
          col.name.toLowerCase().includes(metric.toLowerCase())
        )
      )
      .map(col => col.name);
  }

  private static getFinanceAnalysisFramework(): string {
    return `
Financial Analysis Framework:
1. Revenue Analysis: Examine revenue trends, growth rates, and seasonality
2. Cost Structure: Analyze cost components, efficiency ratios, and cost drivers
3. Profitability: Calculate margins, ROI, and profitability trends
4. Risk Assessment: Identify financial risks and mitigation strategies
5. Forecasting: Provide financial projections and scenario analysis
    `;
  }

  private static getMarketingAnalysisFramework(): string {
    return `
Marketing Analysis Framework:
1. Campaign Performance: Analyze conversion rates, ROAS, and engagement metrics
2. Customer Journey: Examine acquisition, activation, and retention patterns
3. Channel Effectiveness: Compare performance across marketing channels
4. Segmentation: Identify high-value customer segments and opportunities
5. Attribution: Understand contribution of different touchpoints
    `;
  }

  private static getOperationsAnalysisFramework(): string {
    return `
Operations Analysis Framework:
1. Efficiency Metrics: Analyze productivity, utilization, and throughput
2. Quality Control: Examine quality indicators and defect rates
3. Process Optimization: Identify bottlenecks and improvement opportunities
4. Resource Management: Optimize allocation and utilization of resources
5. Performance Monitoring: Track KPIs and operational benchmarks
    `;
  }

  private static getSalesAnalysisFramework(): string {
    return `
Sales Analysis Framework:
1. Pipeline Health: Analyze deal flow, conversion rates, and pipeline velocity
2. Performance Metrics: Examine quota attainment, win rates, and cycle times
3. Territory Analysis: Compare performance across regions and segments
4. Forecasting: Predict future sales and identify trends
5. Opportunity Identification: Find upsell, cross-sell, and expansion opportunities
    `;
  }

  private static getHRAnalysisFramework(): string {
    return `
HR Analysis Framework:
1. Workforce Analytics: Analyze headcount, demographics, and diversity metrics
2. Performance Management: Examine performance ratings and productivity measures
3. Engagement & Satisfaction: Assess employee engagement and satisfaction levels
4. Retention Analysis: Understand turnover patterns and retention drivers
5. Talent Development: Identify skill gaps and development opportunities
    `;
  }

  private static getGenericAnalysisFramework(): string {
    return `
Business Analysis Framework:
1. Performance Overview: Analyze key business metrics and trends
2. Comparative Analysis: Compare performance across different dimensions
3. Pattern Recognition: Identify significant patterns and anomalies
4. Risk & Opportunity: Highlight potential risks and opportunities
5. Actionable Insights: Provide specific recommendations for improvement
    `;
  }

  private static getFinanceTerminology(): Map<string, string> {
    const terms = new Map<string, string>();
    terms.set('revenue', 'total income generated from business operations');
    terms.set('ebitda', 'earnings before interest, taxes, depreciation, and amortization');
    terms.set('margin', 'difference between revenue and costs as a percentage');
    terms.set('roi', 'return on investment - measure of investment efficiency');
    terms.set('cash_flow', 'net amount of cash moving in and out of business');
    return terms;
  }

  private static getMarketingTerminology(): Map<string, string> {
    const terms = new Map<string, string>();
    terms.set('cac', 'customer acquisition cost - cost to acquire a new customer');
    terms.set('ltv', 'customer lifetime value - total revenue from a customer relationship');
    terms.set('roas', 'return on ad spend - revenue generated per dollar spent on advertising');
    terms.set('conversion', 'percentage of prospects who complete desired action');
    terms.set('funnel', 'customer journey from awareness to purchase');
    return terms;
  }

  private static getOperationsTerminology(): Map<string, string> {
    const terms = new Map<string, string>();
    terms.set('throughput', 'amount of work completed in a given time period');
    terms.set('utilization', 'percentage of available capacity being used');
    terms.set('cycle_time', 'time required to complete one full process cycle');
    terms.set('oee', 'overall equipment effectiveness - measure of manufacturing productivity');
    terms.set('sla', 'service level agreement - commitment to specific performance standards');
    return terms;
  }

  private static getSalesTerminology(): Map<string, string> {
    const terms = new Map<string, string>();
    terms.set('pipeline', 'collection of prospects at various stages of sales process');
    terms.set('velocity', 'speed at which deals move through the sales pipeline');
    terms.set('quota', 'sales target assigned to individual or team');
    terms.set('win_rate', 'percentage of opportunities that result in closed deals');
    terms.set('acv', 'annual contract value - yearly value of customer contract');
    return terms;
  }

  private static getHRTerminology(): Map<string, string> {
    const terms = new Map<string, string>();
    terms.set('retention', 'percentage of employees who remain with company over time');
    terms.set('turnover', 'rate at which employees leave and are replaced');
    terms.set('engagement', 'level of employee involvement and commitment to work');
    terms.set('nps', 'employee net promoter score - measure of satisfaction');
    terms.set('fte', 'full-time equivalent - standardized measure of workforce size');
    return terms;
  }
}
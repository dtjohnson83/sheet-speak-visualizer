
export type AgentType = 
  | 'data_quality' 
  | 'anomaly_detection' 
  | 'trend_analysis' 
  | 'predictive_analytics'
  | 'monitoring'
  | 'insight_generation'
  | 'visualization'
  | 'correlation_discovery'
  | 'business_rules';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'paused';
  last_active?: string;
  lastRun?: Date;
  configuration: AgentConfiguration;
  capabilities: string[];
  priority: number;
  created_at: Date;
  updated_at: Date;
}

// Add AIAgent as an alias for backward compatibility
export type AIAgent = Agent;

// Enhanced domain context interface
export interface DomainContext {
  domain: string;
  industry?: string;
  businessType?: string;
  keyMetrics?: string[];
  customContext?: string;
  dataDescription?: string;
  dataType?: 'time_series' | 'transactional' | 'behavioral' | 'financial' | 'operational' | 'mixed';
  businessObjectives?: string[];
  analysisGoals?: string[];
}

// Data context interface combining dataset info with domain context
export interface DataContext {
  data: any[];
  columns: any[];
  fileName: string;
  datasetId?: string;
  rowCount: number;
  columnCount: number;
  domainContext?: DomainContext;
}

export interface AgentConfiguration {
  schedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    timezone?: string;
    business_hours_only?: boolean;
    weekends_included?: boolean;
    custom_interval?: number;
  };
  thresholds?: Record<string, number>;
  notifications?: {
    email?: string[];
    webhook?: string;
  };
  dataFilters?: Record<string, any>;
  analysis_frequency?: 'real_time' | 'hourly' | 'daily' | 'weekly';
  // Enhanced domain context for predictive analytics
  domainContext?: DomainContext;
  // Data context for agents
  dataContext?: DataContext;
  // Report automation specific config
  reportConfig?: {
    templateId?: string;
    outputFormat: 'excel' | 'pdf' | 'csv';
    recipients: string[];
    includeCharts: boolean;
    autoDistribute: boolean;
  };
}

export type AgentCapability = string;

export type TaskType = 
  | 'analyze_data'
  | 'generate_insights'
  | 'detect_anomalies'
  | 'analyze_trends'
  | 'find_correlations'
  | 'create_visualization'
  | 'report_generation'
  | 'assess_data_quality'
  | 'predictive_forecast'
  | 'scenario_analysis'
  | 'business_prediction'
  | 'domain_analysis'
  | 'domain_aware_prediction'
  | 'business_forecasting'
  | 'predictive_modeling'
  | 'evaluate_business_rules';

export interface AgentTask {
  id: string;
  agent_id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  created_at: Date;
  updated_at: Date;
  started_at?: Date;
  completed_at?: Date;
  scheduled_at: Date;
  error?: string;
  error_message?: string;
  result?: any;
  task_type: TaskType;
}

// Enhanced anomaly details for actionable insights
export interface AnomalyDetail {
  value: number;
  expected_range: { min: number; max: number };
  deviation: number;
  row_index: number;
  row_data?: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  business_impact?: 'revenue' | 'operations' | 'quality' | 'risk';
  recommended_action?: string;
  investigation_steps?: string[];
  root_cause_category?: 'data_quality' | 'process_change' | 'external_factor' | 'system_issue' | 'seasonal';
}

export interface BusinessImpactAssessment {
  category: 'high' | 'medium' | 'low';
  type: 'opportunity' | 'risk' | 'neutral';
  revenue_impact?: number;
  confidence: number;
  urgency: 'immediate' | 'within_day' | 'within_week' | 'monitor';
  stakeholders?: string[];
}

export interface AgentInsight {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  created_at: Date;
  is_read: boolean;
  insight_type: 'trend' | 'anomaly' | 'correlation' | 'recommendation' | 'summary';
  priority: number;
  confidence_score: number;
  // Enhanced data field for detailed insights
  data?: {
    column?: string;
    anomalies?: AnomalyDetail[];
    business_impact?: BusinessImpactAssessment;
    historical_context?: {
      similar_incidents?: number;
      last_occurrence?: Date;
      seasonal_pattern?: boolean;
    };
    correlations?: {
      related_metrics?: string[];
      correlation_strength?: number;
    };
    // Legacy fields for backward compatibility
    [key: string]: any;
  };
}

export interface AgentSummary {
  total_agents: number;
  active_agents: number;
  pending_tasks: number;
  completed_tasks_today: number;
  unread_insights: number;
  last_activity?: Date;
}

// Business Rule Configuration interfaces
export interface BusinessRule {
  id: string;
  agent_id: string;
  user_id: string;
  rule_name: string;
  description?: string;
  metric_column: string;
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=';
  threshold_value: number;
  comparison_type: 'percentage' | 'absolute' | 'trend';
  time_window: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  baseline_calculation: 'previous_period' | 'moving_average' | 'fixed_value';
  alert_frequency: 'immediate' | 'daily' | 'weekly';
  is_active: boolean;
  last_evaluation?: Date;
  last_triggered?: Date;
  trigger_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessRuleViolation {
  id: string;
  rule_id: string;
  user_id: string;
  metric_value: number;
  threshold_value: number;
  percentage_change?: number;
  baseline_value?: number;
  violation_severity: 'low' | 'medium' | 'high' | 'critical';
  notification_sent: boolean;
  created_at: Date;
}


export type AgentType = 
  | 'data_quality' 
  | 'anomaly_detection' 
  | 'trend_analysis' 
  | 'predictive_analytics'
  | 'report_automation'
  | 'monitoring'
  | 'insight_generation'
  | 'visualization'
  | 'correlation_discovery';

export type TaskType = 
  | 'data_quality_check' 
  | 'anomaly_detection' 
  | 'trend_analysis' 
  | 'report_generation' 
  | 'data_validation'
  | 'analyze_data'
  | 'generate_insights'
  | 'detect_anomalies'
  | 'analyze_trends'
  | 'find_correlations'
  | 'create_visualization';

export type AgentCapability = 
  | 'data_profiling'
  | 'anomaly_detection'
  | 'trend_analysis'
  | 'predictive_modeling'
  | 'report_generation'
  | 'data_validation'
  | 'correlation_analysis'
  | 'outlier_detection'
  | 'pattern_recognition'
  | 'automated_insights'
  | 'data_monitoring'
  | 'quality_scoring'
  | 'visualization_generation'
  | 'alert_management'
  | 'data_analysis'
  | 'statistical_analysis'
  | 'trend_forecasting'
  | 'data_quality_assessment'
  | 'completeness_validation'
  | 'consistency_checks'
  | 'accuracy_validation'
  | 'uniqueness_validation'
  | 'timeliness_checks';

export type AgentStatus = 'active' | 'inactive' | 'error' | 'paused';

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  description: string | null;
  status: AgentStatus;
  last_active: string | null;
  configuration: any;
  capabilities: any;
  priority: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  lastRun?: string;
}

export interface AgentConfiguration {
  schedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    timezone?: string;
  };
  thresholds?: Record<string, number>;
  notifications?: {
    email?: string[];
    webhook?: string;
  };
  dataFilters?: Record<string, any>;
  reportConfig?: {
    templateId?: string;
    outputFormat: 'excel' | 'pdf' | 'csv';
    recipients: string[];
    includeCharts: boolean;
    autoDistribute: boolean;
  };
}

export interface AgentTask {
  id: string;
  agent_id: string;
  task_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters: any;
  result: any | null;
  error_message: string | null;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  dataset_id: string | null;
}

export interface AgentInsight {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  insight_type: string;
  priority: number;
  confidence_score: number;
  data: any;
  dataset_id: string | null;
  task_id: string | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentSummary {
  totalAgents: number;
  activeAgents: number;
  recentTasks: number;
  pendingInsights: number;
}

// Legacy support
export interface Agent extends AIAgent {}
export interface AgentCapabilityItem {
  name: string;
  description: string;
}

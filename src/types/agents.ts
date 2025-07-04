export interface AIAgent {
  id: string;
  user_id: string;
  name: string;
  type: AgentType;
  description?: string;
  capabilities: AgentCapability[];
  configuration: AgentConfiguration;
  priority: number;
  status: AgentStatus;
  last_active?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentTask {
  id: string;
  agent_id: string;
  dataset_id?: string;
  task_type: TaskType;
  parameters: Record<string, any>;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  status: TaskStatus;
  result?: Record<string, any>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentInsight {
  id: string;
  agent_id: string;
  dataset_id?: string;
  task_id?: string;
  insight_type: InsightType;
  title: string;
  description: string;
  data: Record<string, any>;
  confidence_score: number;
  priority: number;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentActivityLog {
  id: string;
  agent_id: string;
  activity_type: ActivityType;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export type AgentType = 
  | 'monitoring'
  | 'insight_generation'
  | 'visualization'
  | 'anomaly_detection'
  | 'trend_analysis'
  | 'correlation_discovery'
  | 'data_quality';

export type AgentCapability = 
  | 'data_analysis'
  | 'pattern_recognition'
  | 'statistical_analysis'
  | 'visualization_generation'
  | 'anomaly_detection'
  | 'trend_forecasting'
  | 'correlation_analysis'
  | 'automated_insights'
  | 'data_quality_assessment'
  | 'completeness_validation'
  | 'consistency_checks'
  | 'accuracy_validation'
  | 'uniqueness_validation'
  | 'timeliness_checks';

export type AgentStatus = 'active' | 'paused' | 'error' | 'disabled';

export type TaskType = 
  | 'analyze_data'
  | 'generate_insights'
  | 'create_visualization'
  | 'detect_anomalies'
  | 'analyze_trends'
  | 'find_correlations'
  | 'assess_data_quality'
  | 'generate_quality_report';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type InsightType = 
  | 'trend'
  | 'anomaly'
  | 'correlation'
  | 'recommendation'
  | 'summary'
  | 'alert'
  | 'data_quality_issue'
  | 'data_quality_summary';

export type ActivityType = 
  | 'started'
  | 'completed'
  | 'error'
  | 'configuration_changed'
  | 'paused'
  | 'resumed';

export interface AgentConfiguration {
  analysis_frequency?: 'real_time' | 'hourly' | 'daily' | 'weekly';
  data_sample_size?: number;
  confidence_threshold?: number;
  alert_thresholds?: Record<string, number>;
  enabled_insights?: InsightType[];
  auto_generate_visualizations?: boolean;
  notification_preferences?: {
    email?: boolean;
    in_app?: boolean;
    slack?: boolean;
  };
}

export interface AgentSummary {
  total_agents: number;
  active_agents: number;
  pending_tasks: number;
  completed_tasks_today: number;
  unread_insights: number;
  last_activity?: string;
}
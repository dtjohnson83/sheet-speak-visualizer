
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
  | 'create_visualization';

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
}

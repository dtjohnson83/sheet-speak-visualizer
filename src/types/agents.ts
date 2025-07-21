export type AgentType = 
  | 'data_quality' 
  | 'anomaly_detection' 
  | 'trend_analysis' 
  | 'predictive_analytics'
  | 'report_automation';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastRun?: Date;
  configuration: AgentConfiguration;
  capabilities: AgentCapability[];
  priority: number;
  created_at: Date;
  updated_at: Date;
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
  // Report automation specific config
  reportConfig?: {
    templateId?: string;
    outputFormat: 'excel' | 'pdf' | 'csv';
    recipients: string[];
    includeCharts: boolean;
    autoDistribute: boolean;
  };
}

export interface AgentCapability {
  name: string;
  description: string;
}

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
  error?: string;
}

export interface AgentInsight {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  created_at: Date;
  is_read: boolean;
}

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'csv' | 'excel';
  recipients: string[];
  nextRun: Date;
  isActive: boolean;
}

export interface NewReportConfig {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'csv' | 'excel';
  recipients: string;
  isActive: boolean;
}

export interface QualityReportSchedulerProps {
  agentId?: string;
}

export const DEFAULT_NEW_REPORT: NewReportConfig = {
  name: '',
  frequency: 'weekly',
  format: 'pdf',
  recipients: '',
  isActive: true
};
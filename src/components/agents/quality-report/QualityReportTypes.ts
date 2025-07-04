export interface QualityIssue {
  category: string;
  severity: 'high' | 'medium' | 'low';
  column?: string;
  description: string;
  recommendation: string;
  priority: number;
  affectedRows?: number;
  percentage?: number;
}

export interface QualityReportProps {
  data: any[];
  columns: any[];
  fileName: string;
}
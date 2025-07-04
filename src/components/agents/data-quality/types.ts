export interface DataQualityIssue {
  type: 'completeness' | 'consistency' | 'accuracy' | 'uniqueness' | 'timeliness';
  severity: 'high' | 'medium' | 'low';
  column: string;
  description: string;
  affectedRows: number;
  percentage: number;
}

export interface DataQualityScore {
  overall: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
  timeliness: number;
}

export interface DataQualityReport {
  timestamp: string;
  datasetInfo: {
    rows: number;
    columns: number;
  };
  qualityScore: DataQualityScore;
  issues: DataQualityIssue[];
  summary: {
    totalIssues: number;
    highSeverityIssues: number;
    affectedColumns: number;
  };
}
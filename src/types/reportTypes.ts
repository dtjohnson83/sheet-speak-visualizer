
export interface DatasetProfile {
  dataType: 'customer' | 'financial' | 'sales' | 'marketing' | 'operations' | 'hr' | 'scientific' | 'mixed' | 'unknown';
  confidence: number;
  keyColumns: {
    identifiers: string[];
    dates: string[];
    metrics: string[];
    categories: string[];
    risks: string[];
  };
  businessContext: string;
  analysisApproach: string;
}

export interface UniversalHealthMetrics {
  dataQuality: number;
  trendDirection: 'improving' | 'stable' | 'declining' | 'volatile' | 'insufficient_data';
  riskFactors: string[];
  opportunities: string[];
  keyInsights: string[];
  criticalIssues: string[];
  dataCharacteristics: Record<string, any>;
}

export interface ReportMetadata {
  totalRows: number;
  totalColumns: number;
  columnTypes: Record<string, number>;
  dataCompleteness: Array<{ column: string; completeness: number }>;
  persona: string;
  generatedAt: string;
  dataTypeDetected?: string;
  qualityAlert?: string;
}

export interface UnifiedReportData {
  report: string;
  datasetProfile?: DatasetProfile;
  healthMetrics?: UniversalHealthMetrics;
  metadata: ReportMetadata;
}

// Type guard to validate report data
export const isValidReportData = (data: any): data is UnifiedReportData => {
  return (
    data &&
    typeof data.report === 'string' &&
    data.metadata &&
    typeof data.metadata.totalRows === 'number' &&
    typeof data.metadata.totalColumns === 'number' &&
    typeof data.metadata.persona === 'string' &&
    typeof data.metadata.generatedAt === 'string'
  );
};

// Helper function to safely extract data with fallbacks
export const safelyExtractReportData = (data: any): UnifiedReportData => {
  if (!isValidReportData(data)) {
    throw new Error('Invalid report data structure');
  }

  return {
    report: data.report,
    datasetProfile: data.datasetProfile || undefined,
    healthMetrics: data.healthMetrics || undefined,
    metadata: {
      totalRows: data.metadata.totalRows || 0,
      totalColumns: data.metadata.totalColumns || 0,
      columnTypes: data.metadata.columnTypes || {},
      dataCompleteness: data.metadata.dataCompleteness || [],
      persona: data.metadata.persona || 'general',
      generatedAt: data.metadata.generatedAt || new Date().toISOString(),
      dataTypeDetected: data.metadata.dataTypeDetected,
      qualityAlert: data.metadata.qualityAlert
    }
  };
};

import { DataQualityReport } from '../types';

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeCharts: boolean;
  includeTrends: boolean;
  includeHeatmap: boolean;
  includeRecommendations: boolean;
  includeRawData: boolean;
  timeRange: 'current' | 'last_7_days' | 'last_30_days';
}

export interface QualityReportExporterProps {
  report: DataQualityReport | null;
  isAnalyzing: boolean;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'pdf',
  includeCharts: true,
  includeTrends: true,
  includeHeatmap: true,
  includeRecommendations: true,
  includeRawData: false,
  timeRange: 'current'
};
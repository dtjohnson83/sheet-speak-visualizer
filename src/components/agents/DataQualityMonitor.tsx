import { useEffect } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useDataQualityAnalysis } from '@/hooks/useDataQualityAnalysis';
import { QualityScoreCard } from './data-quality/QualityScoreCard';
import { QualityIssuesList } from './data-quality/QualityIssuesList';
import { QualityEmptyState } from './data-quality/QualityEmptyState';
import { DataQualityReport } from './data-quality/types';

interface DataQualityMonitorProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onReportGenerated?: (report: DataQualityReport) => void;
}

export const DataQualityMonitor = ({ data, columns, onReportGenerated }: DataQualityMonitorProps) => {
  const {
    isAnalyzing,
    qualityScore,
    issues,
    lastAnalysis,
    analyzeDataQuality
  } = useDataQualityAnalysis(data, columns);

  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      analyzeDataQuality(onReportGenerated);
    }
  }, [data, columns, analyzeDataQuality, onReportGenerated]);

  const handleRefresh = () => {
    analyzeDataQuality(onReportGenerated);
  };

  return (
    <div className="space-y-6">
      <QualityEmptyState hasData={data.length > 0} hasIssues={issues.length > 0} />
      
      {data.length > 0 && (
        <>
          <QualityScoreCard 
            qualityScore={qualityScore}
            isAnalyzing={isAnalyzing}
            lastAnalysis={lastAnalysis}
            onRefresh={handleRefresh}
          />
          
          <QualityIssuesList issues={issues} />
          
          {qualityScore && issues.length === 0 && (
            <QualityEmptyState hasData={true} hasIssues={false} />
          )}
        </>
      )}
    </div>
  );
};
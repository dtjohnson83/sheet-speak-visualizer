import { useEffect, useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useDataQualityAnalysis } from '@/hooks/useDataQualityAnalysis';
import { QualityScoreCard } from './data-quality/QualityScoreCard';
import { QualityIssuesList } from './data-quality/QualityIssuesList';
import { QualityEmptyState } from './data-quality/QualityEmptyState';
import { QualityTrendsChart } from './data-quality/QualityTrendsChart';
import { QualityHeatmap } from './data-quality/QualityHeatmap';
import { DataQualityReport, DataQualityScore } from './data-quality/types';
import { QualityReportExporter } from './data-quality/QualityReportExporter';
import { QualityReportScheduler } from './data-quality/QualityReportScheduler';
import { RealTimeMonitor } from './data-quality/RealTimeMonitor';
import { MLQualityAnalyzer } from './data-quality/MLQualityAnalyzer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataQualityMonitorProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onReportGenerated?: (report: DataQualityReport) => void;
}

export const DataQualityMonitor = ({ data, columns, onReportGenerated }: DataQualityMonitorProps) => {
  const [selectedTrendMetric, setSelectedTrendMetric] = useState<keyof DataQualityScore>('overall');
  const [currentReport, setCurrentReport] = useState<DataQualityReport | null>(null);
  
  const {
    isAnalyzing,
    analysisProgress,
    qualityScore,
    issues,
    lastAnalysis,
    qualityTrends,
    autoFixSuggestions,
    analyzeDataQuality
  } = useDataQualityAnalysis(data, columns);

  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      analyzeDataQuality((report) => {
        setCurrentReport(report);
        onReportGenerated?.(report);
      });
    }
  }, [data, columns]); // Removed analyzeDataQuality and onReportGenerated to prevent infinite loop

  const handleRefresh = () => {
    analyzeDataQuality((report) => {
      setCurrentReport(report);
      onReportGenerated?.(report);
    });
  };

  return (
    <div className="space-y-6">
      <QualityEmptyState hasData={data.length > 0} hasIssues={issues.length > 0} />
      
      {data.length > 0 && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="ml">ML Analysis</TabsTrigger>
            <TabsTrigger value="heatmap">Issues Heatmap</TabsTrigger>
            <TabsTrigger value="trends">Quality Trends</TabsTrigger>
            <TabsTrigger value="details">Issue Details</TabsTrigger>
            <TabsTrigger value="reports">Reports & Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <QualityScoreCard 
              qualityScore={qualityScore}
              isAnalyzing={isAnalyzing}
              analysisProgress={analysisProgress}
              lastAnalysis={lastAnalysis}
              autoFixSuggestions={autoFixSuggestions}
              onRefresh={handleRefresh}
            />
            
            {qualityScore && issues.length === 0 && (
              <QualityEmptyState hasData={true} hasIssues={false} />
            )}
          </TabsContent>
          
          <TabsContent value="realtime" className="space-y-6">
            <RealTimeMonitor 
              onQualityUpdate={(score, issues) => {
                // Update the main quality score when real-time data comes in
                // This allows the real-time monitor to feed back to the main system
              }}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>
          
          <TabsContent value="ml" className="space-y-6">
            <MLQualityAnalyzer 
              data={data}
              columns={columns}
              issues={issues}
              onInsightGenerated={(insights) => {
                // Handle ML insights if needed
                console.log('Generated ML insights:', insights);
              }}
            />
          </TabsContent>
          
          <TabsContent value="heatmap" className="space-y-6">
            <QualityHeatmap columns={columns} issues={issues} />
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <QualityTrendsChart
              trends={qualityTrends}
              selectedMetric={selectedTrendMetric}
              onMetricSelect={setSelectedTrendMetric}
            />
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <QualityIssuesList issues={issues} />
            
            {qualityScore && issues.length === 0 && (
              <QualityEmptyState hasData={true} hasIssues={false} />
            )}
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6">
              <QualityReportExporter 
                report={currentReport}
                isAnalyzing={isAnalyzing}
              />
              <QualityReportScheduler />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
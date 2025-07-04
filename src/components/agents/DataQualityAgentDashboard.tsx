import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Activity, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  Database,
  BarChart3
} from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useDataQualityAgent } from '@/hooks/useDataQualityAgent';
import { AgentStatusHeader } from './dashboard/AgentStatusHeader';
import { AdvancedChecksTab } from './dashboard/AdvancedChecksTab';
import { CoreMonitorTab } from './dashboard/CoreMonitorTab';
import { ReportTab } from './dashboard/ReportTab';
import { QualityTrendsTab } from './dashboard/QualityTrendsTab';

interface DataQualityAgentDashboardProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
}

export const DataQualityAgentDashboard = ({ 
  data, 
  columns, 
  fileName = "dataset" 
}: DataQualityAgentDashboardProps) => {
  const [activeTab, setActiveTab] = useState('advanced');
  const [reportData, setReportData] = useState<any>(null);
  
  const {
    agent,
    isCreatingAgent,
    qualityTrends,
    createDataQualityAgent,
    scheduleQualityCheck,
    handleReportGenerated
  } = useDataQualityAgent(fileName);

  const onReportGenerated = async (report: any) => {
    const processedReport = await handleReportGenerated(report);
    setReportData(processedReport);
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Quality Agent
          </CardTitle>
          <CardDescription>
            Upload data to start monitoring data quality with AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No data available for quality analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Status Header */}
      <AgentStatusHeader
        fileName={fileName}
        agent={agent}
        isCreatingAgent={isCreatingAgent}
        onCreateAgent={createDataQualityAgent}
        onScheduleCheck={scheduleQualityCheck}
      />

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="advanced">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Advanced Checks
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Core Monitor
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedChecksTab data={data} columns={columns} />
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <CoreMonitorTab 
            data={data} 
            columns={columns} 
            onReportGenerated={onReportGenerated}
          />
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          <ReportTab 
            reportData={reportData}
            fileName={fileName}
            onGoToMonitor={() => setActiveTab('monitor')}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <QualityTrendsTab qualityTrends={qualityTrends} />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {agent && reportData && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>
              Latest analysis found {reportData.summary.totalIssues} issues. 
              {reportData.summary.highSeverityIssues > 0 && (
                <span className="text-red-600 font-medium">
                  {' '}{reportData.summary.highSeverityIssues} require immediate attention.
                </span>
              )}
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setActiveTab('report')}
            >
              View Details
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
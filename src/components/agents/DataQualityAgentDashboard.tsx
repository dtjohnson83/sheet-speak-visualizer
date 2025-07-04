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
  BarChart3,
  Bell
} from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useDataQualityAgent } from '@/hooks/useDataQualityAgent';
import { AgentStatusHeader } from './dashboard/AgentStatusHeader';
import { AdvancedChecksTab } from './dashboard/AdvancedChecksTab';
import { CoreMonitorTab } from './dashboard/CoreMonitorTab';
import { QualityTrendsTab } from './dashboard/QualityTrendsTab';
import { QualityReport } from './quality-report/QualityReport';
import { AlertManagementPanel } from './AlertManagementPanel';

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
  
  const {
    agent,
    isCreatingAgent,
    qualityTrends,
    createDataQualityAgent,
    scheduleQualityCheck,
    handleReportGenerated
  } = useDataQualityAgent(fileName);

  const onReportGenerated = async (report: any) => {
    await handleReportGenerated(report);
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
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 bg-muted dark:bg-muted">
          <TabsTrigger value="advanced" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Advanced Checks</span>
            <span className="sm:hidden">Advanced</span>
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Core Monitor</span>
            <span className="sm:hidden">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Quality Report</span>
            <span className="sm:hidden">Report</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Trends</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Alerts</span>
            <span className="sm:hidden">🔔</span>
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
          <QualityReport 
            data={data} 
            columns={columns} 
            fileName={fileName}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <QualityTrendsTab qualityTrends={qualityTrends} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {agent ? (
            <AlertManagementPanel agentId={agent.id} />
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">Create Agent First</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a data quality agent to configure automated alerts
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions Alert */}
      {agent && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span>
              Data quality monitoring is active. Check the Quality Report tab for detailed analysis and actionable recommendations.
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
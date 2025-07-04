import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Activity, 
  FileText, 
  Settings,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Database,
  Bell,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { DataQualityMonitor } from './DataQualityMonitor';
import { DataQualityReport } from './DataQualityReport';
import { ValidityCheck } from './quality-checks/ValidityCheck';
import { ConformityCheck } from './quality-checks/ConformityCheck';
import { AnomalyDetectionCheck } from './quality-checks/AnomalyDetectionCheck';
import { FreshnessCheck } from './quality-checks/FreshnessCheck';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useAIAgents } from '@/hooks/useAIAgents';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DataQualityAgentDashboardProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
}

interface QualityTrend {
  date: string;
  score: number;
  issues: number;
}

export const DataQualityAgentDashboard = ({ 
  data, 
  columns, 
  fileName = "dataset" 
}: DataQualityAgentDashboardProps) => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [reportData, setReportData] = useState<any>(null);
  const [qualityTrends, setQualityTrends] = useState<QualityTrend[]>([]);
  const [agent, setAgent] = useState<any>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  
  const { agents, createAgent } = useAIAgents();
  const { toast } = useToast();

  // Find existing data quality agent
  useEffect(() => {
    const dataQualityAgent = agents.find(a => a.type === 'data_quality');
    setAgent(dataQualityAgent);
  }, [agents]);

  const createDataQualityAgent = async () => {
    setIsCreatingAgent(true);
    try {
      const agentConfig = {
        name: `Data Quality Monitor - ${fileName}`,
        type: 'data_quality' as const,
        description: 'Monitors data quality and generates automated reports',
        capabilities: [
          'data_quality_assessment',
          'completeness_validation',
          'consistency_checks',
          'accuracy_validation',
          'uniqueness_validation',
          'automated_insights'
        ],
        configuration: {
          analysis_frequency: 'daily',
          confidence_threshold: 0.8,
          auto_generate_visualizations: true,
          notification_preferences: {
            in_app: true,
            email: false
          },
          quality_thresholds: {
            completeness: 95,
            consistency: 90,
            accuracy: 95,
            uniqueness: 98,
            timeliness: 85
          }
        }
      };

      await createAgent(agentConfig);
      
      toast({
        title: "Success",
        description: "Data Quality Agent created successfully",
      });
    } catch (error) {
      console.error('Error creating data quality agent:', error);
      toast({
        title: "Error",
        description: "Failed to create Data Quality Agent",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const handleReportGenerated = async (report: any) => {
    setReportData(report);
    
    // Save report data to insights table if agent exists
    if (agent) {
      try {
        await supabase.from('agent_insights').insert({
          agent_id: agent.id,
          insight_type: 'data_quality_summary',
          title: `Data Quality Report - ${fileName}`,
          description: `Quality score: ${report.qualityScore.overall.toFixed(1)}%, ${report.summary.totalIssues} issues found`,
          data: report,
          confidence_score: report.qualityScore.overall / 100,
          priority: report.summary.highSeverityIssues > 0 ? 8 : 5
        });

        // Add to quality trends
        const newTrend: QualityTrend = {
          date: new Date().toISOString().split('T')[0],
          score: report.qualityScore.overall,
          issues: report.summary.totalIssues
        };
        
        setQualityTrends(prev => {
          const updated = [...prev, newTrend];
          return updated.slice(-7); // Keep only last 7 days
        });

      } catch (error) {
        console.error('Error saving quality insight:', error);
      }
    }
  };

  const scheduleQualityCheck = async () => {
    if (!agent) return;

    try {
      await supabase.from('agent_tasks').insert({
        agent_id: agent.id,
        task_type: 'assess_data_quality',
        parameters: {
          dataset_name: fileName,
          columns: columns.map(c => ({ name: c.name, type: c.type })),
          row_count: data.length
        },
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Schedule for tomorrow
      });

      toast({
        title: "Success",
        description: "Daily quality check scheduled",
      });
    } catch (error) {
      console.error('Error scheduling quality check:', error);
      toast({
        title: "Error",
        description: "Failed to schedule quality check",
        variant: "destructive",
      });
    }
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Quality Agent
              </CardTitle>
              <CardDescription>
                AI-powered data quality monitoring and reporting for {fileName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {agent ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={scheduleQualityCheck}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Check
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={createDataQualityAgent}
                  disabled={isCreatingAgent}
                >
                  {isCreatingAgent ? 'Creating...' : 'Create Agent'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {agent && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-xs text-gray-600 capitalize">{agent.status}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">Frequency</div>
                  <div className="text-xs text-gray-600 capitalize">
                    {agent.configuration?.analysis_frequency || 'Daily'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-sm font-medium">Last Check</div>
                  <div className="text-xs text-gray-600">
                    {agent.last_active ? new Date(agent.last_active).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-sm font-medium">Alerts</div>
                  <div className="text-xs text-gray-600">
                    {agent.configuration?.notification_preferences?.in_app ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

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
          {/* Advanced Quality Checks Dashboard */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    Advanced Quality Checks
                  </CardTitle>
                  <CardDescription>
                    7 comprehensive quality dimensions beyond traditional metrics
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Advanced Quality Checks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ValidityCheck data={data} columns={columns} />
            <ConformityCheck data={data} columns={columns} />
            <AnomalyDetectionCheck data={data} columns={columns} />
            <FreshnessCheck data={data} columns={columns} />
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Quality Metrics</CardTitle>
              <CardDescription>
                Traditional quality dimensions (completeness, consistency, accuracy, uniqueness, timeliness)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataQualityMonitor 
                data={data} 
                columns={columns} 
                onReportGenerated={handleReportGenerated}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          {reportData ? (
            <DataQualityReport 
              reportData={reportData} 
              fileName={fileName}
            />
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Report Generated</h3>
                  <p className="text-gray-600 mb-4">
                    Run the data quality monitor first to generate a report.
                  </p>
                  <Button onClick={() => setActiveTab('monitor')}>
                    Go to Monitor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quality Trends
              </CardTitle>
              <CardDescription>
                Historical data quality metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {qualityTrends.length > 0 ? (
                <div className="space-y-4">
                  {qualityTrends.map((trend, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{new Date(trend.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600">{trend.issues} issues found</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{trend.score.toFixed(1)}%</div>
                        <Badge variant={trend.score >= 90 ? 'default' : trend.score >= 70 ? 'secondary' : 'destructive'}>
                          {trend.score >= 90 ? 'Excellent' : trend.score >= 70 ? 'Good' : 'Needs Work'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No historical data available. Run quality checks to build trends.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
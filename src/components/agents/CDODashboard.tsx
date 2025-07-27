import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AIAgent, AgentTask, AgentInsight } from '@/types/agents';
import { AgentOutputAggregator } from './AgentOutputAggregator';
import { AISummaryReport } from '../AISummaryReport';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/numberUtils';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Brain,
  BarChart3,
  Users,
  Activity
} from 'lucide-react';

interface CDODashboardProps {
  agents: AIAgent[];
  tasks: AgentTask[];
  insights: AgentInsight[];
  data?: DataRow[];
  columns?: ColumnInfo[];
  fileName?: string;
}

export const CDODashboard: React.FC<CDODashboardProps> = ({
  agents,
  tasks,
  insights,
  data = [],
  columns = [],
  fileName
}) => {
  const [showExecutiveReport, setShowExecutiveReport] = React.useState(false);
  const [reportLoading, setReportLoading] = React.useState(false);
  const [executiveReport, setExecutiveReport] = React.useState<any>(null);

  // Calculate key metrics
  const activeAgents = agents.filter(agent => agent.status === 'active');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const criticalInsights = insights.filter(insight => insight.severity === 'critical');
  const unreadInsights = insights.filter(insight => !insight.is_read);

  // Calculate trends (last 7 days vs previous 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentInsights = insights.filter(insight => 
    new Date(insight.created_at) > weekAgo
  );
  const previousInsights = insights.filter(insight => {
    const date = new Date(insight.created_at);
    return date > twoWeeksAgo && date <= weekAgo;
  });

  const insightTrend = recentInsights.length - previousInsights.length;
  const taskSuccessRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const getDashboardStatus = () => {
    if (criticalInsights.length > 3) return { status: 'critical', color: 'text-destructive' };
    if (activeAgents.length < agents.length * 0.7) return { status: 'warning', color: 'text-orange-500' };
    if (taskSuccessRate > 85) return { status: 'healthy', color: 'text-green-500' };
    return { status: 'stable', color: 'text-blue-500' };
  };

  const dashboardStatus = getDashboardStatus();

  // Generate executive insights report
  const generateExecutiveReport = async () => {
    setReportLoading(true);
    try {
      // Get the current session and validate authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }

      console.log('Calling executive-insights-report with valid session');
      
      const { data: reportData, error } = await supabase.functions.invoke('executive-insights-report', {
        body: {
          domainContext: fileName ? `Analysis of ${fileName} dataset` : 'General business intelligence',
          timeframe: 'last_week',
          focusAreas: ['data_quality', 'business_insights', 'risk_assessment']
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setExecutiveReport(reportData);
      setShowExecutiveReport(true);
      
      if (reportData?.metadata?.is_fallback) {
        toast.warning("Report generated with basic analysis. Configure AI API keys for enhanced insights.");
      } else {
        toast.success("Executive report generated successfully!");
      }
    } catch (error) {
      console.error('Failed to generate executive report:', error);
      toast.error(`Failed to generate report: ${error.message || 'Please try again.'}`);
    } finally {
      setReportLoading(false);
    }
  };

  if (showExecutiveReport && executiveReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Executive Intelligence Report
          </h2>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowExecutiveReport(false);
              setExecutiveReport(null);
            }}
          >
            Back to Dashboard
          </Button>
        </div>
        
        {/* Report Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Generated:</span>
                <div className="font-medium">
                  {new Date(executiveReport.metadata.generated_at).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Insights Analyzed:</span>
                <div className="font-medium">{formatNumber(executiveReport.metadata.insights_analyzed)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Active Agents:</span>
                <div className="font-medium">{formatNumber(executiveReport.metadata.agents_active)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Critical Issues:</span>
                <div className="font-medium text-destructive">
                  {formatNumber(executiveReport.metadata.critical_issues)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Report Content */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Intelligence Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                {executiveReport.report}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Chief Data Officer
          </h2>
          <p className="text-muted-foreground mt-1">
            Strategic oversight and executive insights across all data operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={dashboardStatus.status === 'healthy' ? 'default' : 'secondary'}
            className={dashboardStatus.color}
          >
            {dashboardStatus.status.toUpperCase()}
          </Badge>
          {insights.length > 0 && (
            <Button 
              onClick={generateExecutiveReport}
              disabled={reportLoading}
            >
              {reportLoading ? 'Generating...' : 'Generate Executive Report'}
            </Button>
          )}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(activeAgents.length)}</div>
            <p className="text-xs text-muted-foreground">
              of {formatNumber(agents.length)} total agents
            </p>
            <Progress 
              value={(activeAgents.length / Math.max(agents.length, 1)) * 100} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskSuccessRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(completedTasks.length)} of {formatNumber(tasks.length)} tasks
            </p>
            <Progress value={taskSuccessRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Insights</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalInsights.length > 0 ? 'text-destructive' : 'text-green-500'}`}>
              {formatNumber(criticalInsights.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insight Trend</CardTitle>
            {insightTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : insightTrend < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              insightTrend > 0 ? 'text-green-500' : 
              insightTrend < 0 ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {insightTrend > 0 ? '+' : ''}{insightTrend}
            </div>
            <p className="text-xs text-muted-foreground">
              vs. previous week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Aggregator */}
      <AgentOutputAggregator 
        agents={agents}
        tasks={tasks}
        insights={insights}
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4" disabled={pendingTasks.length === 0}>
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold">Review Pending Tasks</div>
                <div className="text-sm text-muted-foreground">{formatNumber(pendingTasks.length)} waiting</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4" disabled={unreadInsights.length === 0}>
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold">Review New Insights</div>
                <div className="text-sm text-muted-foreground">{formatNumber(unreadInsights.length)} unread</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4"
              onClick={generateExecutiveReport}
              disabled={reportLoading || insights.length === 0}
            >
              <div className="text-center">
                <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold">
                  {reportLoading ? 'Generating...' : 'Generate Intelligence Report'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Agent insights analysis
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
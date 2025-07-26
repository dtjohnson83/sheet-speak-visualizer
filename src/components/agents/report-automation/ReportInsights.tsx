import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  FileSpreadsheet,
  Target,
  Zap,
  BarChart3,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportMetric {
  id: string;
  template_id: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  avg_generation_time_ms: number;
  last_run_at?: string;
  template_name?: string;
}

interface ReportExecution {
  id: string;
  template_id: string;
  status: string;
  file_path?: string;
  generation_time_ms?: number;
  created_at: string;
  template_name?: string;
}

export const ReportInsights = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('report_metrics')
        .select(`
          *,
          report_templates!inner(name)
        `);

      if (metricsError) throw metricsError;

      const formattedMetrics = (metricsData || []).map(metric => ({
        ...metric,
        template_name: metric.report_templates?.name || 'Unknown Template'
      }));

      setMetrics(formattedMetrics);

      // Load recent executions
      const { data: executionsData, error: executionsError } = await supabase
        .from('report_executions')
        .select(`
          *,
          report_templates!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (executionsError) throw executionsError;

      const formattedExecutions = (executionsData || []).map(execution => ({
        ...execution,
        template_name: execution.report_templates?.name || 'Unknown Template'
      }));

      setExecutions(formattedExecutions);
    } catch (error) {
      console.error('Error loading insights data:', error);
      toast({
        title: "Error",
        description: "Failed to load report insights.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Report download has started.",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download report.",
        variant: "destructive",
      });
    }
  };

  // Calculate aggregate metrics
  const totalRuns = metrics.reduce((sum, m) => sum + m.total_runs, 0);
  const totalSuccessful = metrics.reduce((sum, m) => sum + m.successful_runs, 0);
  const overallSuccessRate = totalRuns > 0 ? (totalSuccessful / totalRuns) * 100 : 0;
  const avgGenerationTime = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.avg_generation_time_ms, 0) / metrics.length 
    : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Report Insights & Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Performance metrics and analytics for your automated reports
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Generation Time</p>
                <p className="text-2xl font-bold">{Math.round(avgGenerationTime / 1000)}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold">{totalRuns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{overallSuccessRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold">{metrics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Template Performance</h4>
              <div className="space-y-3">
                {metrics.slice(0, 5).map((metric) => {
                  const successRate = metric.total_runs > 0 
                    ? (metric.successful_runs / metric.total_runs) * 100 
                    : 0;
                  
                  return (
                    <div key={metric.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate">{metric.template_name}</span>
                        <span>{successRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={successRate} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Usage Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Executions</span>
                  <Badge variant="secondary">{totalRuns}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Successful Runs</span>
                  <Badge className="bg-green-500/15 text-green-600">{totalSuccessful}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed Runs</span>
                  <Badge variant="destructive">{totalRuns - totalSuccessful}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Templates with Reports</span>
                  <Badge variant="outline">{metrics.filter(m => m.total_runs > 0).length}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Report Executions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No report executions found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {execution.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {execution.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {execution.status === 'processing' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
                      <div>
                        <h4 className="font-semibold">{execution.template_name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            className={
                              execution.status === 'completed' 
                                ? 'bg-green-500/15 text-green-600' 
                                : execution.status === 'failed'
                                ? 'bg-red-500/15 text-red-600'
                                : 'bg-blue-500/15 text-blue-600'
                            }
                          >
                            {execution.status}
                          </Badge>
                          {execution.generation_time_ms && (
                            <Badge variant="outline">
                              {Math.round(execution.generation_time_ms / 1000)}s
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">
                        {new Date(execution.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(execution.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {execution.file_path && execution.status === 'completed' && (
                      <button
                        onClick={() => downloadReport(execution.file_path!, `${execution.template_name}_${new Date(execution.created_at).toISOString().split('T')[0]}`)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
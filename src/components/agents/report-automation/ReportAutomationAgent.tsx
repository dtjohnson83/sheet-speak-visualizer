import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileSpreadsheet, 
  Calendar, 
  Settings, 
  Download, 
  Play, 
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { ReportTemplateManager } from './ReportTemplateManager';
import { ReportScheduler } from './ReportScheduler';
import { ReportInsights } from './ReportInsights';
import { useToast } from '@/hooks/use-toast';
import { useAIAgents } from '@/hooks/useAIAgents';
import { supabase } from '@/integrations/supabase/client';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  template_type: 'sales' | 'financial' | 'operational' | 'custom' | 'excel' | 'pdf' | 'csv';
  source_dataset_id?: string;
  config: any;
  status: 'active' | 'paused' | 'draft';
  created_at: string;
  updated_at: string;
}

interface ReportMetrics {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  avg_generation_time_ms: number;
  last_run_at?: string;
}

export const ReportAutomationAgent = () => {
  const { toast } = useToast();
  const { agents, createTask } = useAIAgents();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [metrics, setMetrics] = useState<Record<string, ReportMetrics>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
    loadMetrics();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as ReportTemplate[]);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load report templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('report_metrics')
        .select('*');

      if (error) throw error;
      
      const metricsMap: Record<string, ReportMetrics> = {};
      data?.forEach(metric => {
        metricsMap[metric.template_id] = metric;
      });
      setMetrics(metricsMap);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleGenerateReport = async (templateId: string) => {
    setIsGenerating(true);
    try {
      // Find the report agent or create one if needed
      let reportAgent = agents.find(a => a.type === 'report_automation');
      if (!reportAgent) {
        toast({
          title: "No Report Agent",
          description: "Please create a report automation agent first.",
          variant: "destructive",
        });
        return;
      }
      
      // Queue the task
      await createTask({
        agentId: reportAgent.id,
        taskType: 'report_generation',
        parameters: {
          templateId,
          manualTrigger: true
        }
      });
      
      toast({
        title: "Report Queued",
        description: "Report generation task has been scheduled. Check insights for updates.",
      });
    } catch (error) {
      console.error('Error queuing report:', error);
      toast({
        title: "Queuing Failed",
        description: "Failed to queue report generation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      case 'paused': return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400';
      case 'draft': return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sales': return <TrendingUp className="h-4 w-4" />;
      case 'financial': return <FileSpreadsheet className="h-4 w-4" />;
      case 'operational': return <Settings className="h-4 w-4" />;
      default: return <FileSpreadsheet className="h-4 w-4" />;
    }
  };

  const activeTemplates = templates.filter(t => t.status === 'active');
  const totalRuns = Object.values(metrics).reduce((sum, m) => sum + m.total_runs, 0);
  const avgSuccessRate = Object.values(metrics).length > 0 
    ? Object.values(metrics).reduce((sum, m) => sum + (m.total_runs > 0 ? (m.successful_runs / m.total_runs) * 100 : 0), 0) / Object.values(metrics).length 
    : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Automation Agent</h2>
          <p className="text-muted-foreground">
            Automate Excel report generation and distribution
          </p>
        </div>
        <Button onClick={() => setActiveTab('templates')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Templates</p>
                    <p className="text-2xl font-bold">{activeTemplates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Runs</p>
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
                    <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Templates</p>
                    <p className="text-2xl font-bold">{templates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No report templates found. Create your first template to get started.</p>
                    <Button className="mt-4" onClick={() => setActiveTab('templates')}>
                      Create Template
                    </Button>
                  </div>
                ) : (
                  templates.map((template) => {
                    const templateMetrics = metrics[template.id];
                    const successRate = templateMetrics && templateMetrics.total_runs > 0 
                      ? ((templateMetrics.successful_runs / templateMetrics.total_runs) * 100).toFixed(1)
                      : '0';

                    return (
                      <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-blue-500/15">
                            {getTypeIcon(template.template_type)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(template.status)}>
                                {template.status}
                              </Badge>
                              <Badge variant="outline">
                                {template.template_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Success Rate</p>
                            <p className="font-medium">{successRate}%</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleGenerateReport(template.id)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Run Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <ReportTemplateManager />
        </TabsContent>

        <TabsContent value="schedule">
          <ReportScheduler />
        </TabsContent>

        <TabsContent value="insights">
          <ReportInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};

import React, { useState } from 'react';
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

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'financial' | 'operational' | 'custom';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  lastRun?: Date;
  status: 'active' | 'paused' | 'draft';
  metrics: {
    totalRuns: number;
    successRate: number;
    avgGenerationTime: number;
  };
}

export const ReportAutomationAgent = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const [templates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Weekly Sales Report',
      description: 'Comprehensive sales performance analysis with trends and forecasts',
      type: 'sales',
      schedule: {
        frequency: 'weekly',
        time: '09:00',
        recipients: ['sales@company.com', 'manager@company.com']
      },
      lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'active',
      metrics: {
        totalRuns: 52,
        successRate: 98.1,
        avgGenerationTime: 45
      }
    },
    {
      id: '2',
      name: 'Monthly Financial Summary',
      description: 'P&L, cash flow, and budget variance analysis',
      type: 'financial',
      schedule: {
        frequency: 'monthly',
        time: '08:00',
        recipients: ['finance@company.com', 'cfo@company.com']
      },
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      metrics: {
        totalRuns: 12,
        successRate: 100,
        avgGenerationTime: 120
      }
    },
    {
      id: '3',
      name: 'Daily Operations Dashboard',
      description: 'Key operational metrics and KPI tracking',
      type: 'operational',
      status: 'draft',
      metrics: {
        totalRuns: 0,
        successRate: 0,
        avgGenerationTime: 0
      }
    }
  ]);

  const handleGenerateReport = async (templateId: string) => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: "Excel report has been generated and is ready for download.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
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
  const totalRuns = templates.reduce((sum, t) => sum + t.metrics.totalRuns, 0);
  const avgSuccessRate = templates.length > 0 
    ? templates.reduce((sum, t) => sum + t.metrics.successRate, 0) / templates.length 
    : 0;

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
                    <p className="text-sm text-muted-foreground">Next Run</p>
                    <p className="text-sm font-medium">Today 9:00 AM</p>
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
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-blue-500/15">
                        {getTypeIcon(template.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(template.status)}>
                            {template.status}
                          </Badge>
                          {template.schedule && (
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              {template.schedule.frequency}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">{template.metrics.successRate}%</p>
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
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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

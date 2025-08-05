import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  FileText,
  Download
} from 'lucide-react';
import { BusinessProcessMining, ProcessVariant, ComplianceIssue } from '@/lib/graph/BusinessProcessMining';
import { BusinessInsight } from '@/lib/graph/BusinessIntelligenceTranslator';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useDomainContext } from '@/hooks/useDomainContext';

interface ProcessMiningDashboardProps {
  data: DataRow[];
  columns: ColumnInfo[];
  datasetId: string;
}

export const ProcessMiningDashboard: React.FC<ProcessMiningDashboardProps> = ({
  data,
  columns,
  datasetId
}) => {
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [processes, setProcesses] = useState<ProcessVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState<ProcessVariant | null>(null);
  const { domainContext } = useDomainContext();

  useEffect(() => {
    const analyzeProcesses = async () => {
      setLoading(true);
      try {
        const processMining = new BusinessProcessMining();
        const processInsights = await processMining.analyzeProcesses(data, columns, datasetId, domainContext);
        setInsights(processInsights);
        
        // Extract actual processes from data analysis
        const discoveredProcesses = await processMining.discoverProcesses(data, columns);
        setProcesses(discoveredProcesses);
        
        if (discoveredProcesses.length > 0) {
          setSelectedProcess(discoveredProcesses[0]);
        }
      } catch (error) {
        console.error('Process mining analysis failed:', error);
      } finally {
        setLoading(false);
      }
    };

    if (data.length > 0) {
      analyzeProcesses();
    }
  }, [data, columns, datasetId, domainContext]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getProcessHealthScore = (process: ProcessVariant): number => {
    return Math.round((process.performance.successRate * 0.4 + 
                     (1 - process.performance.avgDuration / 300) * 0.3 + 
                     (1 - process.performance.cost / 1000) * 0.3) * 100);
  };

  const calculateTotalSavings = (): number => {
    return insights.reduce((total, insight) => {
      const potentialMatch = insight.businessImpact.financial.potential.match(/\$([0-9,]+)/);
      if (potentialMatch) {
        return total + parseInt(potentialMatch[1].replace(/,/g, ''), 10);
      }
      return total;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Analyzing business processes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Processes</p>
                <p className="text-2xl font-bold">{processes.length}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-destructive">
                  {insights.filter(i => i.businessImpact.strategic.priority === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${calculateTotalSavings().toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(processes.reduce((sum, p) => sum + p.performance.successRate, 0) / processes.length * 100)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Process Overview</TabsTrigger>
          <TabsTrigger value="insights">Business Insights</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Process List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Process Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {processes.map((process) => {
                  const healthScore = getProcessHealthScore(process);
                  return (
                    <div 
                      key={process.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedProcess?.id === process.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedProcess(process)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{process.name}</h4>
                        <Badge variant={healthScore > 80 ? 'default' : healthScore > 60 ? 'secondary' : 'destructive'}>
                          {healthScore}% Health
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg Duration</p>
                          <p className="font-medium">{Math.round(process.performance.avgDuration)}min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium">{Math.round(process.performance.successRate * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volume</p>
                          <p className="font-medium">{process.performance.volume}</p>
                        </div>
                      </div>

                      <Progress value={healthScore} className="mt-3" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Process Details */}
            {selectedProcess && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {selectedProcess.name} Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Duration</p>
                        <p className="text-2xl font-bold">{Math.round(selectedProcess.performance.avgDuration)}min</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">{Math.round(selectedProcess.performance.successRate * 100)}%</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Cost</p>
                        <p className="text-2xl font-bold">${selectedProcess.performance.cost}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Volume</p>
                        <p className="text-2xl font-bold">{selectedProcess.performance.volume}</p>
                      </div>
                    </div>
                  </div>

                  {selectedProcess.deviations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Common Deviations
                      </h5>
                      <ul className="space-y-1">
                        {selectedProcess.deviations.map((deviation, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-destructive" />
                            {deviation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-6">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.businessTitle}</CardTitle>
                    <Badge variant={getPriorityColor(insight.businessImpact.strategic.priority)}>
                      {insight.businessImpact.strategic.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{insight.executiveSummary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <h5 className="font-medium">Financial Impact</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.businessImpact.financial.potential}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.businessImpact.financial.confidence}% confidence • {insight.businessImpact.financial.timeframe}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <h5 className="font-medium">Operational</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.businessImpact.operational.efficiency}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <h5 className="font-medium">Stakeholders</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.stakeholders.join(', ')}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Recommended Actions</h5>
                    <div className="space-y-2">
                      {insight.actionableRecommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{rec.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {rec.timeline} • {rec.expectedOutcome}
                            </p>
                          </div>
                          <Badge variant="outline">{rec.effort} effort</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">87%</p>
                  <p className="text-sm text-muted-foreground">Compliance Rate</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-warning">23</p>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold text-destructive">5</p>
                  <p className="text-sm text-muted-foreground">Critical Violations</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">2.3</p>
                  <p className="text-sm text-muted-foreground">Avg Resolution Days</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Recent Compliance Insights</h4>
                {insights.filter(i => i.businessTitle.toLowerCase().includes('compliance')).map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{insight.businessTitle}</h5>
                      <Badge variant="destructive">High Priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.executiveSummary}</p>
                    <div className="flex gap-2">
                      {insight.actionableRecommendations.slice(0, 1).map((rec, index) => (
                        <Button key={index} variant="outline" size="sm">
                          {rec.action}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Process Optimization Opportunities
                </CardTitle>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {insights.filter(i => i.businessTitle.toLowerCase().includes('optimization')).map((insight) => (
                  <div key={insight.id} className="p-6 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium">{insight.businessTitle}</h4>
                      <Badge variant="default">High Impact</Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{insight.executiveSummary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-3">Expected Benefits</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Financial Impact:</span>
                            <span className="text-sm font-medium">{insight.businessImpact.financial.potential}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Efficiency Gain:</span>
                            <span className="text-sm font-medium">{insight.businessImpact.operational.efficiency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Timeline:</span>
                            <span className="text-sm font-medium">{insight.businessImpact.financial.timeframe}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-3">Implementation Steps</h5>
                        <div className="space-y-2">
                          {insight.actionableRecommendations.map((rec, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{rec.action}</p>
                                <p className="text-xs text-muted-foreground">{rec.timeline}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
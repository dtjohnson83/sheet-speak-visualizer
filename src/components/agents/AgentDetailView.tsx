import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  Clock,
  Activity,
  Target,
  TrendingUp,
  Bell
} from 'lucide-react';
import { Agent } from '@/types/agents';
import { BusinessRulesTab } from './tabs/BusinessRulesTab';
import { AlertManagementPanel } from './AlertManagementPanel';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgentDetailViewProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
  columns: string[];
}

export const AgentDetailView = ({ agent, open, onClose, columns }: AgentDetailViewProps) => {
  const isMobile = useIsMobile();
  
  if (!agent) return null;

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'data_quality': return <BarChart3 className="h-5 w-5" />;
      case 'anomaly_detection': return <AlertTriangle className="h-5 w-5" />;
      case 'trend_analysis': return <TrendingUp className="h-5 w-5" />;
      case 'predictive_analytics': return <Target className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'paused': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDatasetInfo = () => {
    const dataContext = agent.configuration?.dataContext;
    if (!dataContext) return null;
    
    return {
      fileName: dataContext.fileName || 'Unknown Dataset',
      rowCount: dataContext.rowCount || 0,
      columnCount: dataContext.columnCount || 0
    };
  };

  const datasetInfo = getDatasetInfo();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto ${isMobile ? 'p-4' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getAgentIcon(agent.type)}
              <span>{agent.name}</span>
            </div>
            <Badge className={getStatusColor(agent.status)}>
              {agent.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`w-full ${isMobile ? 'flex overflow-x-auto' : 'grid grid-cols-2 sm:grid-cols-5'}`}>
            <TabsTrigger 
              value="overview" 
              className={`flex-col sm:flex-row gap-1 sm:gap-2 ${isMobile ? 'h-8 px-2 text-xs flex-shrink-0 min-w-[80px]' : 'h-auto py-2'}`}
            >
              <Activity className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="business-rules" 
              className={`flex-col sm:flex-row gap-1 sm:gap-2 ${isMobile ? 'h-8 px-2 text-xs flex-shrink-0 min-w-[70px]' : 'h-auto py-2'}`}
            >
              <Target className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Rules</span>
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className={`flex-col sm:flex-row gap-1 sm:gap-2 ${isMobile ? 'h-8 px-2 text-xs flex-shrink-0 min-w-[70px]' : 'h-auto py-2'}`}
            >
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Alerts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="configuration" 
              className={`flex-col sm:flex-row gap-1 sm:gap-2 ${isMobile ? 'h-8 px-2 text-xs flex-shrink-0 min-w-[70px]' : 'h-auto py-2'}`}
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Config</span>
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className={`flex-col sm:flex-row gap-1 sm:gap-2 ${isMobile ? 'h-8 px-2 text-xs flex-shrink-0 min-w-[80px]' : 'h-auto py-2'}`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Monitor</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <div>
                    <h4 className="font-medium mb-2">Type</h4>
                    <p className="text-sm text-muted-foreground">
                      {agent.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Priority</h4>
                    <p className="text-sm text-muted-foreground">{agent.priority}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Capabilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Last Active</h4>
                    <p className="text-sm text-muted-foreground">
                      {agent.last_active 
                        ? new Date(agent.last_active).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>

                {datasetInfo && (
                  <div>
                    <h4 className="font-medium mb-2">Dataset Information</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{datasetInfo.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {datasetInfo.rowCount.toLocaleString()} rows × {datasetInfo.columnCount} columns
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business-rules">
            <BusinessRulesTab agent={agent} columns={columns} />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertManagementPanel agentId={agent.id} />
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>
                  Current configuration settings for this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agent.configuration?.schedule && (
                    <div>
                      <h4 className="font-medium mb-2">Schedule</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Frequency:</strong> {agent.configuration.schedule.frequency}
                        </p>
                        {agent.configuration.schedule.time && (
                          <p className="text-sm">
                            <strong>Time:</strong> {agent.configuration.schedule.time}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {agent.configuration?.thresholds && (
                    <div>
                      <h4 className="font-medium mb-2">Thresholds</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        {Object.entries(agent.configuration.thresholds).map(([key, value]) => (
                          <p key={key} className="text-sm">
                            <strong>{key.replace('_', ' ')}:</strong> {String(value)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
                <CardDescription>
                  Monitor agent performance and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">N/A</p>
                      <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">N/A</p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">N/A</p>
                      <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Detailed monitoring metrics will be available once the agent starts processing tasks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
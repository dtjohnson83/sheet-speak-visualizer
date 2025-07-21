
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileSpreadsheet,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';
import { Agent } from '@/types/agents';

interface AgentOverviewTabProps {
  agents: Agent[];
  onCreateAgent: (type: string) => void;
}

export const AgentOverviewTab = ({ agents, onCreateAgent }: AgentOverviewTabProps) => {
  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'data_quality': return <CheckCircle className="h-4 w-4" />;
      case 'anomaly_detection': return <AlertTriangle className="h-4 w-4" />;
      case 'trend_analysis': return <TrendingUp className="h-4 w-4" />;
      case 'predictive_analytics': return <BarChart3 className="h-4 w-4" />;
      case 'report_automation': return <FileSpreadsheet className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'data_quality': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      case 'anomaly_detection': return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'trend_analysis': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'predictive_analytics': return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
      case 'report_automation': return 'bg-orange-500/15 text-orange-600 dark:text-orange-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      case 'inactive': return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
      case 'error': return 'bg-red-500/15 text-red-600 dark:text-red-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const agentTypes = [
    {
      type: 'data_quality',
      name: 'Data Quality Monitor',
      description: 'Monitors data completeness, accuracy, and consistency',
      icon: CheckCircle,
      color: 'green'
    },
    {
      type: 'anomaly_detection',
      name: 'Anomaly Detection',
      description: 'Identifies unusual patterns and outliers in your data',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      type: 'trend_analysis',
      name: 'Trend Analyzer',
      description: 'Analyzes trends and patterns over time',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      type: 'predictive_analytics',
      name: 'Predictive Analytics',
      description: 'Forecasts future trends based on historical data',
      icon: BarChart3,
      color: 'purple'
    },
    {
      type: 'report_automation',
      name: 'Report Automation',
      description: 'Automates Excel report generation and distribution',
      icon: FileSpreadsheet,
      color: 'orange'
    }
  ];

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const inactiveAgents = agents.filter(agent => agent.status === 'inactive');
  const errorAgents = agents.filter(agent => agent.status === 'error');

  return (
    <TabsContent value="overview" className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeAgents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{inactiveAgents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold">{errorAgents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Agent Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentTypes.map((agentType) => {
              const Icon = agentType.icon;
              const existingAgent = agents.find(a => a.type === agentType.type);
              
              return (
                <Card key={agentType.type} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getAgentTypeColor(agentType.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{agentType.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {agentType.description}
                          </p>
                          {existingAgent && (
                            <Badge className={`mt-2 ${getStatusColor(existingAgent.status)}`}>
                              {existingAgent.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        variant={existingAgent ? "outline" : "default"}
                        onClick={() => onCreateAgent(agentType.type)}
                        className="w-full"
                      >
                        {existingAgent ? 'Configure' : 'Create Agent'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Agent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getAgentTypeColor(agent.type)}`}>
                      {getAgentTypeIcon(agent.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                    {agent.lastRun && (
                      <span className="text-sm text-muted-foreground">
                        {agent.lastRun.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
};

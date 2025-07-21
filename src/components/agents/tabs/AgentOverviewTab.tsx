
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Shield,
  Brain,
  Eye,
  Zap,
  Plus
} from 'lucide-react';
import { AIAgent } from '@/types/agents';
import { formatDistanceToNow } from 'date-fns';

interface AgentOverviewTabProps {
  agents: AIAgent[];
  onCreateAgent: (type: string) => void;
}

export const AgentOverviewTab = ({ agents, onCreateAgent }: AgentOverviewTabProps) => {
  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'data_quality': return Shield;
      case 'anomaly_detection': return AlertTriangle;
      case 'trend_analysis': return TrendingUp;
      case 'predictive_analytics': return BarChart3;
      case 'monitoring': return Activity;
      case 'insight_generation': return Brain;
      case 'visualization': return Eye;
      default: return Bot;
    }
  };

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'data_quality': return 'bg-blue-500';
      case 'anomaly_detection': return 'bg-red-500';
      case 'trend_analysis': return 'bg-green-500';
      case 'predictive_analytics': return 'bg-purple-500';
      case 'monitoring': return 'bg-orange-500';
      case 'insight_generation': return 'bg-indigo-500';
      case 'visualization': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const availableAgentTypes = [
    {
      type: 'data_quality',
      name: 'Data Quality Monitor',
      description: 'Continuously monitors data completeness, accuracy, and consistency',
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      type: 'anomaly_detection',
      name: 'Anomaly Detection',
      description: 'Identifies unusual patterns and outliers in your data',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      type: 'trend_analysis',
      name: 'Trend Analysis',
      description: 'Analyzes trends and patterns over time',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      type: 'predictive_analytics',
      name: 'Predictive Analytics',
      description: 'Forecasts future trends based on historical data',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      type: 'monitoring',
      name: 'Real-time Monitor',
      description: 'Monitors data streams and alerts on critical changes',
      icon: Activity,
      color: 'bg-orange-500'
    }
  ];

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const inactiveAgents = agents.filter(agent => agent.status === 'inactive');
  const errorAgents = agents.filter(agent => agent.status === 'error');

  const calculateProgress = () => {
    if (agents.length === 0) return 0;
    return (activeAgents.length / agents.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeAgents.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-orange-600">{inactiveAgents.length}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorAgents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Overall performance of your AI agent ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Active Agents</span>
                <span>{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
            
            {agents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {agents.slice(0, 3).map((agent) => {
                  const IconComponent = getAgentTypeIcon(agent.type);
                  return (
                    <div key={agent.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`p-2 rounded-full ${getAgentTypeColor(agent.type)}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{agent.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={agent.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {agent.status}
                          </Badge>
                          {agent.last_active && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(agent.last_active), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Agent Types */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Agent</CardTitle>
          <CardDescription>Deploy specialized AI agents to automate your data analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAgentTypes.map((agentType) => {
              const IconComponent = agentType.icon;
              const existingAgent = agents.find(agent => agent.type === agentType.type);
              
              return (
                <div key={agentType.type} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-full ${agentType.color}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{agentType.name}</h4>
                      {existingAgent && (
                        <Badge variant="secondary" className="text-xs">
                          Already created
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {agentType.description}
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => onCreateAgent(agentType.type)}
                    disabled={!!existingAgent}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {existingAgent ? 'Already Created' : 'Create Agent'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Play, Pause, Settings, Activity, Brain, TrendingUp, Eye, AlertTriangle } from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useScheduledAgentTasks } from '@/hooks/useScheduledAgentTasks';
import { AIAgent, AgentSummary } from '@/types/agents';
import { AgentInsightsList } from './AgentInsightsList';
import { AgentTaskQueue } from './AgentTaskQueue';
import { CreateAgentDialog } from './CreateAgentDialog';
import { AgentTestingPanel } from './AgentTestingPanel';
import { AgentMonitoringDashboard } from './AgentMonitoringDashboard';

export const AIAgentOrchestrator = () => {
  const { 
    agents, 
    tasks, 
    insights, 
    agentSummary, 
    isLoading, 
    updateAgentStatus 
  } = useAIAgents();
  const { isAdmin } = useUsageTracking();
  
  // Enable automated task scheduling
  useScheduledAgentTasks();

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'monitoring': return <Activity className="h-4 w-4" />;
      case 'insight_generation': return <Brain className="h-4 w-4" />;
      case 'visualization': return <Eye className="h-4 w-4" />;
      case 'anomaly_detection': return <AlertTriangle className="h-4 w-4" />;
      case 'trend_analysis': return <TrendingUp className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'paused': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const handleToggleAgent = (agent: AIAgent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    updateAgentStatus({ agentId: agent.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agentSummary.total_agents}</p>
              </div>
              <Bot className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold text-success">{agentSummary.active_agents}</p>
              </div>
              <Activity className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold text-warning">{agentSummary.pending_tasks}</p>
              </div>
              <Settings className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Insights</p>
                <p className="text-2xl font-bold text-info">{agentSummary.unread_insights}</p>
              </div>
              <Brain className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testing Panel */}
      <AgentTestingPanel />

      {/* Monitoring Dashboard */}
      <AgentMonitoringDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Agents
                </CardTitle>
                <CardDescription>
                  Manage your automated analysis agents
                </CardDescription>
              </div>
              <CreateAgentDialog />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No agents created yet</p>
                  <p className="text-sm text-muted-foreground">Create your first AI agent to get started</p>
                </div>
              ) : (
                agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getAgentIcon(agent.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{agent.name}</p>
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(agent.status)}
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {agent.description || `${agent.type.replace('_', ' ')} agent`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAgent(agent)}
                    >
                      {agent.status === 'active' ? (
                        <><Pause className="h-4 w-4 mr-1" /> Pause</>
                      ) : (
                        <><Play className="h-4 w-4 mr-1" /> Start</>
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent Insights */}
        <AgentInsightsList insights={insights.slice(0, 5)} />
      </div>

      {/* Task Queue */}
      <AgentTaskQueue tasks={tasks.slice(0, 10)} />
    </div>
  );
};
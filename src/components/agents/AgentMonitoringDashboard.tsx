import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap, 
  RefreshCw,
  TrendingUp,
  BarChart,
  AlertTriangle
} from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useUserRole } from '@/hooks/useUserRole';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const AgentMonitoringDashboard = () => {
  const { agents, tasks, insights, agentSummary } = useAIAgents();
  const { isAdmin } = useUserRole();
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Set up real-time subscriptions
  useEffect(() => {
    setRealtimeStatus('connecting');
    
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_tasks'
        },
        () => {
          setLastUpdate(new Date());
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    const insightsChannel = supabase
      .channel('insights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_insights'
        },
        () => {
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(insightsChannel);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-info animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTaskProgress = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'running': return 50;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  const recentTasks = isAdmin ? tasks.slice(0, 20) : tasks.slice(0, 5);
  const recentInsights = isAdmin ? insights.slice(0, 10) : insights.slice(0, 3);

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">System Status</CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                realtimeStatus === 'connected' ? 'bg-success' : 
                realtimeStatus === 'connecting' ? 'bg-warning' : 'bg-destructive'
              }`} />
              <span className="text-sm text-muted-foreground">
                {realtimeStatus === 'connected' ? 'Live' : 
                 realtimeStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{tasksByStatus.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{tasksByStatus.running}</div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{tasksByStatus.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{tasksByStatus.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-xs text-muted-foreground">
            Last update: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No tasks yet
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="font-medium text-sm">
                          {task.task_type.replace('_', ' ')}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            task.status === 'completed' ? 'bg-success' :
                            task.status === 'running' ? 'bg-info' :
                            task.status === 'failed' ? 'bg-destructive' : 'bg-warning'
                          }`}
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <Progress value={getTaskProgress(task.status)} className="h-1" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Latest Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInsights.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No insights yet
                </div>
              ) : (
                recentInsights.map((insight) => (
                  <div key={insight.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {insight.insight_type === 'trend' && <TrendingUp className="h-3 w-3 text-blue-600" />}
                        {insight.insight_type === 'anomaly' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                        {insight.insight_type === 'correlation' && <BarChart className="h-3 w-3 text-green-600" />}
                        <span className="font-medium text-sm">{insight.title}</span>
                        {!insight.is_read && (
                          <Badge variant="default" className="bg-primary text-xs">New</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence_score * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {insight.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Agent Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => {
              const agentTasks = tasks.filter(t => t.agent_id === agent.id);
              const agentInsights = insights.filter(i => i.agent_id === agent.id);
              const successRate = agentTasks.length > 0 
                ? (agentTasks.filter(t => t.status === 'completed').length / agentTasks.length) * 100 
                : 0;

              return (
                <div key={agent.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">{agent.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={agent.status === 'active' ? 'bg-success' : 'bg-warning'}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {successRate.toFixed(0)}% success
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tasks:</span>
                      <span className="ml-2 font-medium">{agentTasks.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Insights:</span>
                      <span className="ml-2 font-medium">{agentInsights.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Active:</span>
                      <span className="ml-2 font-medium">
                        {agent.last_active 
                          ? formatDistanceToNow(new Date(agent.last_active), { addSuffix: true })
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {agents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No agents created yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
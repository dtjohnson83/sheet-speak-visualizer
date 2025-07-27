import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Play, 
  Pause, 
  Calendar, 
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useDatasets } from '@/hooks/useDatasets';
import { formatDistanceToNow, addHours, addDays, addWeeks } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AgentScheduleManager } from './AgentScheduleManager';

interface ScheduledTask {
  agentId: string;
  agentName: string;
  agentType: string;
  nextRun: Date;
  frequency: string;
  status: 'active' | 'paused' | 'error';
  lastRun?: Date;
  estimatedDuration: number; // in minutes
}

export const SchedulingDashboard = () => {
  const { agents, tasks, triggerProcessor, isTriggeringProcessor } = useAIAgents();
  const { datasets } = useDatasets();
  const { toast } = useToast();
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);

  // Calculate next run times for agents
  useEffect(() => {
    const calculateScheduledTasks = () => {
      const scheduled: ScheduledTask[] = [];
      
      agents.forEach(agent => {
        if (agent.status === 'active') {
          const frequency = agent.configuration?.analysis_frequency || 'daily';
          const lastActive = agent.last_active ? new Date(agent.last_active) : new Date();
          
          let nextRun: Date;
          switch (frequency) {
            case 'hourly':
              nextRun = addHours(lastActive, 1);
              break;
            case 'daily':
              nextRun = addDays(lastActive, 1);
              break;
            case 'weekly':
              nextRun = addWeeks(lastActive, 1);
              break;
            default:
              nextRun = addDays(lastActive, 1);
          }

          // Estimate duration based on agent type and dataset count
          const estimatedDuration = agent.type === 'anomaly_detection' ? 5 :
                                  agent.type === 'trend_analysis' ? 3 : 4;

          scheduled.push({
            agentId: agent.id,
            agentName: agent.name,
            agentType: agent.type,
            nextRun,
            frequency,
            status: agent.status as 'active' | 'paused' | 'error',
            lastRun: agent.last_active ? new Date(agent.last_active) : undefined,
            estimatedDuration: estimatedDuration * datasets.length
          });
        }
      });

      // Sort by next run time
      scheduled.sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime());
      setScheduledTasks(scheduled);
    };

    calculateScheduledTasks();
  }, [agents, datasets]);

  const handleRunNow = async (agentId: string) => {
    try {
      await triggerProcessor(agentId);
      toast({
        title: "Agent triggered",
        description: "Tasks created and processing started for this agent",
      });
    } catch (error) {
      toast({
        title: "Failed to trigger agent",
        description: "There was an error starting the agent execution",
        variant: "destructive",
      });
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'hourly': return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'daily': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'weekly': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'anomaly_detection': return '⚠️';
      case 'trend_analysis': return '📈';
      case 'data_quality': return '✅';
      default: return '🤖';
    }
  };

  const upcomingTasks = scheduledTasks.filter(task => task.nextRun > new Date());
  const overdueTasks = scheduledTasks.filter(task => task.nextRun <= new Date());

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{upcomingTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'running').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => 
                    t.status === 'completed' && 
                    new Date(t.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Overdue Tasks ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <div key={task.agentId} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(task.agentType)}</span>
                    <div>
                      <h4 className="font-medium">{task.agentName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Due {formatDistanceToNow(task.nextRun, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleRunNow(task.agentId)}
                    disabled={isTriggeringProcessor}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Run Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming scheduled tasks
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div key={task.agentId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getTypeIcon(task.agentType)}</span>
                      <div>
                        <h4 className="font-medium">{task.agentName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.agentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getFrequencyColor(task.frequency)}>
                        {task.frequency}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRunNow(task.agentId)}
                        disabled={isTriggeringProcessor}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Next Run:</span>
                      <div className="font-medium">
                        {formatDistanceToNow(task.nextRun, { addSuffix: true })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {task.nextRun.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Duration:</span>
                      <div className="font-medium">{task.estimatedDuration} min</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Run:</span>
                      <div className="font-medium">
                        {task.lastRun 
                          ? formatDistanceToNow(task.lastRun, { addSuffix: true })
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Progress bar showing time until next run */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Time until next run</span>
                      <span>{Math.max(0, Math.round((task.nextRun.getTime() - Date.now()) / (1000 * 60 * 60)))}h remaining</span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, 
                        ((Date.now() - (task.lastRun?.getTime() || Date.now() - 24*60*60*1000)) / 
                         (task.nextRun.getTime() - (task.lastRun?.getTime() || Date.now() - 24*60*60*1000))) * 100
                      ))}
                      className="h-2"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Schedule Management */}
      <AgentScheduleManager agents={agents} />
    </div>
  );
};
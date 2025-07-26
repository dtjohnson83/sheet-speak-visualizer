import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Eye,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { AgentTask } from '@/types/agents';

interface TaskProgress {
  taskId: string;
  stage: string;
  progress: number;
  estimatedTimeRemaining: number; // in seconds
  logs: string[];
  errorDetails?: string;
}

export const TaskProgressTracker = () => {
  const { tasks, deleteTask, createTask, isDeletingTask } = useAIAgents();
  const { toast } = useToast();
  const [taskProgresses, setTaskProgresses] = useState<Map<string, TaskProgress>>(new Map());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Simulate progress tracking for running tasks
  useEffect(() => {
    const runningTasks = tasks.filter(task => task.status === 'running');
    
    runningTasks.forEach(task => {
      if (!taskProgresses.has(task.id)) {
        // Initialize progress for new running tasks
        const initialProgress: TaskProgress = {
          taskId: task.id,
          stage: getInitialStage(task.task_type),
          progress: 10,
          estimatedTimeRemaining: getEstimatedDuration(task.task_type),
          logs: [`Task started: ${task.task_type.replace('_', ' ')}`]
        };
        
        setTaskProgresses(prev => new Map(prev.set(task.id, initialProgress)));
      }
    });

    // Simulate progress updates for running tasks
    const interval = setInterval(() => {
      setTaskProgresses(prev => {
        const newMap = new Map(prev);
        
        runningTasks.forEach(task => {
          const current = newMap.get(task.id);
          if (current && current.progress < 90) {
            const increment = Math.random() * 15 + 5; // 5-20% progress
            const newProgress = Math.min(90, current.progress + increment);
            const timeElapsed = (100 - newProgress) / 100 * getEstimatedDuration(task.task_type);
            
            newMap.set(task.id, {
              ...current,
              progress: newProgress,
              estimatedTimeRemaining: timeElapsed,
              stage: getStageFromProgress(newProgress, task.task_type),
              logs: [
                ...current.logs,
                `${getStageFromProgress(newProgress, task.task_type)} - ${Math.round(newProgress)}% complete`
              ].slice(-5) // Keep only last 5 logs
            });
          }
        });
        
        return newMap;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [tasks, taskProgresses]);

  // Clean up completed/failed tasks from progress tracking
  useEffect(() => {
    const activeTasks = tasks.filter(task => task.status === 'running');
    const activeTaskIds = new Set(activeTasks.map(task => task.id));
    
    setTaskProgresses(prev => {
      const newMap = new Map();
      prev.forEach((progress, taskId) => {
        if (activeTaskIds.has(taskId)) {
          newMap.set(taskId, progress);
        }
      });
      return newMap;
    });
  }, [tasks]);

  const getInitialStage = (taskType: string): string => {
    switch (taskType) {
      case 'detect_anomalies': return 'Initializing anomaly detection';
      case 'analyze_trends': return 'Loading trend analysis engine';
      case 'generate_insights': return 'Preparing insight generation';
      case 'generate_report': return 'Setting up report generation';
      default: return 'Initializing task';
    }
  };

  const getStageFromProgress = (progress: number, taskType: string): string => {
    if (progress < 25) return getInitialStage(taskType);
    if (progress < 50) return getMiddleStage(taskType);
    if (progress < 75) return getAdvancedStage(taskType);
    return getFinalStage(taskType);
  };

  const getMiddleStage = (taskType: string): string => {
    switch (taskType) {
      case 'detect_anomalies': return 'Analyzing data patterns';
      case 'analyze_trends': return 'Computing trend metrics';
      case 'generate_insights': return 'Processing data correlations';
      case 'generate_report': return 'Collecting data and formatting';
      default: return 'Processing data';
    }
  };

  const getAdvancedStage = (taskType: string): string => {
    switch (taskType) {
      case 'detect_anomalies': return 'Identifying outliers and anomalies';
      case 'analyze_trends': return 'Generating trend visualizations';
      case 'generate_insights': return 'Formulating insights and recommendations';
      case 'generate_report': return 'Generating charts and tables';
      default: return 'Finalizing analysis';
    }
  };

  const getFinalStage = (taskType: string): string => {
    switch (taskType) {
      case 'detect_anomalies': return 'Finalizing anomaly report';
      case 'analyze_trends': return 'Completing trend analysis';
      case 'generate_insights': return 'Packaging insights';
      case 'generate_report': return 'Saving report file';
      default: return 'Completing task';
    }
  };

  const getEstimatedDuration = (taskType: string): number => {
    switch (taskType) {
      case 'detect_anomalies': return 300; // 5 minutes
      case 'analyze_trends': return 180; // 3 minutes
      case 'generate_insights': return 240; // 4 minutes
      case 'generate_report': return 600; // 10 minutes
      default: return 240; // 4 minutes
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-info animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'running': return 'bg-info';
      case 'completed': return 'bg-success';
      case 'failed': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  };

  const handleRetryTask = async (task: AgentTask) => {
    try {
      await createTask({
        agentId: task.agent_id,
        taskType: task.task_type,
        parameters: {}
      });
      
      toast({
        title: "Task retried",
        description: "A new task has been queued for execution",
      });
    } catch (error) {
      toast({
        title: "Failed to retry task",
        description: "There was an error creating the retry task",
        variant: "destructive",
      });
    }
  };

  const runningTasks = tasks.filter(task => task.status === 'running');
  const recentTasks = tasks.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Running Tasks with Live Progress */}
      {runningTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Active Tasks ({runningTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {runningTasks.map((task) => {
                const progress = taskProgresses.get(task.id);
                return (
                  <div key={task.id} className="p-4 border rounded-lg bg-info/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-info" />
                        <div>
                          <h4 className="font-medium">
                            {task.task_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {progress?.stage || 'Processing...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-info text-info-foreground">Running</Badge>
                        {progress && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeRemaining(progress.estimatedTimeRemaining)} remaining
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {progress && (
                      <>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress.progress)}%</span>
                          </div>
                          <Progress value={progress.progress} className="h-2" />
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <p>Started {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</p>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tasks Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Task History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks yet
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h4 className="font-medium text-sm">
                            {task.task_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        {task.status === 'failed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRetryTask(task)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          disabled={isDeletingTask}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Task Details Dropdown */}
                    {selectedTask === task.id && (
                      <div className="mt-3 p-3 bg-muted/50 rounded">
                        <div className="text-xs space-y-2">
                          <div>
                            <span className="font-medium">Task ID:</span>
                            <p className="mt-1 text-xs bg-background p-2 rounded font-mono">
                              {task.id}
                            </p>
                          </div>
                          {task.error_message && (
                            <div>
                              <span className="font-medium text-destructive">Error:</span>
                              <p className="mt-1 text-destructive">{task.error_message}</p>
                            </div>
                          )}
                          {taskProgresses.get(task.id)?.logs && (
                            <div>
                              <span className="font-medium">Recent Logs:</span>
                              <div className="mt-1 space-y-1">
                                {taskProgresses.get(task.id)!.logs.map((log, index) => (
                                  <p key={index} className="text-xs">{log}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
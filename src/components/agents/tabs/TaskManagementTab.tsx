import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, Clock, CheckCircle, XCircle, Loader, Trash2, TrashIcon, MoreVertical } from 'lucide-react';
import { AgentTask } from '@/types/agents';
import { formatDistanceToNow } from 'date-fns';

interface TaskManagementTabProps {
  tasks: AgentTask[];
  onCreate: (params: any) => void;
  onDelete: (taskId: string) => void;
  onClearAll: (status?: 'completed' | 'failed' | 'all') => void;
  onScheduleForDataset: (datasetId: string) => void;
  isDeletingTask: boolean;
  isClearingAllTasks: boolean;
}

export const TaskManagementTab = ({ 
  tasks, 
  onCreate,
  onDelete: onDeleteTask, 
  onClearAll: onClearAllTasks,
  onScheduleForDataset,
  isDeletingTask,
  isClearingAllTasks
}: TaskManagementTabProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'running': return <Loader className="h-4 w-4 text-info animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Settings className="h-4 w-4" />;
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

  const getTaskTypeLabel = (taskType: string) => {
    return taskType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateProgress = (task: AgentTask) => {
    switch (task.status) {
      case 'pending': return 0;
      case 'running': return 50;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const runningTasks = tasks.filter(task => task.status === 'running').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const failedTasks = tasks.filter(task => task.status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Task Queue ({tasks.length})
            </CardTitle>
            <CardDescription>
              Monitor agent task execution and progress
            </CardDescription>
          </div>
          {tasks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Clear Tasks
                  <MoreVertical className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Clear Completed ({completedTasks})
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Completed Tasks</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {completedTasks} completed tasks. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onClearAllTasks('completed')}
                        disabled={isClearingAllTasks}
                      >
                        Clear Completed
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Clear Failed ({failedTasks})
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Failed Tasks</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {failedTasks} failed tasks. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onClearAllTasks('failed')}
                        disabled={isClearingAllTasks}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear Failed
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                      Clear All Tasks
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Tasks</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {tasks.length} tasks. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onClearAllTasks('all')}
                        disabled={isClearingAllTasks}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{pendingTasks}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-info">{runningTasks}</div>
            <div className="text-sm text-muted-foreground">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{completedTasks}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{failedTasks}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tasks in queue</p>
              <p className="text-sm text-muted-foreground">
                Tasks will appear here when agents start working
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <h4 className="font-medium">{getTaskTypeLabel(task.task_type)}</h4>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(task.status)}
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {task.status === 'completed' && task.completed_at
                        ? `Completed ${formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}`
                        : `Scheduled ${formatDistanceToNow(new Date(task.scheduled_at), { addSuffix: true })}`
                      }
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isDeletingTask}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Task</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this task. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDeleteTask(task.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <Progress value={calculateProgress(task)} className="mb-2" />
                
                {task.error_message && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    Error: {task.error_message}
                  </div>
                )}
                
                {task.result && task.status === 'completed' && (
                  <div className="text-sm text-muted-foreground">
                    Task completed successfully
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

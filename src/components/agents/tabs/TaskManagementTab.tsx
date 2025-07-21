
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Clock, CheckCircle, XCircle, Loader, Trash2, TrashIcon, MoreVertical, Timer, AlertCircle } from 'lucide-react';
import { AgentTask } from '@/types/agents';
import { formatDistanceToNow } from 'date-fns';

interface TaskManagementTabProps {
  tasks: AgentTask[];
  onDeleteTask: (taskId: string) => void;
  onClearAllTasks: (status?: 'completed' | 'failed' | 'all') => void;
  isDeletingTask: boolean;
  isClearingAllTasks: boolean;
}

export const TaskManagementTab = ({ 
  tasks, 
  onDeleteTask, 
  onClearAllTasks,
  isDeletingTask,
  isClearingAllTasks
}: TaskManagementTabProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'running': return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-2xl font-bold text-orange-900">{pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Running</p>
                <p className="text-2xl font-bold text-blue-900">{runningTasks}</p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">{failedTasks}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50 border-b border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Clock className="h-5 w-5 text-orange-600" />
                Task Queue
              </CardTitle>
              <CardDescription className="text-orange-700">
                Monitor and manage agent task execution
              </CardDescription>
            </div>
            {tasks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
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
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-lg font-medium text-orange-900 mb-2">No tasks in queue</p>
                <p className="text-sm text-orange-600">
                  Tasks will appear here when agents start working
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50/30 hover:bg-orange-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        {getStatusIcon(task.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-900">{getTaskTypeLabel(task.task_type)}</h4>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-orange-600">
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
                            className="text-destructive hover:text-destructive border-red-200"
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
                  
                  <div className="mb-3">
                    <Progress 
                      value={calculateProgress(task)} 
                      className="h-2"
                    />
                  </div>
                  
                  {task.error_message && (
                    <div className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                      <strong>Error:</strong> {task.error_message}
                    </div>
                  )}
                  
                  {task.result && task.status === 'completed' && (
                    <div className="text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200">
                      <strong>Success:</strong> Task completed successfully
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Play, Trash2 } from "lucide-react";
import { useAgentTaskCleaner } from "@/hooks/agents/useAgentTaskCleaner";
import { useAgentTasks } from "@/hooks/agents/useAgentTasks";

export const TaskCleanupPanel = () => {
  const { cleanupTasks, forceProcess, isCleaningUp, isProcessing } = useAgentTaskCleaner();
  const { tasks } = useAgentTasks();

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const stuckTasks = pendingTasks.filter(task => {
    const taskAge = Date.now() - new Date(task.created_at).getTime();
    return taskAge > 30 * 60 * 1000; // Older than 30 minutes
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Task Management
        </CardTitle>
        <CardDescription>
          Manage stuck or pending tasks to resolve processing issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Pending Tasks:</span>
            <span className="ml-2 text-muted-foreground">{pendingTasks.length}</span>
          </div>
          <div>
            <span className="font-medium">Stuck Tasks:</span>
            <span className="ml-2 text-warning">{stuckTasks.length}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => cleanupTasks()}
            disabled={isCleaningUp || stuckTasks.length === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isCleaningUp ? 'Cleaning...' : `Clean ${stuckTasks.length} Stuck Tasks`}
          </Button>

          <Button
            onClick={() => forceProcess()}
            disabled={isProcessing || pendingTasks.length === 0}
            size="sm"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isProcessing ? 'Processing...' : `Process ${pendingTasks.length} Tasks`}
          </Button>
        </div>

        {stuckTasks.length > 0 && (
          <div className="text-sm text-warning bg-warning/10 p-3 rounded-md">
            Warning: {stuckTasks.length} tasks have been pending for over 30 minutes. 
            These may be blocking new task creation.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
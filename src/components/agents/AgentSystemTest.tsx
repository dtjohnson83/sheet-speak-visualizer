import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useDatasets } from '@/hooks/useDatasets';
import { useToast } from '@/hooks/use-toast';
import { Zap, Trash2, PlayCircle, Database } from 'lucide-react';

export const AgentSystemTest = () => {
  const { 
    agents, 
    tasks, 
    createTask, 
    triggerProcessor, 
    clearAllTasks, 
    isTriggeringProcessor,
    isClearingAllTasks 
  } = useAIAgents();
  const { datasets } = useDatasets();
  const { toast } = useToast();

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const runningTasks = tasks.filter(task => task.status === 'running');

  const handleCreateTestTasks = async () => {
    if (activeAgents.length === 0) {
      toast({
        title: "No Active Agents",
        description: "Create and activate some agents first",
        variant: "destructive"
      });
      return;
    }

    if (datasets.length === 0) {
      toast({
        title: "No Datasets",
        description: "Upload a dataset first",
        variant: "destructive"
      });
      return;
    }

    // Create a test task for each active agent using the first dataset
    const firstDataset = datasets[0];
    for (const agent of activeAgents) {
      try {
        await createTask({
          agentId: agent.id,
          datasetId: firstDataset.id,
          taskType: 'analyze_data',
          parameters: {
            test_task: true,
            created_at: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error(`Failed to create task for agent ${agent.id}:`, error);
      }
    }

    toast({
      title: "Test Tasks Created",
      description: `Created test tasks for ${activeAgents.length} agents`,
    });
  };

  const handleClearPendingTasks = () => {
    clearAllTasks('pending');
  };

  const handleTriggerProcessor = () => {
    triggerProcessor();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Agent System Test & Recovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{activeAgents.length}</div>
            <div className="text-sm text-muted-foreground">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{pendingTasks.length}</div>
            <div className="text-sm text-muted-foreground">Pending Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{runningTasks.length}</div>
            <div className="text-sm text-muted-foreground">Running Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{datasets.length}</div>
            <div className="text-sm text-muted-foreground">Datasets</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleCreateTestTasks}
            variant="outline"
            size="sm"
            disabled={activeAgents.length === 0 || datasets.length === 0}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Create Test Tasks
          </Button>

          <Button
            onClick={handleClearPendingTasks}
            variant="outline"
            size="sm"
            disabled={pendingTasks.length === 0 || isClearingAllTasks}
            className="text-warning hover:text-warning"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Pending ({pendingTasks.length})
          </Button>

          <Button
            onClick={handleTriggerProcessor}
            variant="default"
            size="sm"
            disabled={isTriggeringProcessor}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isTriggeringProcessor ? 'Processing...' : 'Trigger Processor'}
          </Button>
        </div>

        {/* Agent Status */}
        {activeAgents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Active Agents:</h4>
            <div className="flex flex-wrap gap-2">
              {activeAgents.map(agent => (
                <Badge key={agent.id} variant="secondary" className="flex items-center gap-1">
                  <span>{agent.name}</span>
                  <span className="text-xs">({agent.type})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Datasets */}
        {datasets.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Available Datasets:</h4>
            <div className="flex flex-wrap gap-2">
              {datasets.map(dataset => (
                <Badge key={dataset.id} variant="outline" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>{dataset.file_name}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
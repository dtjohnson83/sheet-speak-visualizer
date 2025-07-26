import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useDatasets } from '@/hooks/useDatasets';
import { useToast } from '@/hooks/use-toast';
import { useAgentTaskCleanup } from '@/hooks/agents/useAgentTaskCleanup';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Trash2, PlayCircle, Database, AlertTriangle, RefreshCw, TestTube } from 'lucide-react';

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
  const { 
    clearStuckTasks, 
    clearAllTasks: forceCleanAllTasks, 
    isClearingStuckTasks,
    isClearingAllTasks: isForceClearingAllTasks 
  } = useAgentTaskCleanup();

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const runningTasks = tasks.filter(task => task.status === 'running');
  const stuckTasks = tasks.filter(task => 
    task.status === 'pending' && 
    new Date().getTime() - new Date(task.created_at).getTime() > 5 * 60 * 1000 // older than 5 minutes
  );

  // Auto-clear stuck tasks on component mount
  useEffect(() => {
    if (stuckTasks.length > 0) {
      console.log(`Found ${stuckTasks.length} stuck tasks, auto-clearing...`);
      clearStuckTasks();
    }
  }, [stuckTasks.length, clearStuckTasks]);

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

  const handleForceCleanStuckTasks = () => {
    clearStuckTasks();
  };

  const handleForceCleanAllTasks = () => {
    forceCleanAllTasks('all');
  };

  const handleTriggerProcessor = () => {
    triggerProcessor();
  };

  const handleDirectFunctionTest = async () => {
    try {
      console.log('Testing direct function call...');
      const { data, error } = await supabase.functions.invoke('ai-agent-processor', {
        body: { manual_trigger: true, test_call: true }
      });
      
      console.log('Direct function test response:', { data, error });
      
      if (error) {
        toast({
          title: "Function Test Failed",
          description: `Error: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Function Test Success",
          description: `Function is accessible and returned: ${JSON.stringify(data)}`,
        });
      }
    } catch (err) {
      console.error('Function test error:', err);
      toast({
        title: "Function Test Error",
        description: `${err.message}`,
        variant: "destructive"
      });
    }
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
        {/* Stuck Tasks Alert */}
        {stuckTasks.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {stuckTasks.length} task{stuckTasks.length > 1 ? 's have' : ' has'} been stuck for over 5 minutes. 
              This may be blocking new task creation.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={handleForceCleanStuckTasks}
                disabled={isClearingStuckTasks}
              >
                {isClearingStuckTasks ? 'Clearing...' : 'Clear Stuck Tasks'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
        <div className="space-y-3">
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
              onClick={handleTriggerProcessor}
              variant="default"
              size="sm"
              disabled={isTriggeringProcessor || stuckTasks.length > 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isTriggeringProcessor ? 'Processing...' : 'Trigger Processor'}
            </Button>

            <Button
              onClick={handleDirectFunctionTest}
              variant="outline"
              size="sm"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Function
            </Button>
          </div>

          {/* Recovery Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground">Recovery Actions:</span>
            
            <Button
              onClick={handleClearPendingTasks}
              variant="outline"
              size="sm"
              disabled={pendingTasks.length === 0 || isClearingAllTasks}
              className="text-orange-600 hover:text-orange-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Pending ({pendingTasks.length})
            </Button>

            <Button
              onClick={handleForceCleanStuckTasks}
              variant="outline"
              size="sm"
              disabled={stuckTasks.length === 0 || isClearingStuckTasks}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isClearingStuckTasks ? 'Clearing...' : `Clear Stuck (${stuckTasks.length})`}
            </Button>

            <Button
              onClick={handleForceCleanAllTasks}
              variant="outline"
              size="sm"
              disabled={tasks.length === 0 || isForceClearingAllTasks}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isForceClearingAllTasks ? 'Clearing...' : 'Clear All Tasks'}
            </Button>
          </div>
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
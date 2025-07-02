import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlayCircle, Settings, Zap, Bot, Database } from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useDatasets } from '@/hooks/useDatasets';
import { AIAgent, TaskType } from '@/types/agents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AgentTestingPanel = () => {
  const { agents, createTask, isCreatingTask } = useAIAgents();
  const { datasets } = useDatasets();
  const { toast } = useToast();
  
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>('analyze_data');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeAgents = agents.filter(agent => agent.status === 'active');

  const taskTypes: { value: TaskType; label: string; description: string }[] = [
    { value: 'analyze_data', label: 'Analyze Data', description: 'Perform statistical analysis on dataset' },
    { value: 'generate_insights', label: 'Generate Insights', description: 'AI-powered insight generation' },
    { value: 'detect_anomalies', label: 'Detect Anomalies', description: 'Find outliers and anomalies' },
    { value: 'analyze_trends', label: 'Analyze Trends', description: 'Identify patterns and trends' },
    { value: 'find_correlations', label: 'Find Correlations', description: 'Discover data relationships' },
    { value: 'create_visualization', label: 'Create Visualization', description: 'Generate chart recommendations' }
  ];

  const handleCreateTestTask = () => {
    if (!selectedAgent || !selectedDataset) {
      toast({
        title: "Missing selection",
        description: "Please select both an agent and dataset",
        variant: "destructive"
      });
      return;
    }

    createTask({
      agentId: selectedAgent,
      datasetId: selectedDataset,
      taskType: selectedTaskType,
      parameters: {
        test_task: true,
        created_manually: true,
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleTriggerProcessor = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-processor', {
        body: { manual_trigger: true }
      });

      if (error) {
        throw new Error(error.message || 'Failed to trigger processor');
      }
      
      toast({
        title: "Processor triggered",
        description: `Processed ${data?.processed || 0} tasks successfully`,
      });
    } catch (error) {
      console.error('Processor trigger error:', error);
      toast({
        title: "Failed to trigger processor",
        description: error.message || 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAllTestTasks = () => {
    if (activeAgents.length === 0 || datasets.length === 0) {
      toast({
        title: "No data available",
        description: "Need at least one active agent and one dataset",
        variant: "destructive"
      });
      return;
    }

    // Create one task for each active agent with the first dataset
    const firstDataset = datasets[0];
    activeAgents.forEach(agent => {
      createTask({
        agentId: agent.id,
        datasetId: firstDataset.id,
        taskType: agent.type === 'anomaly_detection' ? 'detect_anomalies' :
                 agent.type === 'trend_analysis' ? 'analyze_trends' :
                 agent.type === 'insight_generation' ? 'generate_insights' : 'analyze_data',
        parameters: {
          test_task: true,
          batch_created: true,
          timestamp: new Date().toISOString()
        }
      });
    });

    toast({
      title: "Test tasks created",
      description: `Created ${activeAgents.length} test tasks for all active agents`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Agent Testing Panel
        </CardTitle>
        <CardDescription>
          Create test tasks and manually trigger agent processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h4 className="font-medium">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCreateAllTestTasks}
              disabled={activeAgents.length === 0 || datasets.length === 0 || isCreatingTask}
              variant="outline"
            >
              <Bot className="h-4 w-4 mr-2" />
              Create All Test Tasks
            </Button>
            <Button
              onClick={handleTriggerProcessor}
              disabled={isProcessing}
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Trigger Processor'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Manual Task Creation */}
        <div className="space-y-4">
          <h4 className="font-medium">Create Individual Task</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {activeAgents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <span>{agent.name}</span>
                        <Badge variant="secondary" className="bg-success text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map(dataset => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      <div className="flex items-center gap-2">
                        <Database className="h-3 w-3" />
                        <span>{dataset.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({dataset.row_count} rows)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Task Type</label>
            <Select value={selectedTaskType} onValueChange={(value) => setSelectedTaskType(value as TaskType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map(task => (
                  <SelectItem key={task.value} value={task.value}>
                    <div>
                      <div className="font-medium">{task.label}</div>
                      <div className="text-xs text-muted-foreground">{task.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreateTestTask}
            disabled={!selectedAgent || !selectedDataset || isCreatingTask}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isCreatingTask ? 'Creating Task...' : 'Create Test Task'}
          </Button>
        </div>

        {/* Status */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Active Agents:</span>
              <span className="ml-2 font-medium">{activeAgents.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Available Datasets:</span>
              <span className="ml-2 font-medium">{datasets.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
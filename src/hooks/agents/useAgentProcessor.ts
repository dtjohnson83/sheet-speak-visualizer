import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/types/agents';

// Helper function to map agent types to task types
const getTaskTypeForAgent = (agentType: string): string => {
  switch (agentType) {
    case 'data_quality':
      return 'assess_data_quality';
    case 'anomaly_detection':
      return 'detect_anomalies';
    case 'trend_analysis':
      return 'analyze_trends';
    case 'predictive_analytics':
      return 'predictive_forecast';
    case 'monitoring':
      return 'analyze_data';
    case 'insight_generation':
      return 'generate_insights';
    case 'visualization':
      return 'create_visualization';
    case 'correlation_discovery':
      return 'find_correlations';
    default:
      return 'analyze_data';
  }
};

export const useAgentProcessor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create tasks for active agents with current datasets
  const createTasksForActiveAgents = async (agentId?: string, dataContext?: DataContext) => {
    if (!user?.id) throw new Error('User not authenticated');

    // Get active agents (or specific agent if provided)
    const agentsQuery = agentId 
      ? supabase.from('ai_agents').select('*').eq('id', agentId).eq('user_id', user.id)
      : supabase.from('ai_agents').select('*').eq('user_id', user.id).eq('status', 'active');

    const { data: agents, error: agentsError } = await agentsQuery;
    if (agentsError) throw agentsError;

    if (!agents || agents.length === 0) {
      throw new Error(`No ${agentId ? 'matching' : 'active'} agents found. Please create an agent first.`);
    }

    // Get available datasets
    const { data: datasets, error: datasetsError } = await supabase
      .from('saved_datasets')
      .select('id, name')
      .eq('user_id', user.id);

    if (datasetsError) throw datasetsError;

    if (!datasets || datasets.length === 0) {
      throw new Error('No datasets available for analysis');
    }

    const createdTasks = [];

    // Create tasks for each agent-dataset combination
    for (const agent of agents) {
      for (const dataset of datasets) {
        const taskType = getTaskTypeForAgent(agent.type);
        
        const taskData = {
          agent_id: agent.id,
          dataset_id: dataset.id,
          task_type: taskType,
          parameters: {
            manual_trigger: true,
            triggered_by: user.id,
            trigger_source: agentId ? 'manual_single' : 'manual_batch',
            timestamp: new Date().toISOString(),
            dataset_name: dataset.name,
            agent_name: agent.name,
            ...(dataContext && { data_context: dataContext as any })
          } as any
        };

        const { data: task, error: taskError } = await supabase
          .from('agent_tasks')
          .insert(taskData)
          .select()
          .single();

        if (taskError) {
          console.error('Failed to create task:', taskError);
          continue;
        }

        createdTasks.push(task);
      }
    }

    return createdTasks;
  };

  // Trigger processor mutation with task creation
  const triggerProcessorMutation = useMutation({
    mutationFn: async ({ agentId, dataContext }: { agentId?: string; dataContext?: DataContext } = {}) => {
      // First create tasks for active agents
      const createdTasks = await createTasksForActiveAgents(agentId, dataContext);
      
      if (createdTasks.length === 0) {
        throw new Error('No tasks could be created');
      }

      // Wait a moment for tasks to be inserted
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Then trigger the processor
      const body = {
        manual_trigger: true,
        created_tasks: createdTasks.length,
        ...(dataContext && { data_context: dataContext })
      };

      const response = await supabase.functions.invoke('ai-agent-processor', {
        body
      });

      if (response.error) throw response.error;
      
      return {
        ...response.data,
        tasks_created: createdTasks.length,
        task_ids: createdTasks.map(t => t.id)
      };
    },
    onSuccess: (data) => {
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agent-insights', user?.id] });
      
      const tasksCreated = data?.tasks_created || 0;
      const tasksProcessed = data?.processed || 0;
      
      toast({
        title: "Agent processing complete",
        description: `Created ${tasksCreated} tasks and processed ${tasksProcessed} tasks successfully`,
      });
    },
    onError: (error) => {
      const isNoAgentsError = error.message.includes('No') && error.message.includes('agents');
      toast({
        title: isNoAgentsError ? "No agents configured" : "Failed to trigger processor",
        description: isNoAgentsError 
          ? "Create an AI agent first to start processing data." 
          : error.message,
        variant: "destructive",
      });
    },
  });

  return {
    triggerProcessor: (agentId?: string, dataContext?: DataContext) => 
      triggerProcessorMutation.mutate({ agentId, dataContext }),
    isTriggeringProcessor: triggerProcessorMutation.isPending,
  };
};
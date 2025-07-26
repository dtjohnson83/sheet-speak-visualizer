import { useRef } from 'react';
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
  
  // Track last trigger time for cooldown
  const lastTriggerRef = useRef<number>(0);
  const COOLDOWN_MS = 10000; // 10 second cooldown

  // Create tasks for active agents with current datasets - with deduplication
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

    // Get all datasets first to check availability
    const { data: allDatasets, error: allDatasetsError } = await supabase
      .from('saved_datasets')
      .select('id, name')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (allDatasetsError) throw allDatasetsError;

    if (!allDatasets || allDatasets.length === 0) {
      throw new Error('No datasets available for analysis');
    }

    const createdTasks = [];
    const maxTasksPerAgent = agentId ? 5 : 2; // Limit tasks per agent
    let totalAvailableDatasets = 0;
    let totalPendingTasks = 0;

    // Create tasks for each agent
    for (const agent of agents) {
      let tasksCreatedForAgent = 0;
      const taskType = getTaskTypeForAgent(agent.type);
      
      // Get datasets that DON'T have pending tasks for this agent
      const { data: availableDatasets, error: availableDatasetsError } = await supabase
        .from('saved_datasets')
        .select('id, name')
        .eq('user_id', user.id)
        .not('id', 'in', `(
          SELECT dataset_id FROM agent_tasks 
          WHERE agent_id = '${agent.id}' 
          AND task_type = '${taskType}' 
          AND status = 'pending'
        )`)
        .order('updated_at', { ascending: false })
        .limit(maxTasksPerAgent);

      if (availableDatasetsError) {
        console.error('Error fetching available datasets:', availableDatasetsError);
        continue;
      }

      // Count pending tasks for this agent for logging
      const { count: pendingCount } = await supabase
        .from('agent_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id)
        .eq('task_type', taskType)
        .eq('status', 'pending');

      totalPendingTasks += pendingCount || 0;
      totalAvailableDatasets += availableDatasets?.length || 0;

      console.log(`Agent ${agent.name}: ${availableDatasets?.length || 0} datasets available, ${pendingCount || 0} pending tasks`);

      if (!availableDatasets || availableDatasets.length === 0) {
        console.log(`No available datasets for agent ${agent.name} (all have pending tasks)`);
        continue;
      }

      // Create tasks for available datasets
      for (const dataset of availableDatasets) {
        if (tasksCreatedForAgent >= maxTasksPerAgent) break;
        
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
          if (taskError.code === '23505') { // Unique constraint violation
            console.log(`Duplicate task prevented for agent ${agent.name} on dataset ${dataset.name}`);
            continue;
          }
          console.error('Failed to create task:', taskError);
          continue;
        }

        createdTasks.push(task);
        tasksCreatedForAgent++;
      }
    }

    // Add detailed logging for debugging
    console.log(`Task creation summary: ${createdTasks.length} tasks created, ${totalAvailableDatasets} total available datasets, ${totalPendingTasks} pending tasks`);
    
    // Enhanced error information if no tasks were created
    if (createdTasks.length === 0) {
      const errorDetails = {
        total_datasets: allDatasets.length,
        total_agents: agents.length,
        pending_tasks: totalPendingTasks,
        available_combinations: totalAvailableDatasets
      };
      
      console.log('No tasks created - details:', errorDetails);
      
      if (totalPendingTasks > 0) {
        throw new Error(`All ${agents.length} agent${agents.length > 1 ? 's have' : ' has'} pending tasks (${totalPendingTasks} total). Clear pending tasks or wait for completion before creating new ones.`);
      } else if (agents.length === 0) {
        throw new Error('No agents found. Create an AI agent first to start analysis.');
      } else {
        throw new Error(`No tasks could be created. Verify you have active agents and available datasets.`);
      }
    }

    return createdTasks;
  };

  // Trigger processor mutation with task creation and cooldown
  const triggerProcessorMutation = useMutation({
    mutationFn: async ({ agentId, dataContext }: { agentId?: string; dataContext?: DataContext } = {}) => {
      // Check cooldown to prevent rapid re-triggering
      const now = Date.now();
      if (now - lastTriggerRef.current < COOLDOWN_MS) {
        const remainingCooldown = Math.ceil((COOLDOWN_MS - (now - lastTriggerRef.current)) / 1000);
        throw new Error(`Please wait ${remainingCooldown} seconds before triggering again`);
      }
      
      // Update last trigger time
      lastTriggerRef.current = now;
      
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
      const isPendingTasksError = error.message.includes('pending tasks');
      const isNoAgentsError = error.message.includes('No agents found');
      const isCooldownError = error.message.includes('wait') && error.message.includes('seconds');
      
      let title = "Processing failed";
      let description = error.message;
      
      if (isPendingTasksError) {
        title = "All agents busy";
        description = error.message + " Go to the Tasks tab to manage pending tasks.";
      } else if (isNoAgentsError) {
        title = "No agents available";
        description = "Create an AI agent first from the Create tab.";
      } else if (isCooldownError) {
        title = "Too many requests";
        description = error.message;
      }
      
      toast({
        title,
        description,
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
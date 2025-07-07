import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AgentTask, TaskType } from '@/types/agents';

export const useAgentTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch agent tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['agent-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('agent_tasks')
        .select(`
          *,
          ai_agents!inner(user_id)
        `)
        .eq('ai_agents.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data.map(task => ({
        ...task,
        ai_agents: undefined
      })) as AgentTask[];
    },
    enabled: !!user?.id,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async ({
      agentId,
      datasetId,
      taskType,
      parameters
    }: {
      agentId: string;
      datasetId?: string;
      taskType: TaskType;
      parameters: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('agent_tasks')
        .insert({
          agent_id: agentId,
          dataset_id: datasetId,
          task_type: taskType,
          parameters: parameters as any
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', user?.id] });
      toast({
        title: "Task created",
        description: "Agent task has been scheduled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('agent_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', user?.id] });
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    isLoading: tasksLoading,
    createTask: createTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
};
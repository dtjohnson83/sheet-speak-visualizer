import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AIAgent, AgentTask, AgentInsight, AgentActivityLog, AgentSummary, AgentType, TaskType } from '@/types/agents';

export const useAIAgents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all user's agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['ai-agents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIAgent[];
    },
    enabled: !!user?.id,
  });

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

  // Fetch agent insights
  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['agent-insights', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('agent_insights')
        .select(`
          *,
          ai_agents!inner(user_id)
        `)
        .eq('ai_agents.user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data.map(insight => ({
        ...insight,
        ai_agents: undefined
      })) as AgentInsight[];
    },
    enabled: !!user?.id,
  });

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async ({
      name,
      type,
      description,
      capabilities,
      configuration
    }: {
      name: string;
      type: AgentType;
      description?: string;
      capabilities: string[];
      configuration: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_agents')
        .insert({
          user_id: user.id,
          name,
          type,
          description,
          capabilities: capabilities as any,
          configuration: configuration as any
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents', user?.id] });
      toast({
        title: "Agent created",
        description: "Your AI agent has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create agent",
        description: error.message,
        variant: "destructive",
      });
    },
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

  // Update agent status mutation
  const updateAgentStatusMutation = useMutation({
    mutationFn: async ({ agentId, status }: { agentId: string; status: string }) => {
      const { data, error } = await supabase
        .from('ai_agents')
        .update({ status, last_active: new Date().toISOString() })
        .eq('id', agentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents', user?.id] });
    },
  });

  // Mark insight as read mutation
  const markInsightReadMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const { data, error } = await supabase
        .from('agent_insights')
        .update({ is_read: true })
        .eq('id', insightId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-insights', user?.id] });
    },
  });

  // Generate agent summary
  const getAgentSummary = (): AgentSummary => {
    const activeAgents = agents.filter(agent => agent.status === 'active');
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const completedTasksToday = tasks.filter(task => 
      task.status === 'completed' && 
      new Date(task.completed_at || '').toDateString() === new Date().toDateString()
    );
    const unreadInsights = insights.filter(insight => !insight.is_read);
    const lastActivity = tasks.length > 0 ? tasks[0].updated_at : undefined;

    return {
      total_agents: agents.length,
      active_agents: activeAgents.length,
      pending_tasks: pendingTasks.length,
      completed_tasks_today: completedTasksToday.length,
      unread_insights: unreadInsights.length,
      last_activity: lastActivity
    };
  };

  return {
    agents,
    tasks,
    insights,
    agentSummary: getAgentSummary(),
    isLoading: agentsLoading || tasksLoading || insightsLoading,
    createAgent: createAgentMutation.mutate,
    createTask: createTaskMutation.mutate,
    updateAgentStatus: updateAgentStatusMutation.mutate,
    markInsightRead: markInsightReadMutation.mutate,
    isCreatingAgent: createAgentMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
  };
};
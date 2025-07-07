import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AIAgent, AgentType } from '@/types/agents';

export const useAgents = () => {
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

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;
      return agentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agent-insights', user?.id] });
      toast({
        title: "Agent deleted",
        description: "The agent and all related data have been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete agent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete all agents mutation
  const deleteAllAgentsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agent-insights', user?.id] });
      toast({
        title: "All agents deleted",
        description: "All agents and related data have been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete agents",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    agents,
    isLoading: agentsLoading,
    createAgent: createAgentMutation.mutate,
    updateAgentStatus: updateAgentStatusMutation.mutate,
    deleteAgent: deleteAgentMutation.mutate,
    deleteAllAgents: deleteAllAgentsMutation.mutate,
    isCreatingAgent: createAgentMutation.isPending,
    isDeletingAgent: deleteAgentMutation.isPending,
    isDeletingAllAgents: deleteAllAgentsMutation.isPending,
  };
};
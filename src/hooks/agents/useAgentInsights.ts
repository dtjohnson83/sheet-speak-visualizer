import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AgentInsight } from '@/types/agents';

export const useAgentInsights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Delete insight mutation
  const deleteInsightMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('agent_insights')
        .delete()
        .eq('id', insightId);

      if (error) throw error;
      return insightId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-insights', user?.id] });
      toast({
        title: "Insight deleted",
        description: "The insight has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete insight",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear all insights mutation
  const clearAllInsightsMutation = useMutation({
    mutationFn: async (type?: 'read' | 'all') => {
      if (!user?.id) return;
      
      let query = supabase
        .from('agent_insights')
        .delete()
        .in('agent_id', agents.map(agent => agent.id));

      if (type === 'read') {
        query = query.eq('is_read', true);
      }

      const { error } = await query;
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-insights', user?.id] });
      toast({
        title: "Insights cleared",
        description: "Selected insights have been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to clear insights",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get agents from cache for bulk operations
  const agents = queryClient.getQueryData(['ai-agents', user?.id]) as any[] || [];

  return {
    insights,
    isLoading: insightsLoading,
    markInsightRead: markInsightReadMutation.mutate,
    deleteInsight: deleteInsightMutation.mutate,
    clearAllInsights: clearAllInsightsMutation.mutate,
    isDeletingInsight: deleteInsightMutation.isPending,
    isClearingAllInsights: clearAllInsightsMutation.isPending,
  };
};
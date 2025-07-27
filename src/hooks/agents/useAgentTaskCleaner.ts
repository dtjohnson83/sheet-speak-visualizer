import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAgentTaskCleaner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Clean up all stuck/old tasks
  const cleanupTasksMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // First get user's agent IDs
      const { data: userAgents } = await supabase
        .from('ai_agents')
        .select('id')
        .eq('user_id', user.id);

      if (!userAgents || userAgents.length === 0) {
        return [];
      }

      const agentIds = userAgents.map(agent => agent.id);

      // Clean up old pending tasks (older than 30 minutes)
      const { data: cleanedTasks, error } = await supabase
        .from('agent_tasks')
        .update({ 
          status: 'failed',
          error_message: 'Automatically cleaned up - task was stuck for >30 minutes',
          completed_at: new Date().toISOString()
        })
        .in('agent_id', agentIds)
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .select('id');

      if (error) throw error;
      return cleanedTasks || [];
    },
    onSuccess: (cleanedTasks) => {
      queryClient.invalidateQueries({ queryKey: ['agent-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      
      toast({
        title: "Tasks Cleaned",
        description: `Cleaned up ${cleanedTasks.length} stuck tasks`,
      });
    },
    onError: (error) => {
      toast({
        title: "Cleanup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Force process tasks
  const forceProcessMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-agent-processor', {
        body: { 
          force_process: true, 
          source: 'manual_cleanup',
          user_id: user?.id 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agent-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['agent-insights'] });
      
      toast({
        title: "Processing Started",
        description: data?.message || "AI agent processor has been triggered",
      });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    cleanupTasks: cleanupTasksMutation.mutate,
    forceProcess: forceProcessMutation.mutate,
    isCleaningUp: cleanupTasksMutation.isPending,
    isProcessing: forceProcessMutation.isPending,
  };
};
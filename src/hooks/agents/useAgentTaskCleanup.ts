import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAgentTaskCleanup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const clearStuckTasksMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('agent_tasks')
        .update({ 
          status: 'failed',
          error_message: 'Manually cleared - was stuck',
          completed_at: new Date().toISOString()
        })
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Older than 5 minutes
        .select('id');

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agent-tasks'] });
      toast({
        title: "Tasks Cleared",
        description: `Cleared ${data?.length || 0} stuck tasks`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to clear tasks: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const clearAllTasksMutation = useMutation({
    mutationFn: async (status?: 'pending' | 'failed' | 'completed' | 'all') => {
      if (status && status !== 'all') {
        const { error } = await supabase.from('agent_tasks').delete().eq('status', status);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('agent_tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tasks'] });
      toast({
        title: "Tasks Cleared",
        description: "All selected tasks have been cleared",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to clear tasks: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    clearStuckTasks: clearStuckTasksMutation.mutate,
    clearAllTasks: clearAllTasksMutation.mutate,
    isClearingStuckTasks: clearStuckTasksMutation.isPending,
    isClearingAllTasks: clearAllTasksMutation.isPending,
  };
};
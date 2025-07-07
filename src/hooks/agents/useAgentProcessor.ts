import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAgentProcessor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Trigger processor mutation
  const triggerProcessorMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('ai-agent-processor', {
        body: { manual_trigger: true }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agent-insights', user?.id] });
      
      toast({
        title: "Agent processor triggered",
        description: `Processed ${data?.processed || 0} tasks`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to trigger processor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    triggerProcessor: triggerProcessorMutation.mutate,
    isTriggeringProcessor: triggerProcessorMutation.isPending,
  };
};
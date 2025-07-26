import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DataContext } from '@/types/agents';

export const useAgentProcessor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Trigger processor mutation with optional data context
  const triggerProcessorMutation = useMutation({
    mutationFn: async (dataContext?: DataContext) => {
      const body = dataContext 
        ? { 
            manual_trigger: true, 
            data_context: dataContext 
          }
        : { manual_trigger: true };

      const response = await supabase.functions.invoke('ai-agent-processor', {
        body
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
    triggerProcessor: (dataContext?: DataContext) => triggerProcessorMutation.mutate(dataContext),
    isTriggeringProcessor: triggerProcessorMutation.isPending,
  };
};
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAgentTaskCleaner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Enhanced cleanup tasks mutation with better error handling
  const cleanupTasksMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get user's agents
      const { data: agents, error: agentsError } = await supabase
        .from('ai_agents')
        .select('id')
        .eq('user_id', user.id);

      if (agentsError) throw agentsError;

      if (!agents || agents.length === 0) {
        return { cleaned: 0, message: "No agents found" };
      }

      const agentIds = agents.map(agent => agent.id);

      // Update stuck tasks (pending for more than 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const { data: stuckTasks, error: selectError } = await supabase
        .from('agent_tasks')
        .select('id')
        .in('agent_id', agentIds)
        .eq('status', 'pending')
        .lt('created_at', thirtyMinutesAgo.toISOString());

      if (selectError) throw selectError;

      if (!stuckTasks || stuckTasks.length === 0) {
        return { cleaned: 0, message: "No stuck tasks found" };
      }

      const { error: updateError } = await supabase
        .from('agent_tasks')
        .update({
          status: 'failed',
          error_message: 'Task was stuck in pending state for over 30 minutes and was automatically cleaned up',
          updated_at: new Date().toISOString()
        })
        .in('id', stuckTasks.map(task => task.id));

      if (updateError) throw updateError;

      return { cleaned: stuckTasks.length, message: `Cleaned ${stuckTasks.length} stuck tasks` };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['agent-tasks'] });
      toast({
        title: "Tasks Cleaned",
        description: result.message,
      });
    },
    onError: (error) => {
      console.error('Error cleaning tasks:', error);
      toast({
        title: "Cleanup Failed",
        description: `Failed to clean tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // Enhanced force process mutation with better error handling
  const forceProcessMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if there are any agents
      const { data: agents, error: agentsError } = await supabase
        .from('ai_agents')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (agentsError) throw agentsError;

      if (!agents || agents.length === 0) {
        throw new Error("No active agents found. Please create and activate an agent first.");
      }

      // Check if there are any datasets
      const { data: datasets, error: datasetsError } = await supabase
        .from('saved_datasets')
        .select('id')
        .eq('user_id', user.id);

      if (datasetsError) throw datasetsError;

      if (!datasets || datasets.length === 0) {
        throw new Error("No datasets found. Please upload a dataset first.");
      }

      // Invoke the processor with force processing
      const { data, error } = await supabase.functions.invoke('ai-agent-processor', {
        body: { force_process: true }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['agent-insights'] });
      toast({
        title: "Processing Triggered",
        description: "Agent processing has been manually triggered",
      });
    },
    onError: (error) => {
      console.error('Error forcing process:', error);
      toast({
        title: "Processing Failed",
        description: `Failed to trigger processing: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const cleanupTasks = () => cleanupTasksMutation.mutate();
  const forceProcess = () => forceProcessMutation.mutate();
  const isCleaningUp = cleanupTasksMutation.isPending;
  const isProcessing = forceProcessMutation.isPending;

  return {
    cleanupTasks,
    forceProcess,
    isCleaningUp,
    isProcessing,
  };
};

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface SavedDataset {
  id: string;
  name: string;
  description?: string;
  file_name: string;
  worksheet_name?: string;
  data: DataRow[];
  columns: ColumnInfo[];
  row_count: number;
  created_at: string;
  updated_at: string;
}

export const useDatasets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ['datasets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('saved_datasets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the Json fields back to their proper types
      return data.map(item => ({
        ...item,
        data: item.data as unknown as DataRow[],
        columns: item.columns as unknown as ColumnInfo[]
      })) as SavedDataset[];
    },
    enabled: !!user?.id,
  });

  const saveDatasetMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      fileName,
      worksheetName,
      data,
      columns
    }: {
      name: string;
      description?: string;
      fileName: string;
      worksheetName?: string;
      data: DataRow[];
      columns: ColumnInfo[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('saved_datasets')
        .insert({
          user_id: user.id,
          name,
          description,
          file_name: fileName,
          worksheet_name: worksheetName,
          data: data as any, // Cast to any for Json compatibility
          columns: columns as any, // Cast to any for Json compatibility
          row_count: data.length
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets', user?.id] });
      toast({
        title: "Dataset saved successfully",
        description: "Your dataset has been saved and can be accessed later.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save dataset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDatasetMutation = useMutation({
    mutationFn: async (datasetId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First, find all agents associated with this dataset
      const { data: agents, error: agentsError } = await supabase
        .from('ai_agents')
        .select('id, configuration')
        .eq('user_id', user.id);

      if (agentsError) throw agentsError;

      // Filter agents that are configured for this dataset
      const associatedAgents = agents?.filter(agent => {
        const configuration = agent.configuration as any;
        const dataContext = configuration?.dataContext;
        return dataContext && (
          dataContext.datasetId === datasetId || 
          // For legacy agents that don't have datasetId, check by fileName
          (!dataContext.datasetId && dataContext.fileName)
        );
      }) || [];

      // Delete associated agents first
      if (associatedAgents.length > 0) {
        const agentIds = associatedAgents.map(agent => agent.id);
        const { error: deleteAgentsError } = await supabase
          .from('ai_agents')
          .delete()
          .in('id', agentIds);

        if (deleteAgentsError) throw deleteAgentsError;
      }

      // Then delete the dataset
      const { error } = await supabase
        .from('saved_datasets')
        .delete()
        .eq('id', datasetId)
        .eq('user_id', user.id); // Extra security check

      if (error) throw error;

      return { datasetId, deletedAgents: associatedAgents.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agent-insights', user?.id] });
      
      const message = result.deletedAgents > 0 
        ? `Dataset deleted along with ${result.deletedAgents} associated agent${result.deletedAgents > 1 ? 's' : ''}.`
        : "Dataset deleted successfully.";
      
      toast({
        title: "Dataset deleted",
        description: message,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete dataset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    datasets,
    isLoading,
    saveDataset: saveDatasetMutation.mutate,
    deleteDataset: deleteDatasetMutation.mutate,
    isSaving: saveDatasetMutation.isPending,
    isDeleting: deleteDatasetMutation.isPending,
  };
};

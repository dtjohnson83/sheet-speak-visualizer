
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
      return data as SavedDataset[];
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
          data: data,
          columns: columns,
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
      const { error } = await supabase
        .from('saved_datasets')
        .delete()
        .eq('id', datasetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets', user?.id] });
      toast({
        title: "Dataset deleted",
        description: "The dataset has been removed.",
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

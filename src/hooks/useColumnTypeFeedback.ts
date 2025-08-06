import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ColumnTypeFeedback {
  id: string;
  user_id: string;
  column_name: string;
  original_type: string;
  corrected_type: string;
  column_context: {
    sample_values?: string[];
    column_pattern?: string;
    dataset_context?: string;
  };
  dataset_name?: string;
  confidence_score: number;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export const useColumnTypeFeedback = () => {
  const queryClient = useQueryClient();

  // Fetch user's feedback history
  const { data: feedbackHistory, isLoading } = useQuery({
    queryKey: ['column-type-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('column_type_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ColumnTypeFeedback[];
    },
  });

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async ({
      columnName,
      originalType,
      correctedType,
      sampleValues,
      datasetName,
    }: {
      columnName: string;
      originalType: string;
      correctedType: string;
      sampleValues?: string[];
      datasetName?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const columnContext = {
        sample_values: sampleValues,
        column_pattern: columnName.toLowerCase(),
        dataset_context: datasetName,
      };

      const { data, error } = await supabase
        .from('column_type_feedback')
        .insert({
          user_id: user.id,
          column_name: columnName,
          original_type: originalType,
          corrected_type: correctedType,
          column_context: columnContext,
          dataset_name: datasetName,
          confidence_score: 1.0, // User corrections are high confidence
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-type-feedback'] });
      toast.success('Feedback recorded - helping improve future classifications');
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to record feedback');
    },
  });

  // Get feedback for a specific column
  const getFeedbackForColumn = (columnName: string) => {
    return feedbackHistory?.filter(feedback => 
      feedback.column_name.toLowerCase() === columnName.toLowerCase()
    ) || [];
  };

  return {
    feedbackHistory,
    isLoading,
    submitFeedback: submitFeedback.mutate,
    isSubmitting: submitFeedback.isPending,
    getFeedbackForColumn,
  };
};
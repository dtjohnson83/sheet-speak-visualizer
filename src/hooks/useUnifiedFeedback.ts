import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UnifiedFeedbackData {
  id: string;
  user_id: string;
  feedback_type_id: string;
  feature_context: any;
  feedback_data: any;
  rating?: number;
  feedback_text?: string;
  is_processed: boolean;
  confidence_score: number;
  session_id?: string;
  created_at: string;
  updated_at: string;
  feedback_types?: {
    type_name: string;
    description?: string;
  };
}

export interface FeedbackType {
  id: string;
  type_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export const useUnifiedFeedback = () => {
  const queryClient = useQueryClient();

  // Fetch feedback types
  const { data: feedbackTypes } = useQuery({
    queryKey: ['feedback-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_types')
        .select('*')
        .eq('is_active', true)
        .order('type_name');

      if (error) throw error;
      return data as FeedbackType[];
    },
  });

  // Fetch user's feedback history
  const { data: feedbackHistory, isLoading } = useQuery({
    queryKey: ['unified-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_feedback')
        .select(`
          *,
          feedback_types (
            type_name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UnifiedFeedbackData[];
    },
  });

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async ({
      feedbackTypeId,
      featureContext,
      feedbackData,
      rating,
      feedbackText,
      sessionId,
    }: {
      feedbackTypeId: string;
      featureContext: any;
      feedbackData: any;
      rating?: number;
      feedbackText?: string;
      sessionId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          feedback_type_id: feedbackTypeId,
          feature_context: featureContext,
          feedback_data: feedbackData,
          rating,
          feedback_text: feedbackText,
          session_id: sessionId,
          confidence_score: 1.0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-feedback'] });
      toast.success('Feedback recorded successfully');
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to record feedback');
    },
  });

  // Get feedback type by name
  const getFeedbackTypeByName = (typeName: string) => {
    return feedbackTypes?.find(type => type.type_name === typeName);
  };

  // Get feedback by type  
  const getFeedbackByType = (typeName: string) => {
    return feedbackHistory?.filter(feedback => {
      const feedbackType = feedback.feedback_types as any;
      return feedbackType?.type_name === typeName;
    }) || [];
  };

  return {
    feedbackTypes,
    feedbackHistory,
    isLoading,
    submitFeedback: submitFeedback.mutate,
    isSubmitting: submitFeedback.isPending,
    getFeedbackTypeByName,
    getFeedbackByType,
  };
};
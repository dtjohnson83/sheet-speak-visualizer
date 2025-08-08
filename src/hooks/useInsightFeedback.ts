import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InsightFeedbackData {
  id: string;
  user_id: string;
  insight_type: string;
  original_insight: any;
  user_rating?: number;
  accuracy_rating?: number;
  usefulness_rating?: number;
  feedback_text?: string;
  suggested_improvement?: string;
  data_context?: any;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export const useInsightFeedback = () => {
  const queryClient = useQueryClient();

  // Fetch insight feedback history
  const { data: insightFeedback, isLoading } = useQuery({
    queryKey: ['insight-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insight_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InsightFeedbackData[];
    },
  });

  // Submit insight feedback mutation
  const submitInsightFeedback = useMutation({
    mutationFn: async ({
      insightType,
      originalInsight,
      userRating,
      accuracyRating,
      usefulnessRating,
      feedbackText,
      suggestedImprovement,
      dataContext,
    }: {
      insightType: string;
      originalInsight: any;
      userRating?: number;
      accuracyRating?: number;
      usefulnessRating?: number;
      feedbackText?: string;
      suggestedImprovement?: string;
      dataContext?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('insight_feedback')
        .insert({
          user_id: user.id,
          insight_type: insightType,
          original_insight: originalInsight,
          user_rating: userRating,
          accuracy_rating: accuracyRating,
          usefulness_rating: usefulnessRating,
          feedback_text: feedbackText,
          suggested_improvement: suggestedImprovement,
          data_context: dataContext,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insight-feedback'] });
      toast.success('Insight feedback recorded');
    },
    onError: (error) => {
      console.error('Error submitting insight feedback:', error);
      toast.error('Failed to record insight feedback');
    },
  });

  return {
    insightFeedback,
    isLoading,
    submitInsightFeedback: submitInsightFeedback.mutate,
    isSubmitting: submitInsightFeedback.isPending,
  };
};
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChartFeedbackData {
  id: string;
  user_id: string;
  chart_suggestion: any;
  user_correction?: any;
  rating?: number;
  feedback_text?: string;
  chart_type: string;
  data_context?: any;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export const useChartFeedback = () => {
  const queryClient = useQueryClient();

  // Fetch chart feedback history
  const { data: chartFeedback, isLoading } = useQuery({
    queryKey: ['chart-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ChartFeedbackData[];
    },
  });

  // Submit chart feedback mutation
  const submitChartFeedback = useMutation({
    mutationFn: async ({
      chartSuggestion,
      userCorrection,
      rating,
      feedbackText,
      chartType,
      dataContext,
    }: {
      chartSuggestion: any;
      userCorrection?: any;
      rating?: number;
      feedbackText?: string;
      chartType: string;
      dataContext?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chart_feedback')
        .insert({
          user_id: user.id,
          chart_suggestion: chartSuggestion,
          user_correction: userCorrection,
          rating,
          feedback_text: feedbackText,
          chart_type: chartType,
          data_context: dataContext,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-feedback'] });
      toast.success('Chart feedback recorded');
    },
    onError: (error) => {
      console.error('Error submitting chart feedback:', error);
      toast.error('Failed to record chart feedback');
    },
  });

  return {
    chartFeedback,
    isLoading,
    submitChartFeedback: submitChartFeedback.mutate,
    isSubmitting: submitChartFeedback.isPending,
  };
};
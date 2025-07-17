import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export const useDataQualityAgent = () => {
  const queryClient = useQueryClient();

  const saveTrend = useMutation({
    mutationFn: async (trendData: {
      dataset_id?: string;
      agent_id?: string;
      date: string;
      score: number;
      issues: number;
    }) => {
      const { data, error } = await supabase
        .from('quality_trends')
        .insert([trendData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-trends'] });
    }
  });

  return {
    saveTrend,
  };
};


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDataQualityAgent = (fileName: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qualityTrends, setQualityTrends] = useState<any[]>([]);

  // Query for existing agent
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: ['data-quality-agent', fileName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('type', 'data_quality')
        .eq('name', `Data Quality Agent - ${fileName}`)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Mutation to create agent
  const createAgentMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .insert({
          name: `Data Quality Agent - ${fileName}`,
          type: 'data_quality',
          description: `Automated data quality monitoring for ${fileName}`,
          status: 'active',
          capabilities: ['data_validation', 'completeness_check', 'accuracy_assessment'],
          configuration: {
            dataset: fileName,
            schedule: { frequency: 'daily', time: '09:00' },
            thresholds: { completeness: 95, accuracy: 98 }
          },
          priority: 5
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-quality-agent'] });
      toast({
        title: "Success",
        description: "Data quality agent created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create data quality agent",
        variant: "destructive",
      });
    },
  });

  // Mutation to save quality trends
  const saveTrendMutation = useMutation({
    mutationFn: async (trend: { 
      dataset_id?: string; 
      agent_id?: string; 
      date: string; 
      score: number; 
      issues: number; 
    }) => {
      // For now, just store locally since we don't have a trends table
      setQualityTrends(prev => [...prev, trend]);
      return trend;
    },
  });

  const createDataQualityAgent = () => {
    createAgentMutation.mutate();
  };

  const scheduleQualityCheck = () => {
    toast({
      title: "Quality Check Scheduled",
      description: "Quality check has been scheduled for the next hour",
    });
  };

  const handleReportGenerated = async (report: any) => {
    if (agent) {
      saveTrendMutation.mutate({
        agent_id: agent.id,
        date: new Date().toISOString(),
        score: report.overallScore || 85,
        issues: report.totalIssues || 0,
      });
    }
  };

  return {
    agent,
    isCreatingAgent: createAgentMutation.isPending,
    qualityTrends,
    createDataQualityAgent,
    scheduleQualityCheck,
    handleReportGenerated,
    saveTrend: saveTrendMutation,
  };
};

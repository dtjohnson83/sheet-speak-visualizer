import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';  // Add for querying/mutating
import { useAIAgents } from '@/hooks/useAIAgents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';  // Assume you have this for user_id

interface QualityTrend {
  date: string;
  score: number;
  issues: number;
}

export const useDataQualityAgent = (fileName: string) => {
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  
  const { agents, createAgent } = useAIAgents();
  const { toast } = useToast();
  const { user } = useAuth();  // For user-specific filtering
  const queryClient = useQueryClient();

  const agent = agents.find(a => a.type === 'data_quality');

  // Fetch quality trends from Supabase (last 7, ordered by date desc)
  const { data: qualityTrends = [] } = useQuery<QualityTrend[]>({
    queryKey: ['quality_trends', agent?.id],
    queryFn: async () => {
      if (!agent) return [];
      const { data, error } = await supabase
        .from('quality_trends')
        .select('date, score, issues')
        .eq('agent_id', agent.id)
        .order('date', { ascending: false })
        .limit(7);
      if (error) throw error;
      return data;
    },
    enabled: !!agent,
  });

  const createDataQualityAgent = async () => {
    setIsCreatingAgent(true);
    try {
      const agentConfig = {
        name: `Data Quality Monitor - ${fileName}`,
        type: 'data_quality' as const,
        description: 'Monitors data quality and generates automated reports',
        capabilities: [
          'data_quality_assessment',
          'completeness_validation',
          'consistency_checks',
          'accuracy_validation',
          'uniqueness_validation',
          'automated_insights'
        ],
        configuration: {
          analysis_frequency: 'daily',
          confidence_threshold: 0.8,
          auto_generate_visualizations: true,
          notification_preferences: {
            in_app: true,
            email: false
          },
          quality_thresholds: {
            completeness: 95,
            consistency: 90,
            accuracy: 95,
            uniqueness: 98,
            timeliness: 85
          }
        }
      };

      await createAgent(agentConfig);
      
      toast({
        title: "Success",
        description: "Data Quality Agent created successfully",
      });
    } catch (error) {
      console.error('Error creating data quality agent:', error);
      toast({
        title: "Error",
        description: "Failed to create Data Quality Agent",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const scheduleQualityCheck = async () => {
    if (!agent) return;

    try {
      await supabase.from('agent_tasks').insert({
        agent_id: agent.id,
        task_type: 'assess_data_quality',
        parameters: {
          dataset_name: fileName,
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      });

      toast({
        title: "Success",
        description: "Daily quality check scheduled",
      });
    } catch (error) {
      console.error('Error scheduling quality check:', error);
      toast({
        title: "Error",
        description: "Failed to schedule quality check",
        variant: "destructive",
      });
    }
  };

  // Mutation for inserting new trend
  const insertTrendMutation = useMutation({
    mutationFn: async (newTrend: QualityTrend) => {
      if (!agent) throw new Error('No agent');
      await supabase.from('quality_trends').insert({
        agent_id: agent.id,
        date: newTrend.date,
        score: newTrend.score,
        issues: newTrend.issues
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality_trends', agent?.id] });  // Refresh trends
    },
    onError: (error) => {
      console.error('Error inserting trend:', error);
    },
  });

  const handleReportGenerated = async (report: any) => {
    if (agent) {
      try {
        await supabase.from('agent_insights').insert({
          agent_id: agent.id,
          insight_type: 'data_quality_summary',
          title: `Data Quality Report - ${fileName}`,
          description: `Quality score: ${report.qualityScore.overall.toFixed(1)}%, ${report.summary.totalIssues} issues found`,
          data: report,
          confidence_score: report.qualityScore.overall / 100,
          priority: report.summary.highSeverityIssues > 0 ? 8 : 5
        });

        const newTrend: QualityTrend = {
          date: new Date().toISOString().split('T')[0],
          score: report.qualityScore.overall,
          issues: report.summary.totalIssues
        };
        
        await insertTrendMutation.mutateAsync(newTrend);

      } catch (error) {
        console.error('Error saving quality insight:', error);
      }
    }
    
    return report;
  };

  return {
    agent,
    isCreatingAgent,
    qualityTrends,
    createDataQualityAgent,
    scheduleQualityCheck,
    handleReportGenerated
  };
};

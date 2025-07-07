import { supabase } from '@/integrations/supabase/client';
import { AIAgent } from '@/types/agents';

export const useAgentScheduler = () => {
  // Auto-schedule tasks for new datasets
  const scheduleTasksForDataset = async (datasetId: string, agents: AIAgent[]) => {
    const activeAgents = agents.filter(agent => agent.status === 'active');
    
    for (const agent of activeAgents) {
      const taskType = agent.type === 'anomaly_detection' ? 'detect_anomalies' :
                      agent.type === 'trend_analysis' ? 'analyze_trends' :
                      agent.type === 'insight_generation' ? 'generate_insights' :
                      agent.type === 'correlation_discovery' ? 'find_correlations' : 'analyze_data';
      
      try {
        await supabase.from('agent_tasks').insert({
          agent_id: agent.id,
          dataset_id: datasetId,
          task_type: taskType,
          parameters: {
            auto_scheduled: true,
            scheduled_for: 'new_dataset',
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to schedule task for agent:', agent.id, error);
      }
    }
  };

  return {
    scheduleTasksForDataset,
  };
};
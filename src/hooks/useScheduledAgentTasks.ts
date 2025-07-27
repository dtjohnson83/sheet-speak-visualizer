import { useEffect } from 'react';
import { useAIAgents } from './useAIAgents';
import { useDatasets } from './useDatasets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook for managing automated agent task scheduling
export const useScheduledAgentTasks = () => {
  const { user } = useAuth();
  const { agents } = useAIAgents();
  const { datasets } = useDatasets();

  // Listen for new datasets and automatically schedule tasks
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('new-datasets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'saved_datasets',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New dataset detected:', payload.new);
          
          // Get active agents
          const activeAgents = agents.filter(agent => agent.status === 'active');
          
          // Schedule tasks for each active agent
          for (const agent of activeAgents) {
            const taskType = agent.type === 'anomaly_detection' ? 'detect_anomalies' :
                            agent.type === 'trend_analysis' ? 'analyze_trends' :
                            agent.type === 'insight_generation' ? 'generate_insights' :
                            agent.type === 'correlation_discovery' ? 'find_correlations' : 'analyze_data';
            
            try {
              await supabase.from('agent_tasks').insert({
                agent_id: agent.id,
                dataset_id: payload.new.id,
                task_type: taskType,
                parameters: {
                  auto_scheduled: true,
                  trigger: 'new_dataset',
                  dataset_name: payload.new.name,
                  timestamp: new Date().toISOString()
                }
              });
              
              console.log(`Scheduled ${taskType} task for agent ${agent.name}`);
            } catch (error) {
              console.error('Failed to schedule task:', error);
            }
          }
          
          // Auto-trigger processor if tasks were created
          if (activeAgents.length > 0) {
            setTimeout(async () => {
              try {
                await supabase.functions.invoke('ai-agent-processor', {
                  body: { auto_trigger: true, source: 'new_dataset' }
                });
                console.log('Auto-triggered processor for new dataset');
              } catch (error) {
                console.error('Failed to auto-trigger processor:', error);
              }
            }, 2000); // Wait 2 seconds for tasks to be inserted
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, agents]);

  // Periodic task scheduler (every hour)
  useEffect(() => {
    if (!user?.id || agents.length === 0 || datasets.length === 0) return;

    const schedulePeriodicTasks = async () => {
      console.log('Running periodic task scheduler...');
      const activeAgents = agents.filter(agent => 
        agent.status === 'active' && 
        agent.configuration?.analysis_frequency !== 'real_time'
      );

      let tasksCreated = 0;

      for (const agent of activeAgents) {
        const frequency = agent.configuration?.analysis_frequency || 'daily';
        const shouldSchedule = checkIfShouldSchedule(agent, frequency);
        
        if (shouldSchedule) {
          const taskType = agent.type === 'anomaly_detection' ? 'detect_anomalies' :
                          agent.type === 'trend_analysis' ? 'analyze_trends' :
                          agent.type === 'insight_generation' ? 'generate_insights' :
                          agent.type === 'correlation_discovery' ? 'find_correlations' :
                          agent.type === 'data_quality' ? 'assess_data_quality' :
                          agent.type === 'predictive_analytics' ? 'predictive_forecast' : 'analyze_data';

          // Check for existing pending tasks first to avoid duplicates
          const { data: existingTasks } = await supabase
            .from('agent_tasks')
            .select('id')
            .eq('agent_id', agent.id)
            .eq('task_type', taskType)
            .eq('status', 'pending')
            .limit(1);

          if (existingTasks && existingTasks.length > 0) {
            console.log(`Periodic schedule skipped: Task already exists for agent ${agent.name}`);
            continue;
          }

          // Find available datasets
          const { data: availableDatasets, error: datasetError } = await supabase
            .from('saved_datasets')
            .select('id, name')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(2);

          if (datasetError) {
            console.error('Error fetching available datasets:', datasetError);
            continue;
          }

          if (!availableDatasets || availableDatasets.length === 0) {
            continue;
          }

          // Schedule task for the first available dataset
          const dataset = availableDatasets[0];
          
          try {
            console.log(`Scheduled periodic ${taskType} task for agent ${agent.name}`);
            await supabase.from('agent_tasks').insert({
              agent_id: agent.id,
              dataset_id: dataset.id,
              task_type: taskType,
              parameters: {
                auto_scheduled: true,
                trigger: 'periodic',
                frequency: frequency,
                timestamp: new Date().toISOString()
              }
            });
            tasksCreated++;
          } catch (error: any) {
            if (error?.code === '23505') { // Duplicate key constraint
              console.log(`Periodic duplicate prevented for agent ${agent.name} on dataset ${dataset.name}`);
            } else {
              console.error('Failed to schedule periodic task:', error);
            }
          }
        }
      }

      // Auto-trigger processor if tasks were created
      if (tasksCreated > 0) {
        console.log(`Auto-triggered processor for ${tasksCreated} periodic tasks`);
        try {
          await supabase.functions.invoke('ai-agent-processor', {
            body: { auto_trigger: true, source: 'periodic' }
          });
        } catch (error) {
          console.error('Failed to auto-trigger processor:', error);
        }
      }
    };

    // Run every 30 minutes to reduce database load and conflicts
    const interval = setInterval(schedulePeriodicTasks, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [user?.id, agents, datasets]);

  return {
    // This hook manages background scheduling, no exposed functions needed
  };
};

// Helper function to determine if an agent should be scheduled based on frequency
function checkIfShouldSchedule(agent: any, frequency: string): boolean {
  const now = new Date();
  const lastActive = agent.last_active ? new Date(agent.last_active) : null;
  
  if (!lastActive) return true; // First time, always schedule
  
  const timeDiff = now.getTime() - lastActive.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  switch (frequency) {
    case 'hourly':
      return hoursDiff >= 1;
    case 'daily':
      return hoursDiff >= 24;
    case 'weekly':
      return hoursDiff >= 168; // 24 * 7
    default:
      return false;
  }
}
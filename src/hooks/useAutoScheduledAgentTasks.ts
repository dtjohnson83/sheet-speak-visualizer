import { useEffect } from 'react';
import { useAIAgents } from './useAIAgents';
import { useDatasets } from './useDatasets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Enhanced hook for managing automated agent task scheduling
export const useAutoScheduledAgentTasks = () => {
  const { user } = useAuth();
  const { agents, triggerProcessor } = useAIAgents();
  const { datasets } = useDatasets();

  // Helper function to map agent types to task types
  const getTaskTypeForAgent = (agentType: string): string => {
    switch (agentType) {
      case 'data_quality':
        return 'assess_data_quality';
      case 'anomaly_detection':
        return 'detect_anomalies';
      case 'trend_analysis':
        return 'analyze_trends';
      case 'predictive_analytics':
        return 'predictive_forecast';
      case 'report_automation':
        return 'report_generation';
      case 'monitoring':
        return 'analyze_data';
      case 'insight_generation':
        return 'generate_insights';
      case 'visualization':
        return 'create_visualization';
      case 'correlation_discovery':
        return 'find_correlations';
      default:
        return 'analyze_data';
    }
  };

  // Listen for new datasets and automatically schedule tasks
  useEffect(() => {
    if (!user?.id || !agents || agents.length === 0) {
      console.log('Auto-scheduling skipped: no user or no agents available');
      return;
    }

    const channel = supabase
      .channel('new-datasets-auto-schedule')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'saved_datasets',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New dataset detected for auto-scheduling:', payload.new);
          
          // Get active agents (re-fetch to ensure latest data)
          const { data: currentAgents, error: agentsError } = await supabase
            .from('ai_agents')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active');

          if (agentsError) {
            console.error('Failed to fetch agents for auto-scheduling:', agentsError);
            return;
          }
          
          if (!currentAgents || currentAgents.length === 0) {
            console.log('No active agents found for auto-scheduling');
            return;
          }

          // Create tasks for each active agent
          const createdTasks = [];
          
          for (const agent of currentAgents) {
            const taskType = getTaskTypeForAgent(agent.type);
            
            try {
              const { data: task, error } = await supabase.from('agent_tasks').insert({
                agent_id: agent.id,
                dataset_id: payload.new.id,
                task_type: taskType,
                parameters: {
                  auto_scheduled: true,
                  trigger: 'new_dataset',
                  dataset_name: payload.new.name,
                  agent_name: agent.name,
                  timestamp: new Date().toISOString()
                }
              }).select().single();
              
              if (error) {
                console.error('Failed to schedule task:', error);
                continue;
              }
              
              createdTasks.push(task);
              console.log(`Auto-scheduled ${taskType} task for agent ${agent.name}`);
            } catch (error) {
              console.error('Failed to schedule task for agent:', agent.id, error);
            }
          }
          
          // Auto-trigger processor if tasks were created
          if (createdTasks.length > 0) {
            setTimeout(async () => {
              try {
                await triggerProcessor();
                console.log(`Auto-triggered processor for ${createdTasks.length} new tasks`);
              } catch (error) {
                console.error('Failed to auto-trigger processor:', error);
              }
            }, 2000); // Wait 2 seconds for tasks to be fully inserted
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, agents, triggerProcessor]);

  // Periodic task scheduler (every hour)
  useEffect(() => {
    if (!user?.id || !agents || agents.length === 0 || !datasets || datasets.length === 0) {
      console.log('Periodic scheduling skipped: missing user, agents, or datasets');
      return;
    }

    const schedulePeriodicTasks = async () => {
      console.log('Running periodic task scheduler...');
      
      const activeAgents = agents.filter(agent => 
        agent.status === 'active' && 
        agent.configuration?.analysis_frequency !== 'real_time'
      );

      if (activeAgents.length === 0) {
        console.log('No active agents for periodic scheduling');
        return;
      }

      let tasksCreated = 0;

      for (const agent of activeAgents) {
        const frequency = agent.configuration?.analysis_frequency || 'daily';
        const shouldSchedule = checkIfShouldSchedule(agent, frequency);
        
        if (shouldSchedule) {
          // Schedule tasks for each dataset
          for (const dataset of datasets) {
            const taskType = getTaskTypeForAgent(agent.type);
            
            try {
              await supabase.from('agent_tasks').insert({
                agent_id: agent.id,
                dataset_id: dataset.id,
                task_type: taskType,
                parameters: {
                  auto_scheduled: true,
                  trigger: 'periodic',
                  frequency: frequency,
                  dataset_name: dataset.name,
                  agent_name: agent.name,
                  timestamp: new Date().toISOString()
                }
              });
              
              tasksCreated++;
              console.log(`Scheduled periodic ${taskType} task for agent ${agent.name}`);
            } catch (error) {
              console.error('Failed to schedule periodic task:', error);
            }
          }
        }
      }

      // Auto-trigger processor if tasks were created
      if (tasksCreated > 0) {
        try {
          await triggerProcessor();
          console.log(`Auto-triggered processor for ${tasksCreated} periodic tasks`);
        } catch (error) {
          console.error('Failed to trigger processor for periodic tasks:', error);
        }
      }
    };

    // Initial scheduling and then every hour
    schedulePeriodicTasks();
    const interval = setInterval(schedulePeriodicTasks, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [user?.id, agents, datasets, triggerProcessor]);

  return {
    // This hook manages background scheduling automatically
    isAutoSchedulingEnabled: true,
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
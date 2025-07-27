import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Agent } from '@/types/agents';

interface ScheduleConfig {
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  timezone?: string;
  businessHoursOnly: boolean;
  weekendsIncluded: boolean;
  customInterval?: number;
  isPaused: boolean;
}

export const useEnhancedScheduling = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateAgentSchedule = useCallback(async (agentId: string, config: ScheduleConfig) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .update({
          configuration: {
            schedule: {
              frequency: config.frequency,
              time: config.time,
              timezone: config.timezone,
              business_hours_only: config.businessHoursOnly,
              weekends_included: config.weekendsIncluded,
              custom_interval: config.customInterval,
            },
          },
          status: config.isPaused ? 'paused' : 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Schedule Updated",
        description: "Agent schedule has been updated successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error updating agent schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update agent schedule. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [toast]);

  const pauseAgent = useCallback(async (agentId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('ai_agents')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Agent Paused",
        description: "Agent has been paused and will not run automatically.",
      });
    } catch (error) {
      console.error('Error pausing agent:', error);
      toast({
        title: "Error",
        description: "Failed to pause agent. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [toast]);

  const resumeAgent = useCallback(async (agentId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('ai_agents')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Agent Resumed",
        description: "Agent has been resumed and will run according to its schedule.",
      });
    } catch (error) {
      console.error('Error resuming agent:', error);
      toast({
        title: "Error",
        description: "Failed to resume agent. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [toast]);

  const calculateNextRun = useCallback((agent: Agent): Date | null => {
    const config = agent.configuration?.schedule;
    if (!config || config.frequency === 'manual' || agent.status === 'paused') {
      return null;
    }

    const now = new Date();
    const scheduleTime = config.time || '09:00';
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    
    // Consider timezone if specified
    let nextRun = new Date(now);
    if (config.timezone && config.timezone !== 'UTC') {
      // Simple timezone handling - in production, use a proper timezone library
      nextRun = new Date(now.toLocaleString("en-US", { timeZone: config.timezone }));
    }
    
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, move to next occurrence
    if (nextRun <= now) {
      switch (config.frequency) {
        case 'hourly':
          const interval = config.custom_interval || 1;
          nextRun.setHours(nextRun.getHours() + interval);
          break;
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
      }
    }

    // Check business hours and weekend constraints
    if (config.business_hours_only) {
      const dayOfWeek = nextRun.getDay();
      const hour = nextRun.getHours();
      
      // Skip weekends if business hours only
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        nextRun.setDate(nextRun.getDate() + (dayOfWeek === 0 ? 1 : 2));
        nextRun.setHours(9, 0, 0, 0);
      }
      
      // Ensure within business hours (9 AM - 5 PM)
      if (hour < 9) {
        nextRun.setHours(9, 0, 0, 0);
      } else if (hour >= 17) {
        nextRun.setDate(nextRun.getDate() + 1);
        nextRun.setHours(9, 0, 0, 0);
      }
    } else if (!config.weekends_included) {
      const dayOfWeek = nextRun.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        nextRun.setDate(nextRun.getDate() + (dayOfWeek === 0 ? 1 : 2));
      }
    }

    return nextRun;
  }, []);

  return {
    updateAgentSchedule,
    pauseAgent,
    resumeAgent,
    calculateNextRun,
    isUpdating,
  };
};
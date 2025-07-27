import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useEnhancedScheduling } from '@/hooks/agents/useEnhancedScheduling';
import { ScheduleConfiguration, ScheduleConfig } from './ScheduleConfiguration';
import { AgentType, Agent } from '@/types/agents';
import { Calendar, Clock, Pause, Play, Settings } from 'lucide-react';

interface AgentScheduleManagerProps {
  agents: Agent[];
}

export const AgentScheduleManager = ({ agents }: AgentScheduleManagerProps) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    frequency: 'daily',
    time: '09:00',
    timezone: 'UTC',
    businessHoursOnly: false,
    weekendsIncluded: true,
    isPaused: false,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const { updateAgentSchedule, pauseAgent, resumeAgent, calculateNextRun, isUpdating } = useEnhancedScheduling();

  const getScheduleStatus = (agent: Agent) => {
    const config = agent.configuration;
    const isPaused = agent.status === 'paused' || config?.schedule?.frequency === 'manual';
    
    if (isPaused) return { label: 'Paused', variant: 'secondary' as const };
    if (agent.status === 'active') return { label: 'Active', variant: 'default' as const };
    if (agent.status === 'error') return { label: 'Error', variant: 'destructive' as const };
    return { label: 'Inactive', variant: 'outline' as const };
  };

  const getNextRunTime = (agent: Agent) => {
    const nextRun = calculateNextRun(agent);
    if (!nextRun) {
      return 'Manual only';
    }
    return nextRun.toLocaleString();
  };

  const handleEditSchedule = (agent: Agent) => {
    setSelectedAgent(agent);
    
    // Load current schedule config
    const currentConfig = agent.configuration?.schedule;
    setScheduleConfig({
      frequency: currentConfig?.frequency || 'daily',
      time: currentConfig?.time || '09:00',
      timezone: currentConfig?.timezone || 'UTC',
      businessHoursOnly: currentConfig?.business_hours_only || false,
      weekendsIncluded: currentConfig?.weekends_included !== false,
      customInterval: currentConfig?.custom_interval || 1,
      isPaused: agent.status === 'paused',
    });
    
    setIsDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!selectedAgent) return;

    try {
      await updateAgentSchedule(selectedAgent.id, scheduleConfig);
      setIsDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleTogglePause = async (agent: Agent) => {
    try {
      if (agent.status === 'paused') {
        await resumeAgent(agent.id);
      } else {
        await pauseAgent(agent.id);
      }
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Schedules</h3>
          <p className="text-sm text-muted-foreground">
            Manage scheduling for all your agents
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {agents.map((agent) => {
          const status = getScheduleStatus(agent);
          const nextRun = getNextRunTime(agent);
          
          return (
            <Card key={agent.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-semibold">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground">{agent.type}</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Next Run
                      </p>
                      <p className="text-sm text-muted-foreground">{nextRun}</p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePause(agent)}
                      className="ml-4"
                      disabled={isUpdating}
                    >
                      {agent.status === 'paused' ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSchedule(agent)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Schedule Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Schedule: {selectedAgent?.name}
            </DialogTitle>
            <DialogDescription>
              Configure when and how often this agent should run automatically.
            </DialogDescription>
          </DialogHeader>
          
          <ScheduleConfiguration
            config={scheduleConfig}
            onChange={setScheduleConfig}
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
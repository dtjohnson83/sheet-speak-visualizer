import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useScheduledAgentTasks } from '@/hooks/useScheduledAgentTasks';
import { AIAgent } from '@/types/agents';
import { AgentOverviewTab } from './tabs/AgentOverviewTab';
import { AgentManagementTab } from './tabs/AgentManagementTab';
import { TaskManagementTab } from './tabs/TaskManagementTab';
import { InsightManagementTab } from './tabs/InsightManagementTab';
import { AgentTestingPanel } from './AgentTestingPanel';
import { AgentMonitoringDashboard } from './AgentMonitoringDashboard';

export const AIAgentOrchestrator = () => {
  const { 
    agents, 
    tasks, 
    insights, 
    agentSummary, 
    isLoading,
    updateAgentStatus,
    deleteAgent,
    deleteAllAgents,
    deleteTask,
    clearAllTasks,
    markInsightRead,
    deleteInsight,
    clearAllInsights,
    isDeletingAgent,
    isDeletingAllAgents,
    isDeletingTask,
    isClearingAllTasks,
    isDeletingInsight,
    isClearingAllInsights
  } = useAIAgents();
  
  // Enable automated task scheduling
  useScheduledAgentTasks();

  const handleToggleAgent = (agent: AIAgent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    updateAgentStatus({ agentId: agent.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <AgentOverviewTab agentSummary={agentSummary} />
          
          {/* Testing and Monitoring for Admin/Development */}
          <div className="space-y-4">
            <AgentTestingPanel />
            <AgentMonitoringDashboard />
          </div>
        </TabsContent>
        
        <TabsContent value="agents">
          <AgentManagementTab
            agents={agents}
            onToggleAgent={handleToggleAgent}
            onDeleteAgent={deleteAgent}
            onDeleteAllAgents={deleteAllAgents}
            isDeletingAgent={isDeletingAgent}
            isDeletingAllAgents={isDeletingAllAgents}
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          <TaskManagementTab
            tasks={tasks}
            onDeleteTask={deleteTask}
            onClearAllTasks={clearAllTasks}
            isDeletingTask={isDeletingTask}
            isClearingAllTasks={isClearingAllTasks}
          />
        </TabsContent>
        
        <TabsContent value="insights">
          <InsightManagementTab
            insights={insights}
            onMarkInsightRead={markInsightRead}
            onDeleteInsight={deleteInsight}
            onClearAllInsights={clearAllInsights}
            isDeletingInsight={isDeletingInsight}
            isClearingAllInsights={isClearingAllInsights}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
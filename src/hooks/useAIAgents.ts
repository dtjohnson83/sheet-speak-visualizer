import { useAgents } from './agents/useAgents';
import { useAgentTasks } from './agents/useAgentTasks';
import { useAgentInsights } from './agents/useAgentInsights';
import { useAgentProcessor } from './agents/useAgentProcessor';
import { useAgentScheduler } from './agents/useAgentScheduler';
import { useAgentSummary } from './agents/useAgentSummary';

export const useAIAgents = () => {
  const agentsHook = useAgents();
  const tasksHook = useAgentTasks();
  const insightsHook = useAgentInsights();
  const processorHook = useAgentProcessor();
  const schedulerHook = useAgentScheduler();
  const summaryHook = useAgentSummary();

  const scheduleTasksForDataset = (datasetId: string) => {
    return schedulerHook.scheduleTasksForDataset(datasetId, agentsHook.agents);
  };

  return {
    // Data
    agents: agentsHook.agents,
    tasks: tasksHook.tasks,
    insights: insightsHook.insights,
    agentSummary: summaryHook.getAgentSummary(agentsHook.agents, tasksHook.tasks, insightsHook.insights),
    
    // Loading states
    isLoading: agentsHook.isLoading || tasksHook.isLoading || insightsHook.isLoading,
    
    // Agent operations
    createAgent: agentsHook.createAgent,
    updateAgentStatus: agentsHook.updateAgentStatus,
    deleteAgent: agentsHook.deleteAgent,
    isCreatingAgent: agentsHook.isCreatingAgent,
    isDeletingAgent: agentsHook.isDeletingAgent,
    
    // Task operations
    createTask: tasksHook.createTask,
    deleteTask: tasksHook.deleteTask,
    isCreatingTask: tasksHook.isCreatingTask,
    isDeletingTask: tasksHook.isDeletingTask,
    
    // Insight operations
    markInsightRead: insightsHook.markInsightRead,
    deleteInsight: insightsHook.deleteInsight,
    isDeletingInsight: insightsHook.isDeletingInsight,
    
    // Processor operations
    triggerProcessor: processorHook.triggerProcessor,
    isTriggeringProcessor: processorHook.isTriggeringProcessor,
    
    // Scheduler operations
    scheduleTasksForDataset,
  };
};
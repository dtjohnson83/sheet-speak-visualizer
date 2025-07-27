import { useAgents } from './agents/useAgents';
import { useAgentTasks } from './agents/useAgentTasks';
import { useAgentInsights } from './agents/useAgentInsights';
import { useAgentProcessor } from './agents/useAgentProcessor';
import { useAgentScheduler } from './agents/useAgentScheduler';
import { useAgentSummary } from './agents/useAgentSummary';
import { useBusinessRuleProcessor } from './agents/useBusinessRuleProcessor';

export const useAIAgents = () => {
  const agentsHook = useAgents();
  const tasksHook = useAgentTasks();
  const insightsHook = useAgentInsights();
  const processorHook = useAgentProcessor();
  const schedulerHook = useAgentScheduler();
  const summaryHook = useAgentSummary();
  const businessRuleProcessor = useBusinessRuleProcessor();

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
    deleteAllAgents: agentsHook.deleteAllAgents,
    isCreatingAgent: agentsHook.isCreatingAgent,
    isDeletingAgent: agentsHook.isDeletingAgent,
    isDeletingAllAgents: agentsHook.isDeletingAllAgents,
    
    // Task operations
    createTask: tasksHook.createTask,
    deleteTask: tasksHook.deleteTask,
    clearAllTasks: tasksHook.clearAllTasks,
    isCreatingTask: tasksHook.isCreatingTask,
    isDeletingTask: tasksHook.isDeletingTask,
    isClearingAllTasks: tasksHook.isClearingAllTasks,
    
    // Insight operations
    markInsightRead: insightsHook.markInsightRead,
    deleteInsight: insightsHook.deleteInsight,
    clearAllInsights: insightsHook.clearAllInsights,
    isDeletingInsight: insightsHook.isDeletingInsight,
    isClearingAllInsights: insightsHook.isClearingAllInsights,
    
    // Processor operations
    triggerProcessor: processorHook.triggerProcessor,
    isTriggeringProcessor: processorHook.isTriggeringProcessor,
    
    // Scheduler operations
    scheduleTasksForDataset,
    
    // Business rule operations
    processBusinessRules: businessRuleProcessor.processBusinessRules,
    processBusinessRulesForDataset: businessRuleProcessor.processBusinessRulesForDataset,
    isProcessingBusinessRules: businessRuleProcessor.isProcessing,
  };
};
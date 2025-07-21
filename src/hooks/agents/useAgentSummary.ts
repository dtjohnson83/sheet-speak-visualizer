import { AIAgent, AgentTask, AgentInsight, AgentSummary } from '@/types/agents';

export const useAgentSummary = () => {
  // Generate agent summary
  const getAgentSummary = (
    agents: AIAgent[], 
    tasks: AgentTask[], 
    insights: AgentInsight[]
  ): AgentSummary => {
    const activeAgents = agents.filter(agent => agent.status === 'active');
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const completedTasksToday = tasks.filter(task => 
      task.status === 'completed' && 
      new Date(task.completed_at || '').toDateString() === new Date().toDateString()
    );
    const unreadInsights = insights.filter(insight => !insight.is_read);
    const lastActivity = tasks.length > 0 ? tasks[0].updated_at : undefined;

    return {
      total_agents: agents.length,
      active_agents: activeAgents.length,
      pending_tasks: pendingTasks.length,
      completed_tasks_today: completedTasksToday.length,
      unread_insights: unreadInsights.length,
      last_activity: lastActivity
    };
  };

  return {
    getAgentSummary,
  };
};
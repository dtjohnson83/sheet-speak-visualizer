
import { useMemo } from 'react';
import { AIAgent, AgentTask, AgentInsight, AgentSummary } from '@/types/agents';

export const useAgentSummary = (
  agents: AIAgent[] = [],
  tasks: AgentTask[] = [],
  insights: AgentInsight[] = []
): AgentSummary => {
  return useMemo(() => {
    const activeAgents = agents.filter(agent => agent.status === 'active').length;
    const recentTasks = tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return taskDate > dayAgo;
    }).length;
    const pendingInsights = insights.filter(insight => !insight.is_read).length;

    return {
      totalAgents: agents.length,
      activeAgents,
      recentTasks,
      pendingInsights
    };
  }, [agents, tasks, insights]);
};

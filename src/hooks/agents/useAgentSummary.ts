
import { useMemo } from 'react';
import { AIAgent } from '@/types/agents';

export interface AgentTask {
  id: string;
  agent_id: string;
  task_type: string;
  status: string;
  created_at: string;
  completed_at?: string;
  result?: any;
}

export interface AgentInsight {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  insight_type: string;
  confidence_score: number;
  is_read: boolean;
  created_at: string;
}

export interface AgentSummary {
  totalAgents: number;
  activeAgents: number;
  pausedAgents: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalInsights: number;
  unreadInsights: number;
  highConfidenceInsights: number;
}

export const useAgentSummary = () => {
  const getAgentSummary = (
    agents: AIAgent[], 
    tasks: AgentTask[], 
    insights: AgentInsight[]
  ): AgentSummary => {
    return useMemo(() => ({
      totalAgents: agents.length,
      activeAgents: agents.filter(agent => agent.status === 'active').length,
      pausedAgents: agents.filter(agent => agent.status === 'paused').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      totalInsights: insights.length,
      unreadInsights: insights.filter(insight => !insight.is_read).length,
      highConfidenceInsights: insights.filter(insight => insight.confidence_score >= 0.8).length,
    }), [agents, tasks, insights]);
  };

  return { getAgentSummary };
};

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Activity, Settings, Brain } from 'lucide-react';
import { AgentSummary } from '@/types/agents';

interface AgentOverviewTabProps {
  agentSummary: AgentSummary;
}

export const AgentOverviewTab = ({ agentSummary }: AgentOverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
              <p className="text-2xl font-bold">{agentSummary.total_agents}</p>
            </div>
            <Bot className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
              <p className="text-2xl font-bold text-success">{agentSummary.active_agents}</p>
            </div>
            <Activity className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-bold text-warning">{agentSummary.pending_tasks}</p>
            </div>
            <Settings className="h-8 w-8 text-warning" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Insights</p>
              <p className="text-2xl font-bold text-info">{agentSummary.unread_insights}</p>
            </div>
            <Brain className="h-8 w-8 text-info" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
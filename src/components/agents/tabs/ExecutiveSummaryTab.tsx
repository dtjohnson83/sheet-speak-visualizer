import React from 'react';
import { AIAgent, AgentTask, AgentInsight } from '@/types/agents';
import { CDODashboard } from '../CDODashboard';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface ExecutiveSummaryTabProps {
  agents: AIAgent[];
  tasks: AgentTask[];
  insights: AgentInsight[];
  data?: DataRow[];
  columns?: ColumnInfo[];
  fileName?: string;
}

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({
  agents,
  tasks,
  insights,
  data,
  columns,
  fileName
}) => {
  return (
    <CDODashboard
      agents={agents}
      tasks={tasks}
      insights={insights}
      data={data}
      columns={columns}
      fileName={fileName}
    />
  );
};
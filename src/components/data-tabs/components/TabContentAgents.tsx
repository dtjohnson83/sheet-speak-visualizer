
import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { AIAgentOrchestrator } from '@/components/agents/AIAgentOrchestrator';
import { DataQualityAgentDashboard } from '@/components/agents/DataQualityAgentDashboard';
import { AgentsList } from '@/components/agents/AgentsList';
import { AgentInsightsList } from '@/components/agents/AgentInsightsList';
import { AgentTaskQueue } from '@/components/agents/AgentTaskQueue';
import { useAIAgents } from '@/hooks/useAIAgents';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentAgentsProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  onAIUsed: () => void;
}

export const TabContentAgents: React.FC<TabContentAgentsProps> = ({
  data,
  columns,
  fileName,
  onAIUsed
}) => {
  const { agents, tasks, insights } = useAIAgents();

  return (
    <>
      <TabsContent value="data-quality" className="space-y-4">
        <div onClick={onAIUsed}>
          <DataQualityAgentDashboard 
            data={data} 
            columns={columns} 
            fileName={fileName}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="agents" className="space-y-4">
        <div className="grid gap-6">
          <Card className="p-6">
            <AIAgentOrchestrator 
              data={data}
              columns={columns}
              fileName={fileName}
              onAIUsed={onAIUsed}
            />
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AgentsList agents={agents} />
            <AgentTaskQueue tasks={tasks} />
          </div>
          
          <AgentInsightsList insights={insights} />
        </div>
      </TabsContent>
    </>
  );
};

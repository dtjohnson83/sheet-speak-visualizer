
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { AIAgentOrchestrator } from '@/components/agents/AIAgentOrchestrator';
import { DataQualityAgentDashboard } from '@/components/agents/DataQualityAgentDashboard';
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
        <div onClick={onAIUsed}>
          <AIAgentOrchestrator 
            data={data}
            columns={columns}
            fileName={fileName}
            onAIUsed={onAIUsed}
          />
        </div>
      </TabsContent>
    </>
  );
};

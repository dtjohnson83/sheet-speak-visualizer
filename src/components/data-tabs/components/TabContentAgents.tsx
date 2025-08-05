
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AIAgentOrchestrator } from '@/components/agents/AIAgentOrchestrator';
import { DatasetSelector } from '@/components/agents/DatasetSelector';
import { GraphMLDashboard } from '@/components/agents/GraphMLDashboard';
import { BusinessGraphMLDashboard } from '@/components/agents/BusinessGraphMLDashboard';
import { useDatasetSelection } from '@/hooks/useDatasetSelection';
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
  const {
    selectedDataset,
    availableDatasets,
    selectDataset,
    hasDatasets
  } = useDatasetSelection(data, columns, fileName);

  // Use selected dataset data or fallback to props
  const activeData = selectedDataset?.data || data;
  const activeColumns = selectedDataset?.columns || columns;
  const activeFileName = selectedDataset?.fileName || fileName;

  return (
    <TabsContent value="agents" className="space-y-4">
      {hasDatasets && (
        <Card className="p-4">
          <DatasetSelector
            value={selectedDataset?.id || ''}
            onValueChange={selectDataset}
            contextLabel="Select dataset for AI agents"
            placeholder="Choose a dataset for agent operations..."
          />
        </Card>
      )}
      
      <div onClick={onAIUsed}>
        <AIAgentOrchestrator 
          data={activeData}
          columns={activeColumns}
          fileName={activeFileName}
          onAIUsed={onAIUsed}
        />
      </div>
      
      <Card className="mt-4">
        <GraphMLDashboard
          data={activeData}
          columns={activeColumns}
          fileName={activeFileName}
        />
      </Card>
    </TabsContent>
  );
};

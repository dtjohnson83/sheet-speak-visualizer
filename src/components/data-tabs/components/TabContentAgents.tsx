
import React from 'react';
import { Card } from '@/components/ui/card';
import { AIAgentOrchestrator } from '@/components/agents/AIAgentOrchestrator';
import { DatasetSelector } from '@/components/agents/DatasetSelector';

import { BusinessGraphMLDashboard } from '@/components/agents/BusinessGraphMLDashboard';
import { ProcessMiningDashboard } from '@/components/agents/ProcessMiningDashboard';
import { QuestionBasedAnalytics } from '@/components/visualization/QuestionBasedAnalytics';
import { GraphAnalysisTab } from './GraphAnalysisTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      
      <Tabs defaultValue="question-analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="question-analytics">Question Analytics</TabsTrigger>
          <TabsTrigger value="graph-analysis">Graph Analysis</TabsTrigger>
          <TabsTrigger value="business-intelligence">Business Intelligence</TabsTrigger>
          <TabsTrigger value="process-mining">Process Mining</TabsTrigger>
        </TabsList>

        <TabsContent value="question-analytics">
          <QuestionBasedAnalytics
            data={activeData}
            columns={activeColumns}
            datasetName={activeFileName}
          />
        </TabsContent>

        <TabsContent value="graph-analysis">
          <GraphAnalysisTab
            data={activeData}
            columns={activeColumns}
            fileName={activeFileName}
          />
        </TabsContent>

        <TabsContent value="business-intelligence">
          <BusinessGraphMLDashboard
            data={activeData}
            columns={activeColumns}
            fileName={activeFileName}
          />
        </TabsContent>

        <TabsContent value="process-mining">
          <ProcessMiningDashboard
            data={activeData}
            columns={activeColumns}
            datasetId={activeFileName}
          />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};

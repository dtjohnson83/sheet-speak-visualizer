import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { AIDataChat } from '@/components/AIDataChat';
import { AISummaryReport } from '@/components/AISummaryReport';
import { EnhancedDataContextManager } from '@/components/ai-context/EnhancedDataContextManager';
import { DatasetSelector } from '@/components/agents/DatasetSelector';
import { useDatasetSelection } from '@/hooks/useDatasetSelection';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentAIProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  showContextSetup: boolean;
  onContextReady: (context: any) => void;
  onSkipContext: () => void;
  onAIUsed: () => void;
}

export const TabContentAI: React.FC<TabContentAIProps> = ({
  data,
  columns,
  fileName,
  showContextSetup,
  onContextReady,
  onSkipContext,
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
    <>
      <TabsContent value="ai-chat" className="space-y-4">
        {hasDatasets && (
          <Card className="p-4">
            <DatasetSelector
              value={selectedDataset?.id || ''}
              onValueChange={selectDataset}
              contextLabel="Select dataset for AI chat"
              placeholder="Choose a dataset to analyze..."
            />
          </Card>
        )}

        {showContextSetup ? (
          <EnhancedDataContextManager
            data={activeData}
            columns={activeColumns}
            fileName={activeFileName}
            onContextReady={onContextReady}
            onSkip={onSkipContext}
          />
        ) : (
          <Card className="p-6" onClick={onAIUsed}>
            <AIDataChat 
              data={activeData} 
              columns={activeColumns}
              fileName={activeFileName}
            />
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="ai-report" className="space-y-4">
        {hasDatasets && (
          <Card className="p-4">
            <DatasetSelector
              value={selectedDataset?.id || ''}
              onValueChange={selectDataset}
              contextLabel="Select dataset for AI report"
              placeholder="Choose a dataset to analyze..."
            />
          </Card>
        )}
        
        <div onClick={onAIUsed}>
          <AISummaryReport 
            data={activeData} 
            columns={activeColumns}
            fileName={activeFileName}
          />
        </div>
      </TabsContent>
    </>
  );
};
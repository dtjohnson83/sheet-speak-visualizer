import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DatasetSelector } from '@/components/agents/DatasetSelector';
import { useDatasetSelection } from '@/hooks/useDatasetSelection';
import { UnifiedAIInterface } from '@/components/unified-ai/UnifiedAIInterface';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentChartsProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  onAddTile: (tileData: any) => void;
}

export const TabContentCharts: React.FC<TabContentChartsProps> = ({
  data,
  columns,
  fileName,
  onAddTile
}) => {
  const [chartMode, setChartMode] = useState<'unified' | 'traditional'>('unified');
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
    <TabsContent value="charts" className="space-y-4">
      {hasDatasets && (
        <Card className="p-4">
          <DatasetSelector
            value={selectedDataset?.id || ''}
            onValueChange={selectDataset}
            contextLabel="Select dataset for visualization"
            placeholder="Choose a dataset to visualize..."
          />
        </Card>
      )}
      
      <Tabs value={chartMode} onValueChange={(value) => setChartMode(value as 'unified' | 'traditional')}>
        <Card className="p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unified">AI Assistant</TabsTrigger>
            <TabsTrigger value="traditional">Chart Builder</TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="unified">
          <UnifiedAIInterface
            data={activeData}
            columns={activeColumns}
            fileName={activeFileName}
            onSaveTile={onAddTile}
          />
        </TabsContent>

        <TabsContent value="traditional">
          <Card className="p-6">
            <ChartVisualization 
              data={activeData} 
              columns={activeColumns}
              onSaveTile={onAddTile}
              dataSourceName={activeFileName}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};
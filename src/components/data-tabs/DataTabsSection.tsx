
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TabContentSources } from './components/TabContentSources';
import { TabContentPreview } from './components/TabContentPreview';
import { TabContentCharts } from './components/TabContentCharts';
import { TabContentDashboard } from './components/TabContentDashboard';
import { TabContentAI } from './components/TabContentAI';
import { TabContentAgents } from './components/TabContentAgents';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';
import { useUIState } from '@/contexts/UIStateContext';
import { useUIActions } from '@/hooks/useUIActions';
import { TierDefinition, tierDefinitions } from './tierDefinitions';

import { TabContentDatasets } from './components/TabContentDatasets';

interface DataTabsSectionProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  tiles: DashboardTileData[];
  filters: FilterCondition[];
  currentDatasetId: string;
  showContextSetup: boolean;
  selectedDataSource: string;
  showDataSourceDialog: boolean;
  onAddTile: (tileData: any) => void;
  onRemoveTile: (tileId: string) => void;
  onUpdateTile: (tileId: string, updates: Partial<DashboardTileData>) => void;
  onFiltersChange: (filters: FilterCondition[]) => void;
  onLoadDashboard: (dashboardData: { tiles: DashboardTileData[]; filters: FilterCondition[]; data?: DataRow[]; columns?: ColumnInfo[] }) => void;
  onContextReady: (context: any) => void;
  onSkipContext: () => void;
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
  onDataSourceSelect: (source: string) => void;
  onDataSourceDialogChange: (open: boolean) => void;
  onDataLoaded: (data: DataRow[], columns: ColumnInfo[], fileName: string, source?: string) => void;
  onAIUsed: () => void;
}

export const DataTabsSection: React.FC<DataTabsSectionProps> = ({
  data,
  columns,
  fileName,
  tiles,
  filters,
  currentDatasetId,
  showContextSetup,
  selectedDataSource,
  showDataSourceDialog,
  onAddTile,
  onRemoveTile,
  onUpdateTile,
  onFiltersChange,
  onLoadDashboard,
  onContextReady,
  onSkipContext,
  onColumnTypeChange,
  onDataSourceSelect,
  onDataSourceDialogChange,
  onDataLoaded,
  onAIUsed
}) => {
  const { state } = useUIState();
  const { setActiveTab } = useUIActions();
  const activeTab = state.activeTab;

  const currentTier: TierDefinition = tierDefinitions.find(tier =>
    tier.tabs.some(tab => tab.id === activeTab)
  ) || tierDefinitions[0];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full">
      <div className="w-64 border-r overflow-y-auto">
        <TabsList className="flex flex-col h-auto w-full bg-transparent p-4 space-y-2">
          {currentTier.tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="w-full text-left p-2 rounded-md hover:bg-secondary cursor-pointer data-[state=active]:bg-secondary data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground"
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="flex-1 min-h-0">
        <TabsContent value="sources" className="h-full overflow-auto m-0">
          <TabContentSources
            selectedDataSource={selectedDataSource}
            showDataSourceDialog={showDataSourceDialog}
            onDataSourceSelect={onDataSourceSelect}
            onDataSourceDialogChange={onDataSourceDialogChange}
            onDataLoaded={onDataLoaded}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="h-full overflow-auto m-0">
          <TabContentPreview
            data={data}
            columns={columns}
            fileName={fileName}
            onColumnTypeChange={onColumnTypeChange}
          />
        </TabsContent>

        <TabsContent value="datasets" className="h-full overflow-auto m-0">
          <TabContentDatasets />
        </TabsContent>
        
        <TabsContent value="charts" className="h-full overflow-auto m-0">
          <TabContentCharts
            data={data}
            columns={columns}
            fileName={fileName}
            onAddTile={onAddTile}
          />
        </TabsContent>
        
        <TabsContent value="dashboard" className="h-full overflow-auto m-0">
          <TabContentDashboard
            tiles={tiles}
            filters={filters}
            data={data}
            columns={columns}
            currentDatasetId={currentDatasetId}
            onRemoveTile={onRemoveTile}
            onUpdateTile={onUpdateTile}
            onFiltersChange={onFiltersChange}
            onLoadDashboard={(tiles, filters, data, columns) => onLoadDashboard({ tiles, filters, data, columns })}
          />
        </TabsContent>
        
        <TabsContent value="ai" className="h-full overflow-auto m-0">
          <TabContentAI
            data={data}
            columns={columns}
            fileName={fileName}
            showContextSetup={showContextSetup}
            onContextReady={onContextReady}
            onSkipContext={onSkipContext}
            onAIUsed={onAIUsed}
          />
        </TabsContent>
        
        <TabsContent value="agents" className="h-full overflow-auto m-0">
          <TabContentAgents 
            data={data}
            columns={columns}
            fileName={fileName}
            onAIUsed={onAIUsed}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};


import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const activeTab = state.activeTab;

  const currentTier: TierDefinition = tierDefinitions.find(tier =>
    tier.tabs.some(tab => tab.id === activeTab)
  ) || tierDefinitions[0];

  return (
    <div className="flex h-full">
      <div className="w-64 border-r overflow-y-auto">
        <div className="p-4 space-y-2">
          {currentTier.tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`w-full text-left p-2 rounded-md hover:bg-secondary cursor-pointer ${
                activeTab === tab.id ? 'bg-secondary font-medium' : 'text-muted-foreground'
              }`}
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full overflow-auto">
          {activeTab === 'sources' && (
            <TabContentSources
              selectedDataSource={selectedDataSource}
              showDataSourceDialog={showDataSourceDialog}
              onDataSourceSelect={onDataSourceSelect}
              onDataSourceDialogChange={onDataSourceDialogChange}
              onDataLoaded={onDataLoaded}
            />
          )}
          
          {activeTab === 'preview' && (
            <TabContentPreview
              data={data}
              columns={columns}
              fileName={fileName}
              onContextReady={onContextReady}
              onSkipContext={onSkipContext}
              onColumnTypeChange={onColumnTypeChange}
            />
          )}

          {activeTab === 'datasets' && (
            <TabContentDatasets />
          )}
          
          {activeTab === 'charts' && (
            <TabContentCharts
              data={data}
              columns={columns}
              onAddTile={onAddTile}
            />
          )}
          
          {activeTab === 'dashboard' && (
            <TabContentDashboard
              tiles={tiles}
              filters={filters}
              data={data}
              columns={columns}
              onRemoveTile={onRemoveTile}
              onUpdateTile={onUpdateTile}
              onFiltersChange={onFiltersChange}
              onLoadDashboard={(tiles, filters, data, columns) => onLoadDashboard({ tiles, filters, data, columns })}
            />
          )}
          
          {activeTab === 'ai' && (
            <TabContentAI
              data={data}
              columns={columns}
              onAIUsed={onAIUsed}
            />
          )}
          
          {activeTab === 'agents' && (
            <TabContentAgents 
              data={data}
              columns={columns}
              fileName={fileName}
              onAIUsed={onAIUsed}
            />
          )}
        </div>
      </div>
    </div>
  );
};

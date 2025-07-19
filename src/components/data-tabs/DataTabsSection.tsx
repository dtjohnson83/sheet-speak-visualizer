
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TabContentSources } from './components/TabContentSources';
import { TabContentPreview } from './components/TabContentPreview';
import { TabContentCharts } from './components/TabContentCharts';
import { TabContentDashboard } from './components/TabContentDashboard';
import { TabContentAI } from './components/TabContentAI';
import { TabContentAgents } from './components/TabContentAgents';
import { TabContentDatasets } from './components/TabContentDatasets';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';
import { useUIState } from '@/contexts/UIStateContext';
import { useUIActions } from '@/hooks/useUIActions';
import { tierDefinitions } from './tierDefinitions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Database, Eye, BarChart3, Layout, Brain, Bot, Layers, MessageCircle, FileText, TrendingUp } from 'lucide-react';
import { AIDataChat } from '@/components/AIDataChat';
import { AISummaryReport } from '@/components/AISummaryReport';
import { PredictiveAnalyticsDashboard } from '@/components/predictive-analytics/PredictiveAnalyticsDashboard';
import { Card } from '@/components/ui/card';

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

// Icon mapping for tabs
const iconMap = {
  Database,
  Eye,
  BarChart3,
  Layout,
  Brain,
  Bot,
  Layers,
  MessageCircle,
  FileText,
  TrendingUp
};

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
  const isMobile = useIsMobile();

  // Get all tabs from all tiers
  const allTabs = tierDefinitions.flatMap(tier => 
    tier.tabs.map(tab => ({
      ...tab,
      tierName: tier.name,
      tierColor: tier.id
    }))
  );

  const getTabIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Database;
  };

  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsList className="w-full h-auto p-2 bg-transparent justify-start overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-max">
              {allTabs.map((tab) => {
                const Icon = getTabIcon(tab.icon);
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </TabsTrigger>
                );
              })}
            </div>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Tab Contents */}
          <TabsContent value="sources" className="h-full m-0 p-4">
            <TabContentSources
              selectedDataSource={selectedDataSource}
              showDataSourceDialog={showDataSourceDialog}
              onDataSourceSelect={onDataSourceSelect}
              onDataSourceDialogChange={onDataSourceDialogChange}
              onDataLoaded={onDataLoaded}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="h-full m-0 p-4">
            <TabContentPreview
              data={data}
              columns={columns}
              fileName={fileName}
              onColumnTypeChange={onColumnTypeChange}
            />
          </TabsContent>

          <TabsContent value="datasets" className="h-full m-0 p-4">
            <TabContentDatasets />
          </TabsContent>
          
          <TabsContent value="charts" className="h-full m-0 p-4">
            <Card className="p-6">
              <TabContentCharts
                data={data}
                columns={columns}
                fileName={fileName}
                onAddTile={onAddTile}
              />
            </Card>
          </TabsContent>

          <TabsContent value="predictive" className="h-full m-0 p-4">
            <PredictiveAnalyticsDashboard 
              data={data} 
              columns={columns}
            />
          </TabsContent>
          
          <TabsContent value="dashboard" className="h-full m-0 p-4">
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
          
          <TabsContent value="ai-chat" className="h-full m-0 p-4">
            <Card className="p-6" onClick={onAIUsed}>
              <AIDataChat 
                data={data} 
                columns={columns}
                fileName={fileName}
              />
            </Card>
          </TabsContent>

          <TabsContent value="ai-report" className="h-full m-0 p-4">
            <div onClick={onAIUsed}>
              <AISummaryReport 
                data={data} 
                columns={columns}
                fileName={fileName}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="h-full m-0 p-4">
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
  }

  // Desktop layout
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full">
      <div className="w-64 border-r bg-muted/5 overflow-y-auto">
        <div className="p-4">
          {tierDefinitions.map((tier) => (
            <div key={tier.id} className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
                {tier.name}
              </h3>
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1">
                {tier.tabs.map((tab) => {
                  const Icon = getTabIcon(tab.icon);
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="w-full justify-start gap-3 p-3 h-auto rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-muted/50"
                    >
                      <Icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-xs opacity-70 line-clamp-1">{tab.description}</div>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          ))}
        </div>
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
          <Card className="p-6">
            <TabContentCharts
              data={data}
              columns={columns}
              fileName={fileName}
              onAddTile={onAddTile}
            />
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="h-full overflow-auto m-0">
          <PredictiveAnalyticsDashboard 
            data={data} 
            columns={columns}
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
        
        <TabsContent value="ai-chat" className="h-full overflow-auto m-0">
          <Card className="p-6" onClick={onAIUsed}>
            <AIDataChat 
              data={data} 
              columns={columns}
              fileName={fileName}
            />
          </Card>
        </TabsContent>

        <TabsContent value="ai-report" className="h-full overflow-auto m-0">
          <div onClick={onAIUsed}>
            <AISummaryReport 
              data={data} 
              columns={columns}
              fileName={fileName}
            />
          </div>
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

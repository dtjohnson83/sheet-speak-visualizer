import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataPreview } from '@/components/DataPreview';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { DashboardManager } from '@/components/dashboard/DashboardManager';
import { AIDataChat } from '@/components/AIDataChat';
import { AISummaryReport } from '@/components/AISummaryReport';
import { AIAgentOrchestrator } from '@/components/agents/AIAgentOrchestrator';
import { DataQualityAgentDashboard } from '@/components/agents/DataQualityAgentDashboard';
import { EnhancedDataContextManager } from '@/components/ai-context/EnhancedDataContextManager';
import { PredictiveAnalyticsDashboard } from '@/components/predictive-analytics/PredictiveAnalyticsDashboard';
import { TabNavigationEnhancer } from './TabNavigationEnhancer';
import { RealtimeDataConfig } from '@/components/realtime/RealtimeDataConfig';
import { Bot, Database, BarChart3, Layout, Settings, FileText, Shield, Target, Wifi } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DataTabsSectionProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  tiles: any[];
  filters: any[];
  currentDatasetId: string;
  showContextSetup: boolean;
  onAddTile: (tile: any) => void;
  onRemoveTile: (id: string) => void;
  onUpdateTile: (id: string, updates: any) => void;
  onFiltersChange: (filters: any[]) => void;
  onLoadDashboard: (tiles: any[], filters: any[], data?: DataRow[], columns?: ColumnInfo[]) => void;
  onContextReady: (context: any) => void;
  onSkipContext: () => void;
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
}

export const DataTabsSection = ({
  data,
  columns,
  fileName,
  tiles,
  filters,
  currentDatasetId,
  showContextSetup,
  onAddTile,
  onRemoveTile,
  onUpdateTile,
  onFiltersChange,
  onLoadDashboard,
  onContextReady,
  onSkipContext,
  onColumnTypeChange,
}: DataTabsSectionProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("preview");

  const tabOrder = ["preview", "charts", "dashboard", "realtime", "ai-chat", "ai-report", "predictive", "data-quality", "agents"];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabNavigationEnhancer onTabChange={handleTabChange} tabs={tabOrder} />
      <TabsList className={`w-full bg-muted/50 p-1 ${
        isMobile 
          ? 'flex overflow-x-auto justify-start gap-1' 
          : 'grid grid-cols-9 gap-1'
      }`}>
        {/* Core Data Tools */}
        <TabsTrigger 
          value="preview" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[80px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <Database className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Data' : 'Data Preview'}</span>
          {data.length > 0 && (
            <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {data.length}
            </span>
          )}
        </TabsTrigger>
        
        <TabsTrigger 
          value="charts" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[80px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Charts' : 'Visualizations'}</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="dashboard" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[90px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <Layout className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>Dashboard</span>
          {tiles.length > 0 && (
            <span className="ml-1 text-xs bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full">
              {tiles.length}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger 
          value="realtime" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[80px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <Wifi className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Live' : 'Real-time'}</span>
        </TabsTrigger>

        {/* Separator */}
        <div className={`${isMobile ? 'hidden' : 'flex items-center justify-center'}`}>
          <div className="w-px h-6 bg-border"></div>
        </div>

        {/* AI Tools */}
        <TabsTrigger 
          value="ai-chat" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[70px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <Bot className="h-4 w-4 text-green-600" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'AI' : 'AI Chat'}</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="ai-report" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[80px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <FileText className="h-4 w-4 text-green-600" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Report' : 'AI Report'}</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="predictive" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[80px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <Target className="h-4 w-4 text-green-600" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Predict' : 'Predictive AI'}</span>
        </TabsTrigger>

        {/* Advanced Tools */}
        <TabsTrigger 
          value="data-quality" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[80px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <Shield className="h-4 w-4 text-orange-600" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Quality' : 'Data Quality'}</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="agents" 
          className={`${isMobile ? 'flex-shrink-0 min-w-[80px]' : ''} flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all`}
        >
          <Settings className="h-4 w-4 text-orange-600" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Agents' : 'AI Agents'}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="preview" className="space-y-4">
        <Card className="p-6">
          <DataPreview 
            data={data} 
            columns={columns} 
            fileName={fileName}
            onColumnTypeChange={onColumnTypeChange}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="ai-chat" className="space-y-4">
        {showContextSetup ? (
          <EnhancedDataContextManager
            data={data}
            columns={columns}
            fileName={fileName}
            onContextReady={onContextReady}
            onSkip={onSkipContext}
          />
        ) : (
          <Card className="p-6">
            <AIDataChat 
              data={data} 
              columns={columns}
              fileName={fileName}
            />
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="ai-report" className="space-y-4">
        <AISummaryReport 
          data={data} 
          columns={columns}
          fileName={fileName}
        />
      </TabsContent>
      
      <TabsContent value="data-quality" className="space-y-4">
        <DataQualityAgentDashboard 
          data={data} 
          columns={columns} 
          fileName={fileName}
        />
      </TabsContent>
      
      <TabsContent value="agents" className="space-y-4">
        <Card className="p-6">
          <AIAgentOrchestrator />
        </Card>
      </TabsContent>
      
      <TabsContent value="charts" className="space-y-4">
        <Card className="p-6">
          <ChartVisualization 
            data={data} 
            columns={columns}
            onSaveTile={onAddTile}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="predictive" className="space-y-4">
        <PredictiveAnalyticsDashboard 
          data={data} 
          columns={columns}
        />
      </TabsContent>
      
      <TabsContent value="realtime" className="space-y-4">
        <Card className="p-6">
          <RealtimeDataConfig />
        </Card>
      </TabsContent>
      
      <TabsContent value="dashboard" className="space-y-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Dashboard</h3>
              <p className="text-sm text-gray-600">
                {tiles.length === 0 
                  ? "Save visualizations as tiles to build your dashboard" 
                  : `${tiles.length} tile${tiles.length !== 1 ? 's' : ''} in dashboard`
                }
              </p>
            </div>
            <DashboardManager
              tiles={tiles}
              filters={filters}
              currentDatasetId={currentDatasetId}
              onLoadDashboard={onLoadDashboard}
            />
          </div>
        </Card>
        
        <DashboardCanvas
          tiles={tiles}
          data={data}
          columns={columns}
          onRemoveTile={onRemoveTile}
          onUpdateTile={onUpdateTile}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </TabsContent>
    </Tabs>
  );
};
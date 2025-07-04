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
import { Bot, Database, BarChart3, Layout, Settings, FileText, Shield, Target } from 'lucide-react';
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
}: DataTabsSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className={`w-full ${
        isMobile 
          ? 'flex overflow-x-auto justify-start gap-1 p-1' 
          : 'grid grid-cols-8'
      }`}>
        <TabsTrigger 
          value="preview" 
          className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
        >
          <Database className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Data' : 'Data Preview'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="data-quality" 
          className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
        >
          <Shield className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Quality' : 'Data Quality'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ai-chat" 
          className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
        >
          <Bot className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'AI' : 'AI Chat'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ai-report" 
          className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
        >
          <FileText className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Report' : 'AI Report'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="agents" 
          className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
        >
          <Settings className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Agents' : 'AI Agents'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="charts" 
          className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Charts' : 'Visualizations'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="predictive" 
          className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
        >
          <Target className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Predict' : 'Predictive AI'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="dashboard" 
          className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
        >
          <Layout className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>Dashboard</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="preview" className="space-y-4">
        <Card className="p-6">
          <DataPreview 
            data={data} 
            columns={columns} 
            fileName={fileName}
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
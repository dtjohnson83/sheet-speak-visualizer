import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
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
import { DataSourcesTab } from '@/components/data-sources/DataSourcesTab';
import { SmartDataIntegration } from '@/components/semantic/SmartDataIntegration';
import { ChevronDown, ChevronRight, ArrowRight, CheckCircle2, Bot, Database, BarChart3, Layout, Settings, FileText, Shield, Target, Brain } from 'lucide-react';
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
  selectedDataSource: string;
  showDataSourceDialog: boolean;
  onAddTile: (tile: any) => void;
  onRemoveTile: (id: string) => void;
  onUpdateTile: (id: string, updates: any) => void;
  onFiltersChange: (filters: any[]) => void;
  onLoadDashboard: (tiles: any[], filters: any[], data?: DataRow[], columns?: ColumnInfo[]) => void;
  onContextReady: (context: any) => void;
  onSkipContext: () => void;
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
  onDataSourceSelect: (type: string) => void;
  onDataSourceDialogChange: (open: boolean) => void;
  onDataLoaded: (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string, worksheet?: string) => void;
}

export const DataTabsSection = ({
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
}: DataTabsSectionProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("data-sources");
  
  // Tier management state
  const [expandedTiers, setExpandedTiers] = useState({
    foundation: true,
    analysis: false,
    ai: false,
    advanced: false
  });

  // Workflow progress tracking
  const hasData = data.length > 0;
  const hasCharts = tiles.length > 0;
  const hasAIContext = !showContextSetup;

  // Tab tier definitions
  const tiers = {
    foundation: {
      title: "Data Foundation",
      description: "Connect and prepare your data",
      icon: Database,
      color: "blue",
      tabs: [
        { id: "data-sources", label: "Data Sources", icon: Database, badge: null },
        { id: "preview", label: "Data Preview", icon: Database, badge: hasData ? data.length : null },
        { id: "smart-integration", label: "Smart Integration", icon: Brain, badge: null }
      ]
    },
    analysis: {
      title: "Analysis & Visualization", 
      description: "Create charts and dashboards",
      icon: BarChart3,
      color: "green",
      tabs: [
        { id: "charts", label: "Visualizations", icon: BarChart3, badge: null },
        { id: "dashboard", label: "Dashboard", icon: Layout, badge: tiles.length > 0 ? tiles.length : null }
      ]
    },
    ai: {
      title: "AI Intelligence",
      description: "Chat, analyze, and predict", 
      icon: Bot,
      color: "purple",
      tabs: [
        { id: "ai-chat", label: "AI Chat", icon: Bot, badge: null },
        { id: "ai-report", label: "AI Report", icon: FileText, badge: null },
        { id: "predictive", label: "Predictive AI", icon: Target, badge: null }
      ]
    },
    advanced: {
      title: "Advanced Operations",
      description: "Quality control and automation",
      icon: Settings,
      color: "orange",
      tabs: [
        { id: "data-quality", label: "Data Quality", icon: Shield, badge: null },
        { id: "agents", label: "AI Agents", icon: Settings, badge: null }
      ]
    }
  };

  // Auto-expand tiers based on workflow progress
  useEffect(() => {
    setExpandedTiers(prev => ({
      ...prev,
      analysis: hasData || prev.analysis,
      ai: (hasData && hasCharts) || prev.ai,
      advanced: hasAIContext || prev.advanced
    }));
  }, [hasData, hasCharts, hasAIContext]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  const getTierProgress = (tierKey: string) => {
    switch (tierKey) {
      case 'foundation': return hasData ? 'complete' : 'active';
      case 'analysis': return hasCharts ? 'complete' : hasData ? 'active' : 'pending';
      case 'ai': return hasAIContext ? 'complete' : (hasData && hasCharts) ? 'active' : 'pending';
      case 'advanced': return hasAIContext ? 'active' : 'pending';
      default: return 'pending';
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      {/* Cascading Tier Layout */}
      <div className="w-full space-y-4 mb-6">
        {Object.entries(tiers).map(([tierKey, tier]) => {
          const isExpanded = expandedTiers[tierKey as keyof typeof expandedTiers];
          const progress = getTierProgress(tierKey);
          const progressIcon = progress === 'complete' ? CheckCircle2 : progress === 'active' ? ArrowRight : ChevronRight;
          const progressColor = progress === 'complete' ? 'text-green-600' : progress === 'active' ? 'text-blue-600' : 'text-muted-foreground';
          
          return (
            <Collapsible key={tierKey} open={isExpanded} onOpenChange={() => toggleTier(tierKey)}>
              <CollapsibleTrigger className="w-full">
                <Card className={`p-4 hover:shadow-md transition-all duration-200 ${
                  progress === 'active' ? 'ring-2 ring-blue-200 bg-blue-50/50' :
                  progress === 'complete' ? 'ring-2 ring-green-200 bg-green-50/50' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        tier.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        tier.color === 'green' ? 'bg-green-100 text-green-600' :
                        tier.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <tier.icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{tier.title}</h3>
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      </div>
                    </div>
                     <div className="flex items-center gap-2">
                       <div className={`${progressColor}`}>
                         {React.createElement(progressIcon, { className: "h-5 w-5" })}
                       </div>
                      {isExpanded ? 
                        <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                  </div>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2 ml-4 border-l-2 border-muted pl-4">
                  <div className={`grid gap-2 ${
                    isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {tier.tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full justify-start p-3 h-auto flex items-center gap-3 transition-all rounded-md ${
                          activeTab === tab.id 
                            ? 'bg-background shadow-sm ring-2 ring-primary text-foreground' 
                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span className="font-medium">{tab.label}</span>
                        {tab.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {tab.badge}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        
        {/* Workflow Progress Indicator */}
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${hasData ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">Data Connected</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${hasCharts ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">Charts Created</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${hasAIContext ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">AI Ready</span>
            </div>
          </div>
        </Card>
      </div>
      
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
            dataSourceName={fileName}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="predictive" className="space-y-4">
        <PredictiveAnalyticsDashboard 
          data={data} 
          columns={columns}
        />
      </TabsContent>
      
      <TabsContent value="data-sources" className="space-y-4">
        <Card className="p-6">
          <DataSourcesTab 
            selectedDataSource={selectedDataSource}
            showDataSourceDialog={showDataSourceDialog}
            onDataSourceSelect={onDataSourceSelect}
            onDataSourceDialogChange={onDataSourceDialogChange}
            onDataLoaded={onDataLoaded}
          />
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

      <TabsContent value="smart-integration" className="space-y-4">
        <Card className="p-6">
          <SmartDataIntegration onDataLoaded={onDataLoaded} />
        </Card>
      </TabsContent>
    </Tabs>
  );
};
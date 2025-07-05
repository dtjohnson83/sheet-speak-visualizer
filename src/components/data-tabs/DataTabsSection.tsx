import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
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
import { DataSourcesTab } from '@/components/data-sources/DataSourcesTab';
import { SmartDataIntegration } from '@/components/semantic/SmartDataIntegration';
import { DataTabsSectionProps, ProgressStatus } from './types';
import { getTierDefinitions } from './tierDefinitions';
import { TierSection } from './TierSection';
import { WorkflowProgressIndicator } from './WorkflowProgressIndicator';

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
  onAIUsed,
}: DataTabsSectionProps) => {
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

  // Get tier definitions
  const tiers = getTierDefinitions(data, tiles);

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

  const getTierProgress = (tierKey: string): ProgressStatus => {
    switch (tierKey) {
      case 'foundation': return hasData ? 'complete' : 'active';
      case 'analysis': return hasCharts ? 'complete' : hasData ? 'active' : 'pending';
      case 'ai': return hasAIContext ? 'complete' : (hasData && hasCharts) ? 'active' : 'pending';
      case 'advanced': return hasAIContext ? 'complete' : (hasData && hasCharts) ? 'active' : 'pending';
      default: return 'pending';
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      {/* Cascading Tier Layout */}
      <div className="w-full space-y-4 mb-6">
        {Object.entries(tiers).map(([tierKey, tier]) => (
          <TierSection
            key={tierKey}
            tierKey={tierKey}
            tier={tier}
            progress={getTierProgress(tierKey)}
            isExpanded={expandedTiers[tierKey as keyof typeof expandedTiers]}
            activeTab={activeTab}
            onToggle={() => toggleTier(tierKey)}
            onTabChange={handleTabChange}
          />
        ))}
        
        <WorkflowProgressIndicator
          hasData={hasData}
          hasCharts={hasCharts}
          hasAIContext={hasAIContext}
        />
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
          <Card className="p-6" onClick={onAIUsed}>
            <AIDataChat 
              data={data} 
              columns={columns}
              fileName={fileName}
            />
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="ai-report" className="space-y-4">
        <div onClick={onAIUsed}>
          <AISummaryReport 
            data={data} 
            columns={columns}
            fileName={fileName}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="data-quality" className="space-y-4">
        <div onClick={onAIUsed}>
          <DataQualityAgentDashboard 
            data={data} 
            columns={columns} 
            fileName={fileName}
          />
        </div>
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
              <p className="text-sm text-muted-foreground">
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
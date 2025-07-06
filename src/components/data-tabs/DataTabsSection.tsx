import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { getTierDefinitions } from './tierDefinitions';
import { TierSection } from './TierSection';
import { WorkflowProgressIndicator } from './WorkflowProgressIndicator';
import { useTabManagement } from './hooks/useTabManagement';
import { TabContentPreview } from './components/TabContentPreview';
import { TabContentAI } from './components/TabContentAI';
import { TabContentCharts } from './components/TabContentCharts';
import { TabContentDashboard } from './components/TabContentDashboard';
import { TabContentSources } from './components/TabContentSources';
import { TabContentAgents } from './components/TabContentAgents';
import { DataTabsSectionProps } from './types';

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
  const {
    activeTab,
    expandedTiers,
    hasData,
    hasCharts,
    hasAIContext,
    handleTabChange,
    toggleTier,
    getTierProgress
  } = useTabManagement(data, tiles, showContextSetup);

  // Get tier definitions
  const tiers = getTierDefinitions(data, tiles);

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
      
      {/* Tab Content Components */}
      <TabContentPreview
        data={data}
        columns={columns}
        fileName={fileName}
        onColumnTypeChange={onColumnTypeChange}
      />
      
      <TabContentAI
        data={data}
        columns={columns}
        fileName={fileName}
        showContextSetup={showContextSetup}
        onContextReady={onContextReady}
        onSkipContext={onSkipContext}
        onAIUsed={onAIUsed}
      />
      
      <TabContentCharts
        data={data}
        columns={columns}
        fileName={fileName}
        onAddTile={onAddTile}
      />
      
      <TabContentDashboard
        data={data}
        columns={columns}
        tiles={tiles}
        filters={filters}
        currentDatasetId={currentDatasetId}
        onRemoveTile={onRemoveTile}
        onUpdateTile={onUpdateTile}
        onFiltersChange={onFiltersChange}
        onLoadDashboard={onLoadDashboard}
      />
      
      <TabContentSources
        selectedDataSource={selectedDataSource}
        showDataSourceDialog={showDataSourceDialog}
        onDataSourceSelect={onDataSourceSelect}
        onDataSourceDialogChange={onDataSourceDialogChange}
        onDataLoaded={onDataLoaded}
      />
      
      <TabContentAgents
        data={data}
        columns={columns}
        fileName={fileName}
        onAIUsed={onAIUsed}
      />
    </Tabs>
  );
};
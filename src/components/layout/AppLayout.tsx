import React from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { DataStatusBar } from '@/components/layout/DataStatusBar';
import { DataTabsSection } from '@/components/data-tabs/DataTabsSection';
import { TutorialOverlay } from '@/components/onboarding/TutorialOverlay';
import { GettingStartedChecklist } from '@/components/onboarding/GettingStartedChecklist';
import { ActiveSourceIndicator } from '@/components/realtime/ActiveSourceIndicator';

import { useAppState } from '@/contexts/AppStateContext';
import { useUIState } from '@/contexts/UIStateContext';
import { useAppActions } from '@/hooks/useAppActions';
import { useUIActions } from '@/hooks/useUIActions';
import { useTutorialProgress } from '@/hooks/useTutorialProgress';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useRealtimeData } from '@/contexts/RealtimeDataContext';
import { PlatformChatbot } from '@/components/chat/PlatformChatbot';
import { DomainSurvey } from '@/components/agents/DomainSurvey';
import { useDomainContext } from '@/hooks/useDomainContext';

export const AppLayout: React.FC = () => {
  const { state: appState } = useAppState();
  const { state: uiState } = useUIState();
  const appActions = useAppActions();
  const uiActions = useUIActions();
  const { isAdmin, usesRemaining } = useUsageTracking();
  const { getLatestData, sources } = useRealtimeData();
  const domainContextHook = useDomainContext();
  const { showSurvey, setContext, closeSurvey, skipSurvey, getContextSummary, triggerSurvey } = domainContextHook;
  
  // Tutorial progress tracking
  const {
    shouldShowTutorial,
    shouldShowChecklist,
    markTutorialSeen,
    markTutorialCompleted,
    markDataUploaded,
    markChartCreated,
    markDashboardBuilt,
    markAIUsed,
    setActiveTab,
    progress
  } = useTutorialProgress();

  // Handle switching between real-time sources
  const handleSourceSwitch = (sourceId: string) => {
    const realtimeUpdate = getLatestData(sourceId);
    const source = sources.find(s => s.id === sourceId);
    
    if (realtimeUpdate && source) {
      console.log('🔄 Switching to source:', source.name);
      appActions.handleDataLoaded(
        realtimeUpdate.data,
        realtimeUpdate.columns || [],
        source.name,
        'realtime'
      );
    }
  };

  // Enhanced data loading handler with tutorial progress tracking
  const handleEnhancedDataLoaded = (loadedData: any[], loadedColumns: any[], fileName: string, source?: string) => {
    appActions.handleDataLoaded(loadedData, loadedColumns, fileName, source);
    if (loadedData.length > 0) {
      markDataUploaded();
    }
  };

  // Enhanced tile addition with tutorial progress tracking
  const handleEnhancedAddTile = (tileData: any) => {
    appActions.addTile(tileData);
    markChartCreated();
    if (appState.tiles.length === 0) { // First tile being added
      markDashboardBuilt();
    }
  };

  // Handle tutorial actions
  const handleTutorialActionClick = (targetTab: string) => {
    setActiveTab(targetTab);
    uiActions.setActiveTab(targetTab);
    // Scroll to tabs section
    const tabsSection = document.querySelector('[data-tabs-section]');
    if (tabsSection) {
      tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const displayFileName = appState.worksheetName 
    ? `${appState.fileName} - ${appState.worksheetName}` 
    : appState.fileName;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AppHeader isAdmin={isAdmin} usesRemaining={usesRemaining} />

        <div className="space-y-6">
          {/* Getting Started Checklist */}
          {shouldShowChecklist && (
            <GettingStartedChecklist
              hasData={appState.data.length > 0}
              hasCharts={appState.tiles.length > 0}
              hasDashboard={appState.tiles.length > 0}
              hasUsedAI={progress.hasUsedAI}
              onActionClick={handleTutorialActionClick}
            />
          )}

          {/* Active Source Indicator - shows when using real-time data */}
          <ActiveSourceIndicator 
            currentDatasetName={displayFileName}
            onSourceChange={handleSourceSwitch}
          />
          

          {/* Data Context Status Bar - only when data is loaded */}
          {appState.data.length > 0 && (
            <DataStatusBar
              displayFileName={displayFileName}
              dataLength={appState.data.length}
              columnsLength={appState.columns.length}
              realtimeEnabled={sources.length > 0}
              contextSummary={getContextSummary()}
              triggerSurvey={triggerSurvey}
              showSurvey={showSurvey}
            />
          )}

          {/* Always show DataTabsSection - users can access all features */}
          <div data-tabs-section>
            <DataTabsSection
              data={appState.data}
              columns={appState.columns}
              fileName={displayFileName}
              worksheetName={appState.worksheetName || ''}
              tiles={appState.tiles}
              filters={appState.filters}
              currentDatasetId={appState.currentDatasetId}
              showContextSetup={appState.showContextSetup}
              selectedDataSource={uiState.selectedDataSource}
              showDataSourceDialog={uiState.showDataSourceDialog}
              onAddTile={handleEnhancedAddTile}
              onRemoveTile={appActions.removeTile}
              onUpdateTile={appActions.updateTile}
              onFiltersChange={appActions.setFilters}
              onLoadDashboard={appActions.handleLoadDashboard}
              onContextReady={appActions.handleContextReady}
              onSkipContext={appActions.handleSkipContext}
              onColumnTypeChange={appActions.handleColumnTypeChange}
              onDataSourceSelect={uiActions.setSelectedDataSource}
              onDataSourceDialogChange={uiActions.setShowDataSourceDialog}
              onDataLoaded={handleEnhancedDataLoaded}
              onAIUsed={markAIUsed}
            />
          </div>
        </div>
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={shouldShowTutorial}
        onClose={markTutorialSeen}
        onComplete={markTutorialCompleted}
      />
      
      {/* Platform Chatbot */}
      <PlatformChatbot />
      
      {/* Domain Survey Modal */}
      <DomainSurvey
        open={showSurvey}
        onClose={closeSurvey}
        onComplete={(context) => {
          setContext(context, appState.fileName, appState.worksheetName);
        }}
        onSkip={skipSurvey}
      />
    </div>
  );
};
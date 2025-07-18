import React, { useState, useCallback } from 'react';
import { DataTabsSection } from '@/components/data-tabs/DataTabsSection';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useOnboardingState } from '@/contexts/OnboardingContext';
import { useAppState } from '@/contexts/AppStateContext';
import { Header } from './Header';
import { StatusBar } from './StatusBar';

export const AppLayout = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [fileName, setFileName] = useState<string>('dataset');
  const [tiles, setTiles] = useState<DashboardTileData[]>([]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('');
  const [showContextSetup, setShowContextSetup] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);

  const { toast } = useToast();
  const { onboardingCompleted } = useOnboardingState();
  const { hasUsedAI } = useAppState();

  const handleAddTile = (tileData: DashboardTileData) => {
    setTiles(prevTiles => [...prevTiles, tileData]);
  };

  const handleRemoveTile = (tileId: string) => {
    setTiles(prevTiles => prevTiles.filter(tile => tile.id !== tileId));
  };

  const handleUpdateTile = (tileId: string, updates: Partial<DashboardTileData>) => {
    setTiles(prevTiles =>
      prevTiles.map(tile => (tile.id === tileId ? { ...tile, ...updates } : tile))
    );
  };

  const handleFiltersChange = (newFilters: FilterCondition[]) => {
    setFilters(newFilters);
  };

  const handleContextReady = () => {
    setShowContextSetup(false);
  };

  const handleSkipContext = () => {
    setShowContextSetup(false);
  };

  const handleColumnTypeChange = (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => {
    setColumns(prevColumns =>
      prevColumns.map(column =>
        column.name === columnName ? { ...column, type: newType } : column
      )
    );
  };

  const handleDataSourceSelect = (source: string) => {
    setSelectedDataSource(source);
  };

  const handleDataLoaded = (loadedData: DataRow[], loadedColumns: ColumnInfo[], loadedFileName: string, source?: string) => {
    setData(loadedData);
    setColumns(loadedColumns);
    setFileName(loadedFileName);
    setSelectedDataSource(source || '');
    setCurrentDatasetId('initial-dataset');

    toast({
      title: "Data Loaded",
      description: `Successfully loaded ${loadedFileName}`,
      action: <ToastAction altText="Goto charts">View charts</ToastAction>,
    })
  };

  const handleAIUsed = useCallback(() => {
    toast({
      title: "AI Used",
      description: "Thank you for trying our AI features!",
    });
  }, [toast]);

  const handleLoadDashboard = (dashboardData: { 
    tiles: DashboardTileData[]; 
    filters: FilterCondition[]; 
    data?: DataRow[]; 
    columns?: ColumnInfo[] 
  }) => {
    setTiles(dashboardData.tiles);
    setFilters(dashboardData.filters);
    if (dashboardData.data && dashboardData.columns) {
      setData(dashboardData.data);
      setColumns(dashboardData.columns);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <StatusBar 
            fileName={fileName} 
            rowCount={data.length} 
            columnCount={columns.length} 
          />

          <div className="flex-1 overflow-hidden">
            <DataTabsSection
              data={data}
              columns={columns}
              fileName={fileName}
              tiles={tiles}
              filters={filters}
              currentDatasetId={currentDatasetId}
              showContextSetup={showContextSetup}
              selectedDataSource={selectedDataSource}
              showDataSourceDialog={showDataSourceDialog}
              onAddTile={handleAddTile}
              onRemoveTile={handleRemoveTile}
              onUpdateTile={handleUpdateTile}
              onFiltersChange={handleFiltersChange}
              onLoadDashboard={handleLoadDashboard}
              onContextReady={handleContextReady}
              onSkipContext={handleSkipContext}
              onColumnTypeChange={handleColumnTypeChange}
              onDataSourceSelect={handleDataSourceSelect}
              onDataSourceDialogChange={setShowDataSourceDialog}
              onDataLoaded={handleDataLoaded}
              onAIUsed={handleAIUsed}
            />
          </div>
        </div>
      </main>

      {!onboardingCompleted && (
        <OnboardingChecklist
          hasData={data.length > 0}
          hasCharts={tiles.length > 0}
          hasDashboard={tiles.length > 1}
          hasUsedAI={hasUsedAI}
          onDismiss={() => {
            toast({
              title: "Getting Started Dismissed",
              description: "You can always access the checklist from the help menu.",
            });
          }}
        />
      )}

      <FeedbackForm />
    </div>
  );
};

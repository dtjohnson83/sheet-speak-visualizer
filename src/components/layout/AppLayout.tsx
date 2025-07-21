import React, { useState, useCallback } from 'react';
import { DataTabsSection } from '@/components/data-tabs/DataTabsSection';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useAppState } from '@/contexts/AppStateContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { state } = useAppState();
  const isMobile = useIsMobile();

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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold truncate">
              {isMobile ? 'Chartuvo' : 'Data Analytics Platform'}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="border-b px-4 py-2 bg-muted/30">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="truncate max-w-[150px] md:max-w-none">{fileName}</span>
              <span className="whitespace-nowrap">
                {data.length} rows{isMobile ? '' : ` • ${columns.length} columns`}
              </span>
            </div>
          </div>

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
    </div>
  );
};

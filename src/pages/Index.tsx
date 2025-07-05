
import { useDashboard } from '@/hooks/useDashboard';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useDataManagement } from '@/hooks/useDataManagement';
import { DataManagementSection } from '@/components/data-management/DataManagementSection';
import { DataTabsSection } from '@/components/data-tabs/DataTabsSection';
import { AppHeader } from '@/components/layout/AppHeader';
import { RealtimeDataConfig } from '@/components/realtime/RealtimeDataConfig';
import { RealtimeDashboardControls } from '@/components/realtime/RealtimeDashboardControls';

export interface DataRow {
  [key: string]: any;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'date' | 'categorical' | 'text';
  values: any[];
}

const Index = () => {
  const {
    data,
    columns,
    fileName,
    worksheetName,
    currentDatasetId,
    showContextSetup,
    selectedDataSource,
    showDataSourceDialog,
    displayFileName,
    setData,
    setColumns,
    handleDataLoaded,
    handleColumnTypeChange,
    handleLoadDataset,
    handleContextReady,
    handleSkipContext,
    setSelectedDataSource,
    setShowDataSourceDialog,
  } = useDataManagement();

  const { tiles, addTile, removeTile, updateTile, filters, setFilters, enableRealtime, disableRealtime, realtimeEnabled } = useDashboard();
  const { isAdmin, usesRemaining } = useUsageTracking();
  
  // Initialize session monitoring
  useSessionMonitor();

  const handleLoadDashboard = (
    loadedTiles: any[], 
    loadedFilters: any[], 
    loadedData?: DataRow[], 
    loadedColumns?: ColumnInfo[]
  ) => {
    console.log('Loading dashboard with tiles:', loadedTiles);
    
    // Clear existing tiles and load new ones
    tiles.forEach(tile => removeTile(tile.id));
    
    // Add loaded tiles
    loadedTiles.forEach(tile => {
      addTile({
        title: tile.title,
        chartType: tile.chartType,
        xColumn: tile.xColumn,
        yColumn: tile.yColumn,
        stackColumn: tile.stackColumn,
        sankeyTargetColumn: tile.sankeyTargetColumn,
        valueColumn: tile.valueColumn,
        sortColumn: tile.sortColumn,
        sortDirection: tile.sortDirection,
        series: tile.series,
        showDataLabels: tile.showDataLabels
      });
    });
    
    // Load filters
    setFilters(loadedFilters);
    
    // Load associated dataset if available
    if (loadedData && loadedColumns) {
      setData(loadedData);
      setColumns(loadedColumns);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <AppHeader isAdmin={isAdmin} usesRemaining={usesRemaining} />

        <div className="space-y-6">
          <DataManagementSection
            data={data}
            columns={columns}
            fileName={fileName}
            worksheetName={worksheetName}
            selectedDataSource={selectedDataSource}
            showDataSourceDialog={showDataSourceDialog}
            onDataLoaded={handleDataLoaded}
            onLoadDataset={handleLoadDataset}
            onDataSourceSelect={setSelectedDataSource}
            onDataSourceDialogChange={setShowDataSourceDialog}
          />

          {data.length > 0 && (
            <>
              {/* Real-time Dashboard Controls */}
              <RealtimeDashboardControls />

              {/* Data Context Status Bar */}
              <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Dataset Active</span>
                      {realtimeEnabled && (
                        <div className="flex items-center gap-1 ml-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-blue-600">Real-time</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {displayFileName} • {data.length.toLocaleString()} rows • {columns.length} columns
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Use Ctrl+1-8 for quick tab navigation</span>
                  </div>
                </div>
              </div>

              <DataTabsSection
                data={data}
                columns={columns}
                fileName={displayFileName}
                tiles={tiles}
                filters={filters}
                currentDatasetId={currentDatasetId}
                showContextSetup={showContextSetup}
                onAddTile={addTile}
                onRemoveTile={removeTile}
                onUpdateTile={updateTile}
                onFiltersChange={setFilters}
              onLoadDashboard={handleLoadDashboard}
              onContextReady={handleContextReady}
              onSkipContext={handleSkipContext}
              onColumnTypeChange={handleColumnTypeChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

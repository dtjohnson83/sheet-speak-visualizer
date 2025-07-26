import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { DashboardManager } from '@/components/dashboard/DashboardManager';
import { DatasetSelector } from '@/components/agents/DatasetSelector';
import { useDatasetSelection } from '@/hooks/useDatasetSelection';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';

interface TabContentDashboardProps {
  data: DataRow[];
  columns: ColumnInfo[];
  tiles: DashboardTileData[];
  filters: FilterCondition[];
  currentDatasetId: string;
  onRemoveTile: (id: string) => void;
  onUpdateTile: (id: string, updates: any) => void;
  onFiltersChange: (filters: FilterCondition[]) => void;
  onLoadDashboard: (tiles: any[], filters: any[], data?: DataRow[], columns?: ColumnInfo[]) => void;
}

export const TabContentDashboard: React.FC<TabContentDashboardProps> = ({
  data,
  columns,
  tiles,
  filters,
  currentDatasetId,
  onRemoveTile,
  onUpdateTile,
  onFiltersChange,
  onLoadDashboard
}) => {
  const {
    selectedDataset,
    availableDatasets,
    selectDataset,
    hasDatasets
  } = useDatasetSelection(data, columns);

  // Use selected dataset data or fallback to props
  const activeData = selectedDataset?.data || data;
  const activeColumns = selectedDataset?.columns || columns;

  return (
    <TabsContent value="dashboard" className="space-y-4">
      {hasDatasets && (
        <Card className="p-4">
          <DatasetSelector
            value={selectedDataset?.id || ''}
            onValueChange={selectDataset}
            contextLabel="Select dataset for dashboard"
            placeholder="Choose a dataset for dashboard tiles..."
          />
        </Card>
      )}
      
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
        data={activeData}
        columns={activeColumns}
        onRemoveTile={onRemoveTile}
        onUpdateTile={onUpdateTile}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    </TabsContent>
  );
};
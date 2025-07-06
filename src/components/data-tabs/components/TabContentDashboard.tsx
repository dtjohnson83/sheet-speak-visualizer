import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { DashboardManager } from '@/components/dashboard/DashboardManager';
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
  return (
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
  );
};
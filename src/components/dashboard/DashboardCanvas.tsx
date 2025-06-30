
import { Card } from '@/components/ui/card';
import { DashboardTile, DashboardTileData } from './DashboardTile';
import { DashboardHeader } from './DashboardHeader';
import { EmptyDashboard } from './EmptyDashboard';
import { DashboardFilters, FilterCondition } from './DashboardFilters';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { applyFilters } from '@/lib/dataFilters';

interface DashboardCanvasProps {
  tiles: DashboardTileData[];
  data: DataRow[];
  columns: ColumnInfo[];
  onRemoveTile: (id: string) => void;
  onUpdateTile?: (id: string, updates: { position?: { x: number; y: number }; size?: { width: number; height: number } }) => void;
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
}

export const DashboardCanvas = ({ 
  tiles, 
  data, 
  columns, 
  onRemoveTile, 
  onUpdateTile,
  filters,
  onFiltersChange
}: DashboardCanvasProps) => {
  // Apply filters to data before passing to tiles
  const filteredData = applyFilters(data, filters);

  return (
    <Card className="p-6 min-h-[600px] bg-gray-50 dark:bg-gray-900 relative overflow-auto">
      <DashboardHeader tiles={tiles} />
      
      {data.length > 0 && (
        <DashboardFilters
          columns={columns}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      )}
      
      <div className="relative w-full p-8" style={{ minHeight: '500px' }} data-dashboard-canvas>
        {tiles.map((tile) => (
          <DashboardTile
            key={tile.id}
            tile={tile}
            data={filteredData}
            columns={columns}
            onRemove={onRemoveTile}
            onUpdate={onUpdateTile}
          />
        ))}
        
        {tiles.length === 0 && <EmptyDashboard />}
      </div>
    </Card>
  );
};

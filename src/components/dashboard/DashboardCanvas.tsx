
import { Card } from '@/components/ui/card';
import { DashboardTile, DashboardTileData } from './DashboardTile';
import { DashboardHeader } from './DashboardHeader';
import { EmptyDashboard } from './EmptyDashboard';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DashboardCanvasProps {
  tiles: DashboardTileData[];
  data: DataRow[];
  columns: ColumnInfo[];
  onRemoveTile: (id: string) => void;
  onUpdateTile?: (id: string, updates: { position?: { x: number; y: number }; size?: { width: number; height: number } }) => void;
}

export const DashboardCanvas = ({ 
  tiles, 
  data, 
  columns, 
  onRemoveTile, 
  onUpdateTile 
}: DashboardCanvasProps) => {
  return (
    <Card className="p-4 min-h-[600px] bg-gray-50 relative overflow-auto">
      <DashboardHeader tiles={tiles} />
      
      <div className="relative w-full" style={{ minHeight: '500px' }} data-dashboard-canvas>
        {tiles.map((tile) => (
          <DashboardTile
            key={tile.id}
            tile={tile}
            data={data}
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


import { Card } from '@/components/ui/card';
import { DashboardTile, DashboardTileData } from './DashboardTile';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DashboardCanvasProps {
  tiles: DashboardTileData[];
  data: DataRow[];
  columns: ColumnInfo[];
  onRemoveTile: (id: string) => void;
  onMoveTile?: (id: string, position: { x: number; y: number }) => void;
}

export const DashboardCanvas = ({ 
  tiles, 
  data, 
  columns, 
  onRemoveTile, 
  onMoveTile 
}: DashboardCanvasProps) => {
  return (
    <Card className="p-4 min-h-[600px] bg-gray-50 relative overflow-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Dashboard</h3>
        <p className="text-sm text-gray-600">
          {tiles.length === 0 
            ? "Save visualizations as tiles to build your dashboard" 
            : `${tiles.length} tile${tiles.length !== 1 ? 's' : ''} in dashboard • Drag tiles to rearrange`
          }
        </p>
      </div>
      
      <div className="relative w-full" style={{ minHeight: '500px' }}>
        {tiles.map((tile) => (
          <DashboardTile
            key={tile.id}
            tile={tile}
            data={data}
            columns={columns}
            onRemove={onRemoveTile}
            onMove={onMoveTile}
          />
        ))}
        
        {tiles.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
            <p>Your dashboard tiles will appear here</p>
          </div>
        )}
      </div>
    </Card>
  );
};

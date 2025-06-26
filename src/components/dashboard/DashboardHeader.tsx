
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DashboardTileData } from './DashboardTile';
import { exportDashboardToScreenshot } from '@/utils/screenshotExport';

interface DashboardHeaderProps {
  tiles: DashboardTileData[];
}

export const DashboardHeader = ({ tiles }: DashboardHeaderProps) => {
  const handleScreenshotExport = () => {
    exportDashboardToScreenshot(tiles);
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Dashboard</h3>
        <p className="text-sm text-gray-600">
          {tiles.length === 0 
            ? "Save visualizations as tiles to build your dashboard" 
            : `${tiles.length} tile${tiles.length !== 1 ? 's' : ''} in dashboard • Drag tiles to rearrange • Drag corner to resize`
          }
        </p>
      </div>
      
      {tiles.length > 0 && (
        <Button
          onClick={handleScreenshotExport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Screenshot
        </Button>
      )}
    </div>
  );
};

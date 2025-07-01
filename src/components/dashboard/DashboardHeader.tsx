
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

  if (tiles.length === 0) return null;

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h4 className="text-lg font-medium">Dashboard View</h4>
        <p className="text-sm text-gray-600">
          {tiles.length} tile{tiles.length !== 1 ? 's' : ''}
        </p>
      </div>
      <Button 
        onClick={handleScreenshotExport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        data-export-exclude="true"
        disabled
      >
        <Download className="w-4 h-4" />
        Export (Coming Soon)
      </Button>
    </div>
  );
};

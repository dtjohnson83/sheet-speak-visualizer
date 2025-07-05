
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Download, Image, FileImage, FileText } from 'lucide-react';
import { DashboardTileData } from './DashboardTile';
import { exportDashboardToPNG, exportDashboardToSVG, exportDashboardToPDF } from '@/utils/pdf/dashboardExport';

interface DashboardHeaderProps {
  tiles: DashboardTileData[];
}

export const DashboardHeader = ({ tiles }: DashboardHeaderProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    setIsExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `dashboard-${timestamp}`;

      switch (format) {
        case 'png':
          await exportDashboardToPNG(tiles, `${fileName}.png`);
          toast({
            title: "PNG Export Successful",
            description: "Dashboard exported as PNG image.",
          });
          break;
        case 'svg':
          await exportDashboardToSVG(tiles, `${fileName}.svg`);
          toast({
            title: "SVG Export Successful", 
            description: "Dashboard exported as SVG vector image.",
          });
          break;
        case 'pdf':
          await exportDashboardToPDF(tiles, `${fileName}.pdf`);
          toast({
            title: "PDF Export Successful",
            description: "Dashboard exported as PDF document.",
          });
          break;
      }
    } catch (error) {
      console.error(`Error exporting dashboard as ${format}:`, error);
      toast({
        title: "Export Failed",
        description: `Failed to export dashboard as ${format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            className="flex items-center gap-2"
            data-export-exclude="true"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Dashboard'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('png')}>
            <Image className="h-4 w-4 mr-2" />
            PNG Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('svg')}>
            <FileImage className="h-4 w-4 mr-2" />
            SVG Vector
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            PDF Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

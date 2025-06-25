
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DashboardTile, DashboardTileData } from './DashboardTile';
import { DataRow, ColumnInfo } from '@/pages/Index';
import jsPDF from 'jspdf';

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
  const exportToPDF = async () => {
    if (tiles.length === 0) return;

    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Dashboard Export', 20, 20);
    
    // Add timestamp
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    // Capture dashboard area
    const dashboardElement = document.querySelector('[data-dashboard-canvas]') as HTMLElement;
    
    if (dashboardElement) {
      try {
        // Use html2canvas if available, otherwise create a simple text-based export
        const canvas = await import('html2canvas').then(module => 
          module.default(dashboardElement, {
            scale: 0.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#f9fafb'
          })
        ).catch(() => null);
        
        if (canvas) {
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (imgHeight > pageHeight - 60) {
            // If image is too tall, scale it down
            const scaledHeight = pageHeight - 60;
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            pdf.addImage(imgData, 'PNG', 20, 40, scaledWidth, scaledHeight);
          } else {
            pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
          }
        } else {
          // Fallback to text-based export
          let yPosition = 50;
          pdf.setFontSize(14);
          pdf.text('Dashboard Tiles:', 20, yPosition);
          yPosition += 10;
          
          tiles.forEach((tile, index) => {
            pdf.setFontSize(12);
            pdf.text(`${index + 1}. ${tile.title}`, 30, yPosition);
            yPosition += 8;
            pdf.setFontSize(10);
            pdf.text(`   Chart Type: ${tile.chartType}`, 30, yPosition);
            yPosition += 6;
            pdf.text(`   X-Axis: ${tile.xColumn}, Y-Axis: ${tile.yColumn}`, 30, yPosition);
            yPosition += 10;
            
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }
          });
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback to simple text export
        let yPosition = 50;
        pdf.setFontSize(14);
        pdf.text('Dashboard Tiles:', 20, yPosition);
        yPosition += 10;
        
        tiles.forEach((tile, index) => {
          pdf.setFontSize(12);
          pdf.text(`${index + 1}. ${tile.title}`, 30, yPosition);
          yPosition += 8;
          pdf.setFontSize(10);
          pdf.text(`   Chart Type: ${tile.chartType}`, 30, yPosition);
          yPosition += 6;
          pdf.text(`   X-Axis: ${tile.xColumn}, Y-Axis: ${tile.yColumn}`, 30, yPosition);
          yPosition += 10;
          
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
    }
    
    // Save the PDF
    pdf.save(`dashboard-export-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card className="p-4 min-h-[600px] bg-gray-50 relative overflow-auto">
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
            onClick={exportToPDF}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        )}
      </div>
      
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
        
        {tiles.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
            <p>Your dashboard tiles will appear here</p>
          </div>
        )}
      </div>
    </Card>
  );
};

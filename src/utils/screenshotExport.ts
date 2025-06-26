
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const exportDashboardToScreenshot = async (tiles: DashboardTileData[]) => {
  if (tiles.length === 0) return;

  const dashboardElement = document.querySelector('[data-dashboard-canvas]') as HTMLElement;
  
  if (dashboardElement) {
    try {
      // Use html2canvas to capture the dashboard
      const canvas = await import('html2canvas').then(module => 
        module.default(dashboardElement, {
          scale: 2, // High quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: dashboardElement.scrollWidth,
          height: dashboardElement.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          ignoreElements: (element) => {
            // Ignore buttons and resize handles in screenshot
            return element.classList.contains('opacity-0') || 
                   element.classList.contains('group-hover:opacity-100');
          }
        })
      ).catch(() => null);
      
      if (canvas) {
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            link.download = `dashboard-screenshot-${timestamp}.png`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
          }
        }, 'image/png', 1.0);
      } else {
        console.error('Failed to capture dashboard screenshot');
      }
    } catch (error) {
      console.error('Error generating screenshot:', error);
    }
  }
};


import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const exportDashboardToScreenshot = async (tiles: DashboardTileData[]) => {
  if (tiles.length === 0) return;

  // Try to find the main dashboard card first, then fall back to canvas
  const dashboardCard = document.querySelector('[data-dashboard-canvas]')?.parentElement;
  const dashboardElement = (dashboardCard || document.querySelector('[data-dashboard-canvas]')) as HTMLElement;
  
  if (dashboardElement) {
    try {
      // Calculate dynamic padding based on tile positions and content
      const calculateDynamicPadding = () => {
        const minTileY = Math.min(...tiles.map(tile => tile.position.y));
        const maxTileBottom = Math.max(...tiles.map(tile => tile.position.y + tile.size.height));
        
        // Base padding for headers, filters, and general spacing
        const basePadding = 60;
        
        // Additional padding if tiles are positioned high (to capture titles)
        const titlePadding = minTileY < 50 ? 40 : 20;
        
        // Extra padding for bottom to ensure full capture
        const bottomPadding = 40;
        
        return {
          top: basePadding + titlePadding,
          bottom: bottomPadding,
          horizontal: 40
        };
      };

      const padding = calculateDynamicPadding();
      
      // Get the actual dimensions we need to capture
      const elementRect = dashboardElement.getBoundingClientRect();
      const scrollWidth = dashboardElement.scrollWidth || elementRect.width;
      const scrollHeight = dashboardElement.scrollHeight || elementRect.height;
      
      console.log('Export dimensions:', {
        elementRect,
        scrollWidth,
        scrollHeight,
        padding,
        tilesCount: tiles.length
      });

      // Use html2canvas to capture the dashboard
      const canvas = await import('html2canvas').then(module => 
        module.default(dashboardElement, {
          scale: 2, // High quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: scrollWidth + (padding.horizontal * 2),
          height: scrollHeight + padding.top + padding.bottom,
          x: -padding.horizontal,
          y: -padding.top,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          ignoreElements: (element) => {
            // Ignore interactive elements that shouldn't appear in screenshot
            return element.classList.contains('opacity-0') || 
                   element.classList.contains('group-hover:opacity-100') ||
                   element.tagName === 'BUTTON' && (
                     element.textContent?.includes('×') || 
                     element.textContent?.includes('Move') ||
                     element.classList.contains('resize-handle')
                   );
          }
        })
      ).catch((error) => {
        console.error('html2canvas error:', error);
        return null;
      });
      
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
            
            console.log('Screenshot exported successfully');
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

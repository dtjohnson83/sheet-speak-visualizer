
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const exportDashboardToScreenshot = async (tiles: DashboardTileData[]) => {
  if (tiles.length === 0) return;

  // Target the main dashboard container with data-export-container
  const dashboardElement = document.querySelector('[data-export-container]') as HTMLElement;
  
  if (dashboardElement) {
    try {
      // Calculate generous padding to ensure all titles and content are captured
      const calculatePadding = () => {
        const minTileY = Math.min(...tiles.map(tile => tile.position.y));
        
        // Very generous top padding to ensure titles are captured
        // Dashboard headers, filters, and tile titles need significant space
        const topPadding = 120; // Increased from previous values
        
        // Add extra if tiles are positioned very high
        const extraTopPadding = minTileY < 100 ? 60 : 0;
        
        return {
          top: topPadding + extraTopPadding,
          bottom: 60,
          horizontal: 60
        };
      };

      const padding = calculatePadding();
      
      // Get container dimensions
      const elementRect = dashboardElement.getBoundingClientRect();
      const scrollWidth = dashboardElement.scrollWidth || elementRect.width;
      const scrollHeight = dashboardElement.scrollHeight || elementRect.height;
      
      console.log('Export dimensions:', {
        elementRect,
        scrollWidth,
        scrollHeight,
        padding,
        tilesCount: tiles.length,
        minTileY: Math.min(...tiles.map(tile => tile.position.y))
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
            // Comprehensive exclusion of interactive elements
            const isButton = element.tagName === 'BUTTON';
            const hasExportExclude = element.hasAttribute('data-export-exclude');
            const isHoverElement = element.classList.contains('opacity-0') || 
                                 element.classList.contains('group-hover:opacity-100');
            const isResizeHandle = element.classList.contains('resize-handle') ||
                                 element.classList.contains('absolute') && 
                                 (element.classList.contains('bottom-0') || element.classList.contains('right-0'));
            const isInteractiveButton = isButton && (
              element.textContent?.includes('×') || 
              element.textContent?.includes('Move') ||
              element.textContent?.includes('Export') ||
              element.getAttribute('aria-label')?.includes('remove') ||
              element.getAttribute('aria-label')?.includes('close')
            );
            
            return hasExportExclude || isHoverElement || isResizeHandle || isInteractiveButton;
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
  } else {
    console.error('Dashboard container not found for export');
  }
};

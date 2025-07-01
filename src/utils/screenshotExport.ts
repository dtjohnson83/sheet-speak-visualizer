
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

// Wait for all charts to be ready for export
const waitForChartsReady = async (container: HTMLElement): Promise<boolean> => {
  const maxWaitTime = 5000; // 5 seconds max
  const checkInterval = 100; // Check every 100ms
  let waitTime = 0;

  return new Promise((resolve) => {
    const checkReadiness = () => {
      const chartElements = container.querySelectorAll('.recharts-wrapper');
      const allChartsReady = Array.from(chartElements).every(chart => {
        const svg = chart.querySelector('svg');
        return svg && svg.children.length > 0 && chart.getBoundingClientRect().width > 0;
      });

      if (allChartsReady || waitTime >= maxWaitTime) {
        resolve(allChartsReady);
      } else {
        waitTime += checkInterval;
        setTimeout(checkReadiness, checkInterval);
      }
    };

    checkReadiness();
  });
};

export const exportDashboardToScreenshot = async (tiles: DashboardTileData[]) => {
  if (tiles.length === 0) return;

  // Target the export container
  const dashboardElement = document.querySelector('[data-export-container]') as HTMLElement;
  
  if (dashboardElement) {
    try {
      // Wait for charts to be ready before starting export
      console.log('Waiting for charts to be ready...');
      const chartsReady = await waitForChartsReady(dashboardElement);
      
      if (!chartsReady) {
        console.warn('Charts may not be fully loaded for export');
      }

      // Simple, reliable padding
      const padding = {
        top: 100,
        bottom: 50,
        horizontal: 50
      };
      
      // Get container dimensions
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

      // Add a small delay to ensure React components are settled
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use html2canvas to capture the dashboard
      const canvas = await import('html2canvas').then(module => 
        module.default(dashboardElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true,
          backgroundColor: '#ffffff',
          width: scrollWidth + (padding.horizontal * 2),
          height: scrollHeight + padding.top + padding.bottom,
          x: -padding.horizontal,
          y: -padding.top,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          onclone: (clonedDoc) => {
            // Ensure all SVG elements and charts are visible in the clone
            const svgElements = clonedDoc.querySelectorAll('svg');
            svgElements.forEach(svg => {
              svg.style.visibility = 'visible';
              svg.style.display = 'block';
            });
            
            // Ensure chart containers are visible
            const chartContainers = clonedDoc.querySelectorAll('.recharts-wrapper');
            chartContainers.forEach(container => {
              const element = container as HTMLElement;
              element.style.visibility = 'visible';
              element.style.display = 'block';
            });
          },
          ignoreElements: (element) => {
            // Filter out interactive and UI elements
            const isButton = element.tagName === 'BUTTON';
            const hasExportExclude = element.hasAttribute('data-export-exclude');
            const isHoverElement = element.classList.contains('opacity-0') || 
                                 element.classList.contains('group-hover:opacity-100');
            const isResizeHandle = element.classList.contains('resize-handle');
            const isFilter = !!element.closest('[data-export-exclude]');
            const isInteractiveButton = isButton && (
              element.textContent?.includes('×') || 
              element.textContent?.includes('Export') ||
              element.getAttribute('aria-label')?.includes('remove')
            );
            
            return hasExportExclude || isHoverElement || isResizeHandle || isFilter || isInteractiveButton;
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

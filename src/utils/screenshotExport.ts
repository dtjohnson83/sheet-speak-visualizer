
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const exportDashboardToScreenshot = async (tiles: DashboardTileData[]) => {
  if (tiles.length === 0) return;

  // Target the main dashboard container with data-export-container
  const dashboardElement = document.querySelector('[data-export-container]') as HTMLElement;
  
  if (dashboardElement) {
    try {
      // Enhanced padding calculation based on actual title elements
      const calculateDynamicPadding = () => {
        const minTileY = Math.min(...tiles.map(tile => tile.position.y));
        
        // Measure all title elements in the dashboard
        const titleElements = dashboardElement.querySelectorAll('.chart-title, .tile-title, h3, h4');
        const dashboardHeaders = dashboardElement.querySelectorAll('h3, .text-lg');
        
        let maxTitleHeight = 0;
        let highestTitleTop = Number.MAX_SAFE_INTEGER;
        
        titleElements.forEach(title => {
          const rect = title.getBoundingClientRect();
          const containerRect = dashboardElement.getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top;
          
          maxTitleHeight = Math.max(maxTitleHeight, rect.height);
          highestTitleTop = Math.min(highestTitleTop, relativeTop);
        });
        
        // Base padding ensuring all content is captured
        const basePadding = 150;
        
        // Additional padding based on measured elements
        const titlePadding = maxTitleHeight > 0 ? Math.max(80, maxTitleHeight + 40) : 80;
        const positionPadding = highestTitleTop < 50 ? 100 : 60;
        const extraTopPadding = minTileY < 100 ? 80 : 0;
        
        const totalTopPadding = Math.max(basePadding, titlePadding + positionPadding + extraTopPadding);
        
        console.log('Dynamic padding calculation:', {
          basePadding,
          titlePadding,
          positionPadding,
          extraTopPadding,
          totalTopPadding,
          maxTitleHeight,
          highestTitleTop,
          minTileY
        });
        
        return {
          top: totalTopPadding,
          bottom: 80,
          horizontal: 80
        };
      };

      const padding = calculateDynamicPadding();
      
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

      // Pre-export DOM modifications for better title capture
      const applyExportStyles = () => {
        const style = document.createElement('style');
        style.id = 'export-title-styles';
        style.textContent = `
          .chart-title, .tile-title, h3, h4 {
            white-space: nowrap !important;
            overflow: visible !important;
            text-overflow: unset !important;
            max-width: none !important;
            line-height: 1.5 !important;
            margin-bottom: 8px !important;
          }
          .tile-title {
            font-size: 14px !important;
            font-weight: 500 !important;
          }
          .chart-title {
            font-size: 18px !important;
            font-weight: 500 !important;
          }
        `;
        document.head.appendChild(style);
        return style;
      };

      const exportStyleSheet = applyExportStyles();

      // Use html2canvas to capture the dashboard
      const canvas = await import('html2canvas').then(module => 
        module.default(dashboardElement, {
          scale: 2, // High quality
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true, // Better text rendering
          backgroundColor: '#ffffff',
          width: scrollWidth + (padding.horizontal * 2),
          height: scrollHeight + padding.top + padding.bottom,
          x: -padding.horizontal,
          y: -padding.top,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          onclone: (clonedDoc) => {
            // Ensure titles are fully visible in cloned document
            const clonedTitles = clonedDoc.querySelectorAll('.chart-title, .tile-title, h3, h4');
            clonedTitles.forEach(title => {
              const titleElement = title as HTMLElement;
              titleElement.style.whiteSpace = 'nowrap';
              titleElement.style.overflow = 'visible';
              titleElement.style.textOverflow = 'unset';
              titleElement.style.maxWidth = 'none';
              titleElement.style.position = 'relative';
              titleElement.style.zIndex = '1000';
            });
          },
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
        }).finally(() => {
          // Clean up export styles
          if (exportStyleSheet) {
            document.head.removeChild(exportStyleSheet);
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

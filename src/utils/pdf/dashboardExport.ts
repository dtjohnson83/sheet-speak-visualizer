import jsPDF from 'jspdf';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { createPDFConfig, addPDFHeader, addPDFFooter, waitForChartsReady } from './pdfUtils';

// PNG Export for Dashboard
export const exportDashboardToPNG = async (tiles: DashboardTileData[], fileName?: string) => {
  if (tiles.length === 0) return;
  
  const dashboardElement = document.querySelector('[data-export-container]') as HTMLElement;
  
  if (dashboardElement) {
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Wait for charts to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      const chartsReady = await waitForChartsReady(dashboardElement);
      
      if (!chartsReady) {
        console.warn('Charts may not be fully loaded for export');
      }

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        backgroundColor: '#ffffff',
        width: dashboardElement.scrollWidth,
        height: dashboardElement.scrollHeight,
        logging: false,
        onclone: (clonedDoc) => {
          const svgElements = clonedDoc.querySelectorAll('svg');
          svgElements.forEach(svg => {
            svg.style.visibility = 'visible';
            svg.style.display = 'block';
            svg.style.backgroundColor = '#ffffff';
          });
          
          const chartContainers = clonedDoc.querySelectorAll('.recharts-wrapper, .recharts-surface');
          chartContainers.forEach(container => {
            const element = container as HTMLElement;
            element.style.visibility = 'visible';
            element.style.display = 'block';
            element.style.backgroundColor = '#ffffff';
          });
        },
        ignoreElements: (element) => {
          const isButton = element.tagName === 'BUTTON';
          const hasExportExclude = element.hasAttribute('data-export-exclude');
          const isHoverElement = element.classList.contains('opacity-0') && 
                                !element.closest('.recharts-wrapper');
          const isResizeHandle = element.classList.contains('resize-handle');
          
          return hasExportExclude || isHoverElement || isResizeHandle || 
                 (isButton && (
                   element.textContent?.includes('×') || 
                   element.textContent?.includes('Export') ||
                   element.getAttribute('aria-label')?.includes('remove')
                 ));
        }
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          const timestamp = new Date().toISOString().split('T')[0];
          const defaultFileName = `dashboard-${timestamp}.png`;
          link.download = fileName || defaultFileName;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error exporting dashboard to PNG:', error);
      throw error;
    }
  }
};

// SVG Export for Dashboard
export const exportDashboardToSVG = async (tiles: DashboardTileData[], fileName?: string) => {
  if (tiles.length === 0) return;
  
  const dashboardElement = document.querySelector('[data-export-container]') as HTMLElement;
  
  if (dashboardElement) {
    try {
      // Find all SVG elements within the dashboard
      const svgElements = dashboardElement.querySelectorAll('svg');
      
      if (svgElements.length === 0) {
        throw new Error('No SVG elements found in dashboard');
      }
      
      // Create a container SVG that will hold all chart SVGs
      const containerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const dashboardRect = dashboardElement.getBoundingClientRect();
      
      containerSvg.setAttribute('width', dashboardRect.width.toString());
      containerSvg.setAttribute('height', dashboardRect.height.toString());
      containerSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      // Add each chart SVG to the container with proper positioning
      svgElements.forEach((svg, index) => {
        const clonedSvg = svg.cloneNode(true) as SVGElement;
        const svgRect = svg.getBoundingClientRect();
        const dashboardRect = dashboardElement.getBoundingClientRect();
        
        // Calculate relative position
        const x = svgRect.left - dashboardRect.left;
        const y = svgRect.top - dashboardRect.top;
        
        // Wrap in a group with transform
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${x}, ${y})`);
        
        // Set dimensions on the cloned SVG
        clonedSvg.setAttribute('width', svgRect.width.toString());
        clonedSvg.setAttribute('height', svgRect.height.toString());
        
        group.appendChild(clonedSvg);
        containerSvg.appendChild(group);
      });
      
      // Convert to string and download
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(containerSvg);
      
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFileName = `dashboard-${timestamp}.svg`;
      link.download = fileName || defaultFileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting dashboard to SVG:', error);
      throw error;
    }
  }
};

export const exportDashboardToPDF = async (tiles: DashboardTileData[], fileName?: string) => {
  if (tiles.length === 0) return;

  const pdf = new jsPDF('l', 'mm', 'a4');
  const config = createPDFConfig(pdf);
  const contentHeight = config.pageHeight - 140;
  
  // Add title and header
  addPDFHeader(pdf, config, 'Dashboard Export');
  
  // Add description
  pdf.setFontSize(11);
  pdf.text(`Dashboard contains ${tiles.length} visualization${tiles.length !== 1 ? 's' : ''}`, config.margin, 50);
  
  // Target the export container instead of canvas
  const dashboardElement = document.querySelector('[data-export-container]') as HTMLElement;
  
  if (dashboardElement) {
    try {
      // Wait for charts to be ready before starting export
      console.log('Waiting for charts to be ready...');
      const chartsReady = await waitForChartsReady(dashboardElement);
      
      if (!chartsReady) {
        console.warn('Charts may not be fully loaded for export');
      }

      // Add a small delay to ensure React components are settled
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use html2canvas with optimized settings for dashboard export
      const canvas = await import('html2canvas').then(module => 
        module.default(dashboardElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true,
          backgroundColor: '#ffffff',
          width: dashboardElement.scrollWidth,
          height: dashboardElement.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          onclone: (clonedDoc) => {
            // Ensure all SVG elements are visible in the clone
            const svgElements = clonedDoc.querySelectorAll('svg');
            svgElements.forEach(svg => {
              svg.style.visibility = 'visible';
              svg.style.display = 'block';
            });
          },
          ignoreElements: (element) => {
            // Comprehensive filtering of interactive elements
            const isButton = element.tagName === 'BUTTON';
            const hasExportExclude = element.hasAttribute('data-export-exclude');
            const isHoverElement = element.classList.contains('opacity-0') || 
                                 element.classList.contains('group-hover:opacity-100');
            const isResizeHandle = element.classList.contains('resize-handle');
            const isFilter = !!element.closest('[data-export-exclude]');
            
            return hasExportExclude || isHoverElement || isResizeHandle || isFilter ||
                   (isButton && (
                     element.textContent?.includes('×') || 
                     element.textContent?.includes('Export') ||
                     element.getAttribute('aria-label')?.includes('remove')
                   ));
          }
        })
      ).catch((error) => {
        console.error('html2canvas error:', error);
        return null;
      });
      
      if (canvas) {
        const imgData = canvas.toDataURL('image/png', 1.0); // High quality PNG
        
        // Calculate optimal image dimensions while maintaining aspect ratio
        const canvasAspectRatio = canvas.width / canvas.height;
        let imgWidth = config.contentWidth;
        let imgHeight = imgWidth / canvasAspectRatio;
        
        // If image height exceeds available space, scale down
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight;
          imgWidth = imgHeight * canvasAspectRatio;
        }
        
        // Center the image horizontally if it's smaller than content width
        const xOffset = config.margin + (config.contentWidth - imgWidth) / 2;
        
        // Start image even lower to ensure chart titles are not cut off (was 70, now 85)
        pdf.addImage(imgData, 'PNG', xOffset, 85, imgWidth, imgHeight);
        
        // Add footer with page info
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Exported from dashboard visualization tool`, 
                 config.margin, config.pageHeight - 10);
        
      } else {
        // Enhanced fallback to text-based export
        let yPosition = 95; // Increased starting position for fallback (was 80)
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Dashboard Tiles Summary:', config.margin, yPosition);
        yPosition += 15;
        
        tiles.forEach((tile, index) => {
          // Tile header
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${tile.title}`, config.margin + 5, yPosition);
          yPosition += 8;
          
          // Tile details
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Chart Type: ${tile.chartType.replace('-', ' ').toUpperCase()}`, config.margin + 10, yPosition);
          yPosition += 6;
          pdf.text(`X-Axis: ${tile.xColumn}`, config.margin + 10, yPosition);
          yPosition += 6;
          pdf.text(`Y-Axis: ${tile.yColumn}`, config.margin + 10, yPosition);
          yPosition += 6;
          
          if (tile.stackColumn) {
            pdf.text(`Stack By: ${tile.stackColumn}`, config.margin + 10, yPosition);
            yPosition += 6;
          }
          
          if (tile.series && tile.series.length > 0) {
            pdf.text(`Additional Series: ${tile.series.map(s => s.column).join(', ')}`, config.margin + 10, yPosition);
            yPosition += 6;
          }
          
          yPosition += 8; // Space between tiles
          
          // Check if we need a new page
          if (yPosition > config.pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Simple fallback
      pdf.setFontSize(14);
      pdf.text('Error generating visual export. Please try again.', config.margin, 85);
    }
  }
  
  // Save the PDF with a descriptive filename
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFileName = `dashboard-export-${timestamp}.pdf`;
  pdf.save(fileName || defaultFileName);
};
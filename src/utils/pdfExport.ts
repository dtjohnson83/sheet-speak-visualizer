
import jsPDF from 'jspdf';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

export const exportDashboardToPDF = async (tiles: DashboardTileData[]) => {
  if (tiles.length === 0) return;

  const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - 80; // Increased space for header and titles (was 60)
  
  // Add title with better spacing
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dashboard Export', margin, 25);
  
  // Add timestamp with better formatting
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, 35);
  
  // Add separator line
  pdf.setLineWidth(0.5);
  pdf.line(margin, 40, pageWidth - margin, 40);
  
  // Capture dashboard area
  const dashboardElement = document.querySelector('[data-dashboard-canvas]') as HTMLElement;
  
  if (dashboardElement) {
    try {
      // Use html2canvas with enhanced settings for better quality
      const canvas = await import('html2canvas').then(module => 
        module.default(dashboardElement, {
          scale: 1.5, // Increased scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff', // White background for better contrast
          width: dashboardElement.scrollWidth,
          height: dashboardElement.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          ignoreElements: (element) => {
            // Ignore buttons and resize handles in PDF export
            return element.classList.contains('opacity-0') || 
                   element.classList.contains('group-hover:opacity-100');
          }
        })
      ).catch(() => null);
      
      if (canvas) {
        const imgData = canvas.toDataURL('image/png', 1.0); // High quality PNG
        
        // Calculate optimal image dimensions while maintaining aspect ratio
        const canvasAspectRatio = canvas.width / canvas.height;
        let imgWidth = contentWidth;
        let imgHeight = imgWidth / canvasAspectRatio;
        
        // If image height exceeds available space, scale down
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight;
          imgWidth = imgHeight * canvasAspectRatio;
        }
        
        // Center the image horizontally if it's smaller than content width
        const xOffset = margin + (contentWidth - imgWidth) / 2;
        
        // Start image position lower to allow more space for titles (was 45)
        pdf.addImage(imgData, 'PNG', xOffset, 55, imgWidth, imgHeight);
        
        // Add footer with page info
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Dashboard contains ${tiles.length} visualization${tiles.length !== 1 ? 's' : ''}`, 
                 margin, pageHeight - 10);
        
      } else {
        // Enhanced fallback to text-based export
        let yPosition = 65; // Increased starting position
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Dashboard Tiles Summary:', margin, yPosition);
        yPosition += 15;
        
        tiles.forEach((tile, index) => {
          // Tile header
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${tile.title}`, margin + 5, yPosition);
          yPosition += 8;
          
          // Tile details
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Chart Type: ${tile.chartType.replace('-', ' ').toUpperCase()}`, margin + 10, yPosition);
          yPosition += 6;
          pdf.text(`X-Axis: ${tile.xColumn}`, margin + 10, yPosition);
          yPosition += 6;
          pdf.text(`Y-Axis: ${tile.yColumn}`, margin + 10, yPosition);
          yPosition += 6;
          
          if (tile.stackColumn) {
            pdf.text(`Stack By: ${tile.stackColumn}`, margin + 10, yPosition);
            yPosition += 6;
          }
          
          if (tile.series && tile.series.length > 0) {
            pdf.text(`Additional Series: ${tile.series.map(s => s.column).join(', ')}`, margin + 10, yPosition);
            yPosition += 6;
          }
          
          yPosition += 8; // Space between tiles
          
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Simple fallback
      pdf.setFontSize(14);
      pdf.text('Error generating visual export. Please try again.', margin, 60);
    }
  }
  
  // Save the PDF with a descriptive filename
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`dashboard-export-${timestamp}.pdf`);
};


import jsPDF from 'jspdf';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ReportData {
  report: string;
  metadata: {
    totalRows: number;
    totalColumns: number;
    columnTypes: Record<string, number>;
    dataCompleteness: Array<{ column: string; completeness: number }>;
    persona: string;
    generatedAt: string;
  };
}

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
        return svg && svg.children.length > 0;
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

export const exportDashboardToPDF = async (tiles: DashboardTileData[]) => {
  if (tiles.length === 0) return;

  const pdf = new jsPDF('l', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - 140;
  
  // Add title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dashboard Export', margin, 25);
  
  // Add timestamp
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, 35);
  
  // Add separator line
  pdf.setLineWidth(0.5);
  pdf.line(margin, 40, pageWidth - margin, 40);
  
  // Add description
  pdf.setFontSize(11);
  pdf.text(`Dashboard contains ${tiles.length} visualization${tiles.length !== 1 ? 's' : ''}`, margin, 50);
  
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
        let imgWidth = contentWidth;
        let imgHeight = imgWidth / canvasAspectRatio;
        
        // If image height exceeds available space, scale down
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight;
          imgWidth = imgHeight * canvasAspectRatio;
        }
        
        // Center the image horizontally if it's smaller than content width
        const xOffset = margin + (contentWidth - imgWidth) / 2;
        
        // Start image even lower to ensure chart titles are not cut off (was 70, now 85)
        pdf.addImage(imgData, 'PNG', xOffset, 85, imgWidth, imgHeight);
        
        // Add footer with page info
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Exported from dashboard visualization tool`, 
                 margin, pageHeight - 10);
        
      } else {
        // Enhanced fallback to text-based export
        let yPosition = 95; // Increased starting position for fallback (was 80)
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
      pdf.text('Error generating visual export. Please try again.', margin, 85);
    }
  }
  
  // Save the PDF with a descriptive filename
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`dashboard-export-${timestamp}.pdf`);
};

export const exportAIChatToPDF = async (messages: Message[], fileName?: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add header with logo and title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Chat Conversation Export', margin, 25);
  
  // Add timestamp and file info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, 35);
  if (fileName) {
    pdf.text(`Dataset: ${fileName}`, margin, 42);
  }
  
  // Add separator line
  pdf.setLineWidth(0.5);
  pdf.line(margin, 48, pageWidth - margin, 48);
  
  let yPosition = 60;
  const lineHeight = 6;
  const maxLineWidth = contentWidth - 20;
  
  // Filter out welcome messages and process chat
  const chatMessages = messages.filter(msg => msg.id !== 'welcome');
  
  chatMessages.forEach((message, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 25;
    }
    
    // Message header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const role = message.role === 'user' ? 'You' : 'AI Assistant';
    const timestamp = message.timestamp.toLocaleTimeString();
    pdf.text(`${role} - ${timestamp}`, margin + 5, yPosition);
    yPosition += 8;
    
    // Message content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(message.content, maxLineWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 25) {
        pdf.addPage();
        yPosition = 25;
      }
      pdf.text(line, margin + 10, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += 5; // Space between messages
  });
  
  // Add footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Chartuvo AI Chat Export - Page ${i} of ${totalPages}`, 
             margin, pageHeight - 10);
  }
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const filePrefix = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'chat';
  pdf.save(`ai-chat-${filePrefix}-${timestamp}.pdf`);
};

export const exportAIReportToPDF = async (reportData: ReportData, fileName?: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add header with logo and title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Analysis Report', margin, 25);
  
  // Add metadata
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date(reportData.metadata.generatedAt).toLocaleString()}`, margin, 35);
  if (fileName) {
    pdf.text(`Dataset: ${fileName}`, margin, 42);
  }
  pdf.text(`Analysis Perspective: ${reportData.metadata.persona.replace('_', ' ').toUpperCase()}`, margin, 49);
  
  // Add separator line
  pdf.setLineWidth(0.5);
  pdf.line(margin, 55, pageWidth - margin, 55);
  
  // Add executive summary section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, 70);
  
  // Add data overview
  let yPosition = 80;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const overview = [
    `Total Records: ${reportData.metadata.totalRows.toLocaleString()}`,
    `Columns Analyzed: ${reportData.metadata.totalColumns}`,
    `Data Completeness: ${Math.round(
      reportData.metadata.dataCompleteness.reduce((sum, dc) => sum + dc.completeness, 0) / 
      reportData.metadata.dataCompleteness.length
    )}%`,
    `Column Types: ${Object.entries(reportData.metadata.columnTypes).map(([type, count]) => `${count} ${type}`).join(', ')}`
  ];
  
  overview.forEach(line => {
    pdf.text(`• ${line}`, margin + 5, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Add main report content
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Analysis', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  // Split report content into lines
  const reportLines = pdf.splitTextToSize(reportData.report, contentWidth);
  const lineHeight = 5;
  
  reportLines.forEach((line: string) => {
    if (yPosition > pageHeight - 25) {
      pdf.addPage();
      yPosition = 25;
    }
    pdf.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  // Add data quality section if space
  if (yPosition < pageHeight - 50) {
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Data Quality Metrics', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    reportData.metadata.dataCompleteness.forEach(dc => {
      if (yPosition > pageHeight - 25) {
        pdf.addPage();
        yPosition = 25;
      }
      pdf.text(`${dc.column}: ${Math.round(dc.completeness)}% complete`, margin + 5, yPosition);
      yPosition += 5;
    });
  }
  
  // Add footer with page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Chartuvo AI Report - Page ${i} of ${totalPages}`, 
             margin, pageHeight - 10);
  }
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const filePrefix = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'report';
  pdf.save(`ai-report-${filePrefix}-${reportData.metadata.persona}-${timestamp}.pdf`);
};

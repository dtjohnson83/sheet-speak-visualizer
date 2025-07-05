import jsPDF from 'jspdf';
import { createPDFConfig, addPDFHeader, addPDFFooter } from '../pdfUtils';
import { waitForChartToRender } from './helpers';

export const exportChartToPDF = async (
  chartContainer: HTMLElement, 
  chartTitle: string,
  fileName?: string
) => {
  try {
    if (!chartContainer) {
      console.error("Chart element not found.");
      return;
    }

    console.log('Starting delayed PDF export...');
    
    // Enhanced wait for chart rendering
    await waitForChartToRender(chartContainer);
    
    console.log('Chart should be fully rendered, starting PDF capture...');

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      foreignObjectRendering: true,
      logging: true,
      scale: 2,
      ignoreElements: (element) => {
        // Only ignore actual UI controls, not chart elements
        const isExportButton = element.closest('[data-export-exclude]') !== null;
        const isInteractiveButton = element.tagName === 'BUTTON' && 
          (element.textContent?.includes('Export') || 
           element.textContent?.includes('×'));
        return isExportButton || isInteractiveButton;
      }
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for better chart viewing
    const config = createPDFConfig(pdf);
    
    // Add header
    addPDFHeader(pdf, config, 'Chart Export');
    
    // Add chart title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(chartTitle, config.margin, 55);
    
    // Calculate image dimensions to fit in PDF
    const canvasAspectRatio = canvas.width / canvas.height;
    const maxWidth = config.contentWidth;
    const maxHeight = config.pageHeight - 120; // Leave space for header and footer
    
    let imageWidth = maxWidth;
    let imageHeight = imageWidth / canvasAspectRatio;
    
    if (imageHeight > maxHeight) {
      imageHeight = maxHeight;
      imageWidth = imageHeight * canvasAspectRatio;
    }
    
    // Add image to PDF
    const imageX = config.margin + (config.contentWidth - imageWidth) / 2; // Center horizontally
    const imageY = 70;
    
    pdf.addImage(imgData, 'PNG', imageX, imageY, imageWidth, imageHeight);
    
    // Add footer
    addPDFFooter(pdf, config, 'Chart Export');
    
    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFileName = `chart-${timestamp}.pdf`;
    pdf.save(fileName || defaultFileName);
    
  } catch (error) {
    console.error('Error exporting chart to PDF:', error);
    throw error;
  }
};
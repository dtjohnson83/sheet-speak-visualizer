import jsPDF from 'jspdf';
import { createPDFConfig, addPDFHeader, addPDFFooter } from './pdfUtils';

export const exportChartToPNG = async (chartContainer: HTMLElement, fileName?: string) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    
    // Wait for chart to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(chartContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure all SVG elements are visible
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
        // Filter out interactive elements
        const isButton = element.tagName === 'BUTTON';
        const hasExportExclude = element.hasAttribute('data-export-exclude');
        const isHoverElement = element.classList.contains('opacity-0') || 
                              element.classList.contains('group-hover:opacity-100');
        
        return hasExportExclude || isHoverElement || isButton;
      }
    });
    
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().split('T')[0];
        const defaultFileName = `chart-${timestamp}.png`;
        link.download = fileName || defaultFileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 1.0);
    
  } catch (error) {
    console.error('Error exporting chart to PNG:', error);
    throw error;
  }
};

export const exportChartToSVG = async (chartContainer: HTMLElement, fileName?: string) => {
  try {
    // Find the SVG element within the chart container
    const svgElement = chartContainer.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in chart container');
    }
    
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Ensure the SVG has proper dimensions and styling
    const computedStyle = window.getComputedStyle(svgElement);
    clonedSvg.setAttribute('width', computedStyle.width || '800');
    clonedSvg.setAttribute('height', computedStyle.height || '400');
    
    // Add XML namespace if not present
    if (!clonedSvg.getAttribute('xmlns')) {
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    
    // Convert to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    
    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFileName = `chart-${timestamp}.svg`;
    link.download = fileName || defaultFileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error exporting chart to SVG:', error);
    throw error;
  }
};

export const exportChartToPDF = async (
  chartContainer: HTMLElement, 
  chartTitle: string,
  fileName?: string
) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    
    // Wait for chart to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(chartContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure all SVG elements are visible
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
        // Filter out interactive elements
        const isButton = element.tagName === 'BUTTON';
        const hasExportExclude = element.hasAttribute('data-export-exclude');
        const isHoverElement = element.classList.contains('opacity-0') || 
                              element.classList.contains('group-hover:opacity-100');
        
        return hasExportExclude || isHoverElement || isButton;
      }
    });
    
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
    
    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 1.0);
    
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
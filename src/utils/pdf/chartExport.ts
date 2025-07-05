import jsPDF from 'jspdf';
import { createPDFConfig, addPDFHeader, addPDFFooter } from './pdfUtils';

export const exportChartToPNG = async (chartContainer: HTMLElement, fileName?: string) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    
    console.log('PNG Export - Container details:', {
      tagName: chartContainer.tagName,
      className: chartContainer.className,
      childrenCount: chartContainer.children.length,
      innerHTML: chartContainer.innerHTML.substring(0, 200) + '...'
    });
    
    // Wait for chart to be ready and ensure it has content
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if the container has actual content
    const rect = chartContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.error('Chart container has zero dimensions:', rect);
      throw new Error('Chart container has zero dimensions');
    }
    
    console.log('Exporting PNG with dimensions:', { width: rect.width, height: rect.height });
    
    // Check for SVG content specifically
    const svgElements = chartContainer.querySelectorAll('svg');
    console.log('SVG elements found:', svgElements.length);
    svgElements.forEach((svg, i) => {
      const svgRect = svg.getBoundingClientRect();
      console.log(`SVG ${i}:`, { width: svgRect.width, height: svgRect.height, children: svg.children.length });
    });
    
    console.log('Starting html2canvas capture...');
    const canvas = await html2canvas(chartContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: rect.width,
      height: rect.height,
      onclone: (clonedDoc) => {
        // Enhanced SVG processing for better export
        const svgElements = clonedDoc.querySelectorAll('svg');
        svgElements.forEach(svg => {
          svg.style.visibility = 'visible';
          svg.style.display = 'block';
          svg.style.backgroundColor = '#ffffff';
          
          // Set explicit dimensions
          const svgRect = svg.getBoundingClientRect();
          svg.setAttribute('width', (svgRect.width || rect.width).toString());
          svg.setAttribute('height', (svgRect.height || rect.height).toString());
          
          // Add XML namespace
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          
          // Process all child elements
          const allElements = svg.querySelectorAll('*');
          allElements.forEach(el => {
            const element = el as SVGElement;
            element.style.visibility = 'visible';
            
            // Handle text elements specifically
            if (element.tagName === 'text') {
              element.style.fill = element.style.fill || '#374151';
              element.style.fontSize = element.style.fontSize || '12px';
              element.style.fontFamily = element.style.fontFamily || 'system-ui, sans-serif';
            }
            
            // Handle path elements (chart lines, bars, etc.)
            if (element.tagName === 'path') {
              if (!element.style.fill || element.style.fill === 'none') {
                element.style.stroke = element.style.stroke || '#374151';
                element.style.strokeWidth = element.style.strokeWidth || '2';
              }
            }
            
            // Handle rect elements (bars, backgrounds)
            if (element.tagName === 'rect') {
              element.style.fill = element.style.fill || '#3b82f6';
            }
          });
        });
        
        // Enhance chart containers
        const chartContainers = clonedDoc.querySelectorAll('.recharts-wrapper, .recharts-surface, .recharts-layer');
        chartContainers.forEach(container => {
          const element = container as HTMLElement;
          element.style.visibility = 'visible';
          element.style.display = 'block';
        });
      },
      ignoreElements: (element) => {
        // Filter out interactive elements but keep chart content
        const isButton = element.tagName === 'BUTTON';
        const hasExportExclude = element.hasAttribute('data-export-exclude');
        const isHoverElement = element.classList.contains('opacity-0') && 
                              !element.closest('.recharts-wrapper');
        
        return hasExportExclude || isButton || isHoverElement;
      }
    });
    
    // Check if canvas has content
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('Generated canvas has zero dimensions');
      throw new Error('Generated canvas has zero dimensions');
    }
    
    console.log('Canvas generated successfully:', { 
      width: canvas.width, 
      height: canvas.height,
      hasImageData: canvas.getContext('2d') !== null
    });
    
    // Check if canvas is blank by sampling pixels
    const ctx = canvas.getContext('2d');
    const imageData = ctx?.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
    const isBlank = imageData ? Array.from(imageData.data).every((pixel, i) => i % 4 === 3 || pixel === 255) : true;
    console.log('Canvas content check:', { isBlank, sampleSize: imageData?.data.length });
    
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
    
    // Get actual dimensions from the original SVG
    const rect = svgElement.getBoundingClientRect();
    const actualWidth = rect.width || 800;
    const actualHeight = rect.height || 400;
    
    // Set proper dimensions
    clonedSvg.setAttribute('width', actualWidth.toString());
    clonedSvg.setAttribute('height', actualHeight.toString());
    clonedSvg.setAttribute('viewBox', `0 0 ${actualWidth} ${actualHeight}`);
    
    // Add XML namespace and other required attributes
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    // Copy computed styles to inline styles for all elements
    const copyComputedStylesToInline = (sourceElement: Element, targetElement: Element) => {
      const computedStyle = window.getComputedStyle(sourceElement);
      const targetSvgElement = targetElement as SVGElement;
      
      // Copy important style properties
      const importantStyles = [
        'fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight',
        'color', 'opacity', 'visibility', 'display', 'text-anchor'
      ];
      
      importantStyles.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'none' && value !== '') {
          targetSvgElement.style.setProperty(prop, value);
        }  
      });
      
      // Recursively process children
      for (let i = 0; i < sourceElement.children.length; i++) {
        copyComputedStylesToInline(sourceElement.children[i], targetElement.children[i]);
      }
    };
    
    // Apply computed styles to the cloned SVG
    copyComputedStylesToInline(svgElement, clonedSvg);
    
    // Ensure background is white
    clonedSvg.style.backgroundColor = '#ffffff';
    
    // Convert to string with proper XML declaration
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);
    
    // Add XML declaration if not present
    if (!svgString.startsWith('<?xml')) {
      svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    }
    
    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
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
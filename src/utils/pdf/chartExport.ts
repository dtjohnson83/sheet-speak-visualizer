import jsPDF from 'jspdf';
import { createPDFConfig, addPDFHeader, addPDFFooter } from './pdfUtils';

// Helper: Inline computed styles from source to target
function inlineComputedStyles(source: SVGElement, target: SVGElement) {
  const all = source.querySelectorAll("*");
  const allCopy = target.querySelectorAll("*");

  all.forEach((node, i) => {
    const style = window.getComputedStyle(node);
    const targetNode = allCopy[i] as HTMLElement;
    for (const key of style) {
      targetNode.style.setProperty(key, style.getPropertyValue(key));
    }
  });
}

// Export PNG or PDF
export async function exportChartAsImage(chartElement: HTMLElement, type: "png" | "pdf" = "png") {
  if (!chartElement) {
    console.error("Chart element not found.");
    return;
  }

  // Wait for DOM render
  await new Promise((res) => setTimeout(res, 100)); // delay ensures async render finishes

  // Generate canvas with improved settings
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(chartElement, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#fff",
    foreignObjectRendering: true,
    logging: true,
    scale: 2,
  });

  const imgData = canvas.toDataURL("image/png");

  if (type === "png") {
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = imgData;
    link.click();
  } else {
    // Optional: use jsPDF here if you want PDF
    console.warn("PDF export not yet implemented.");
  }
}

export const exportChartToPNG = async (chartContainer: HTMLElement, fileName?: string) => {
  try {
    if (!chartContainer) {
      console.error("Chart element not found.");
      return;
    }

    // Wait for DOM render
    await new Promise((res) => setTimeout(res, 100));

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#fff",
      foreignObjectRendering: true,
      logging: true,
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFileName = `chart-${timestamp}.png`;
    link.download = fileName || defaultFileName;
    link.href = imgData;
    link.click();
    
  } catch (error) {
    console.error('Error exporting chart to PNG:', error);
    throw error;
  }
};

// Export SVG
export function exportChartAsSVG(chartElement: HTMLElement) {
  const svg = chartElement?.querySelector("svg");
  if (!svg) {
    console.error("SVG element not found.");
    return;
  }

  // Clone and inline styles
  const copy = svg.cloneNode(true) as SVGElement;
  inlineComputedStyles(svg, copy);

  const serializer = new XMLSerializer();
  const svgBlob = new Blob([serializer.serializeToString(copy)], { type: "image/svg+xml;charset=utf-8" });

  const url = URL.createObjectURL(svgBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "chart.svg";
  link.click();
  URL.revokeObjectURL(url);
}

export const exportChartToSVG = async (chartContainer: HTMLElement, fileName?: string) => {
  try {
    const svg = chartContainer?.querySelector("svg");
    if (!svg) {
      console.error("SVG element not found.");
      throw new Error('No SVG element found in chart container');
    }

    // Clone and inline styles using the improved helper function
    const copy = svg.cloneNode(true) as SVGElement;
    inlineComputedStyles(svg, copy);

    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(copy)], { type: "image/svg+xml;charset=utf-8" });

    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFileName = `chart-${timestamp}.svg`;
    link.download = fileName || defaultFileName;
    link.click();
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
    if (!chartContainer) {
      console.error("Chart element not found.");
      return;
    }

    // Wait for DOM render
    await new Promise((res) => setTimeout(res, 100));

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#fff",
      foreignObjectRendering: true,
      logging: true,
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    
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
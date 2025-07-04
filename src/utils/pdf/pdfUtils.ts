import jsPDF from 'jspdf';

export interface PDFConfig {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
}

export const createPDFConfig = (pdf: jsPDF): PDFConfig => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  return { pageWidth, pageHeight, margin, contentWidth };
};

export const addPDFHeader = (pdf: jsPDF, config: PDFConfig, title: string) => {
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, config.margin, 25);
  
  // Add timestamp
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, config.margin, 35);
  
  // Add separator line
  pdf.setLineWidth(0.5);
  pdf.line(config.margin, 40, config.pageWidth - config.margin, 40);
};

export const addPDFFooter = (pdf: jsPDF, config: PDFConfig, text: string) => {
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`${text} - Page ${i} of ${totalPages}`, 
             config.margin, config.pageHeight - 10);
  }
};

export const checkPageBreak = (pdf: jsPDF, config: PDFConfig, yPosition: number, margin: number = 40): number => {
  if (yPosition > config.pageHeight - margin) {
    pdf.addPage();
    return 25;
  }
  return yPosition;
};

// Wait for all charts to be ready for export
export const waitForChartsReady = async (container: HTMLElement): Promise<boolean> => {
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
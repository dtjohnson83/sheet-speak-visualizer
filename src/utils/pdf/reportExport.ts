import jsPDF from 'jspdf';
import { createPDFConfig, addPDFFooter, checkPageBreak } from './pdfUtils';

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

export const exportAIReportToPDF = async (reportData: ReportData, fileName?: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const config = createPDFConfig(pdf);
  
  // Add header with logo and title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Analysis Report', config.margin, 25);
  
  // Add metadata
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date(reportData.metadata.generatedAt).toLocaleString()}`, config.margin, 35);
  if (fileName) {
    pdf.text(`Dataset: ${fileName}`, config.margin, 42);
  }
  pdf.text(`Analysis Perspective: ${reportData.metadata.persona.replace('_', ' ').toUpperCase()}`, config.margin, 49);
  
  // Add separator line
  pdf.setLineWidth(0.5);
  pdf.line(config.margin, 55, config.pageWidth - config.margin, 55);
  
  // Add executive summary section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', config.margin, 70);
  
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
    pdf.text(`• ${line}`, config.margin + 5, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Add main report content
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Analysis', config.margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  // Split report content into lines
  const reportLines = pdf.splitTextToSize(reportData.report, config.contentWidth);
  const lineHeight = 5;
  
  reportLines.forEach((line: string) => {
    yPosition = checkPageBreak(pdf, config, yPosition);
    pdf.text(line, config.margin, yPosition);
    yPosition += lineHeight;
  });
  
  // Add data quality section if space
  if (yPosition < config.pageHeight - 50) {
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Data Quality Metrics', config.margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    reportData.metadata.dataCompleteness.forEach(dc => {
      yPosition = checkPageBreak(pdf, config, yPosition);
      pdf.text(`${dc.column}: ${Math.round(dc.completeness)}% complete`, config.margin + 5, yPosition);
      yPosition += 5;
    });
  }
  
  // Add footer with page numbers
  addPDFFooter(pdf, config, 'Chartuvo AI Report');
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const filePrefix = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'report';
  pdf.save(`ai-report-${filePrefix}-${reportData.metadata.persona}-${timestamp}.pdf`);
};

import jsPDF from 'jspdf';
import { createPDFConfig, addPDFFooter, checkPageBreak } from './pdfUtils';
import { UnifiedReportData, safelyExtractReportData } from '@/types/reportTypes';

export const exportAIReportToPDF = async (reportData: any, fileName?: string) => {
  try {
    // Safely extract and validate report data
    const validatedData = safelyExtractReportData(reportData);
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const config = createPDFConfig(pdf);
    
    // Add header with logo and title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Analysis Report', config.margin, 25);
    
    // Add metadata section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date(validatedData.metadata.generatedAt).toLocaleString()}`, config.margin, 35);
    
    if (fileName) {
      pdf.text(`Dataset: ${fileName}`, config.margin, 42);
    }
    
    pdf.text(`Analysis Perspective: ${validatedData.metadata.persona.replace('_', ' ').toUpperCase()}`, config.margin, 49);
    
    // Add dataset profile information if available
    if (validatedData.datasetProfile) {
      pdf.text(`Data Type: ${validatedData.datasetProfile.dataType.toUpperCase()} (${(validatedData.datasetProfile.confidence * 100).toFixed(1)}% confidence)`, config.margin, 56);
    }
    
    // Add quality alert if present
    if (validatedData.metadata.qualityAlert) {
      pdf.setTextColor(200, 0, 0); // Red color for alerts
      pdf.text(`⚠️ ${validatedData.metadata.qualityAlert}`, config.margin, 63);
      pdf.setTextColor(0, 0, 0); // Reset to black
    }
    
    // Add separator line
    pdf.setLineWidth(0.5);
    const separatorY = validatedData.metadata.qualityAlert ? 70 : 62;
    pdf.line(config.margin, separatorY, config.pageWidth - config.margin, separatorY);
    
    // Add executive summary section
    let yPosition = separatorY + 15;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', config.margin, yPosition);
    yPosition += 10;
    
    // Add data overview
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const overview = [
      `Total Records: ${validatedData.metadata.totalRows.toLocaleString()}`,
      `Columns Analyzed: ${validatedData.metadata.totalColumns}`,
      `Data Completeness: ${Math.round(
        validatedData.metadata.dataCompleteness.length > 0 
          ? validatedData.metadata.dataCompleteness.reduce((sum, dc) => sum + dc.completeness, 0) / validatedData.metadata.dataCompleteness.length
          : 0
      )}%`,
      `Column Types: ${Object.entries(validatedData.metadata.columnTypes).map(([type, count]) => `${count} ${type}`).join(', ') || 'Mixed types'}`
    ];
    
    overview.forEach(line => {
      yPosition = checkPageBreak(pdf, config, yPosition);
      pdf.text(`• ${line}`, config.margin + 5, yPosition);
      yPosition += 6;
    });
    
    // Add health metrics if available
    if (validatedData.healthMetrics) {
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data Health Assessment', config.margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const healthInfo = [
        `Data Quality Score: ${(validatedData.healthMetrics.dataQuality * 100).toFixed(1)}%`,
        `Trend Direction: ${validatedData.healthMetrics.trendDirection.replace('_', ' ').toUpperCase()}`
      ];
      
      healthInfo.forEach(info => {
        yPosition = checkPageBreak(pdf, config, yPosition);
        pdf.text(`• ${info}`, config.margin + 5, yPosition);
        yPosition += 5;
      });
      
      // Add critical issues if any
      if (validatedData.healthMetrics.criticalIssues && validatedData.healthMetrics.criticalIssues.length > 0) {
        yPosition += 5;
        pdf.setTextColor(200, 0, 0);
        pdf.text('Critical Issues:', config.margin + 5, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 5;
        
        validatedData.healthMetrics.criticalIssues.slice(0, 5).forEach(issue => {
          yPosition = checkPageBreak(pdf, config, yPosition);
          const wrappedIssue = pdf.splitTextToSize(`• ${issue}`, config.contentWidth - 10);
          wrappedIssue.forEach((line: string) => {
            pdf.text(line, config.margin + 10, yPosition);
            yPosition += 4;
          });
        });
      }
    }
    
    yPosition += 15;
    
    // Add main report content
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Analysis', config.margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Split report content into lines with proper wrapping
    const reportLines = pdf.splitTextToSize(validatedData.report, config.contentWidth);
    const lineHeight = 5;
    
    reportLines.forEach((line: string) => {
      yPosition = checkPageBreak(pdf, config, yPosition);
      pdf.text(line, config.margin, yPosition);
      yPosition += lineHeight;
    });
    
    // Add data quality section if space and data is available
    if (yPosition < config.pageHeight - 60 && validatedData.metadata.dataCompleteness.length > 0) {
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data Quality Metrics', config.margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      validatedData.metadata.dataCompleteness.slice(0, 10).forEach(dc => {
        yPosition = checkPageBreak(pdf, config, yPosition);
        pdf.text(`${dc.column}: ${Math.round(dc.completeness)}% complete`, config.margin + 5, yPosition);
        yPosition += 5;
      });
    }
    
    // Add footer with page numbers
    addPDFFooter(pdf, config, 'Chartuvo AI Report');
    
    // Generate filename with proper formatting
    const timestamp = new Date().toISOString().split('T')[0];
    const filePrefix = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'report';
    const dataType = validatedData.datasetProfile?.dataType || 'data';
    const persona = validatedData.metadata.persona;
    
    pdf.save(`ai-report-${filePrefix}-${dataType}-${persona}-${timestamp}.pdf`);
    
  } catch (error) {
    console.error('Error exporting AI report to PDF:', error);
    throw new Error(`Failed to export AI report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

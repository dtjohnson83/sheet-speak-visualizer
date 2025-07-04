import { DataQualityReport } from '../types';
import { ExportOptions } from './ExportTypes';

export const exportToPDF = async (report: DataQualityReport, options: ExportOptions): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // Title and metadata
  doc.setFontSize(20);
  doc.text('Data Quality Report', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
  doc.text(`Dataset: ${report.datasetInfo.rows} rows, ${report.datasetInfo.columns} columns`, 20, 55);

  // Quality scores
  doc.setFontSize(16);
  doc.text('Quality Scores', 20, 75);
  
  const scores = [
    ['Overall Score', `${report.qualityScore.overall.toFixed(1)}%`],
    ['Completeness', `${report.qualityScore.completeness.toFixed(1)}%`],
    ['Consistency', `${report.qualityScore.consistency.toFixed(1)}%`],
    ['Accuracy', `${report.qualityScore.accuracy.toFixed(1)}%`],
    ['Uniqueness', `${report.qualityScore.uniqueness.toFixed(1)}%`],
    ['Timeliness', `${report.qualityScore.timeliness.toFixed(1)}%`]
  ];

  let yPos = 90;
  scores.forEach(([metric, score]) => {
    doc.setFontSize(12);
    doc.text(`${metric}:`, 30, yPos);
    doc.text(score, 120, yPos);
    yPos += 15;
  });

  // Issues summary
  doc.setFontSize(16);
  doc.text('Issues Summary', 20, yPos + 20);
  yPos += 35;

  doc.setFontSize(12);
  doc.text(`Total Issues: ${report.summary.totalIssues}`, 30, yPos);
  doc.text(`High Severity: ${report.summary.highSeverityIssues}`, 30, yPos + 15);
  doc.text(`Affected Columns: ${report.summary.affectedColumns}`, 30, yPos + 30);

  // Add issues list if they exist
  if (report.issues && report.issues.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Detailed Issues', 20, 30);
    
    yPos = 50;
    report.issues.slice(0, 20).forEach((issue, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${issue.column} - ${issue.type}`, 20, yPos);
      doc.text(`Severity: ${issue.severity} | Impact: ${issue.percentage.toFixed(1)}%`, 25, yPos + 8);
      doc.text(issue.description, 25, yPos + 16, { maxWidth: 160 });
      yPos += 30;
    });
  }

  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`data-quality-report-${timestamp}.pdf`);
};

export const exportToCSV = async (report: DataQualityReport, options: ExportOptions): Promise<void> => {
  const csvData = [
    // Header
    ['Data Quality Report'],
    ['Generated', new Date().toLocaleDateString()],
    ['Dataset Info', `${report.datasetInfo.rows} rows, ${report.datasetInfo.columns} columns`],
    [],
    
    // Quality Scores
    ['Quality Scores'],
    ['Metric', 'Score (%)'],
    ['Overall', report.qualityScore.overall.toFixed(1)],
    ['Completeness', report.qualityScore.completeness.toFixed(1)],
    ['Consistency', report.qualityScore.consistency.toFixed(1)],
    ['Accuracy', report.qualityScore.accuracy.toFixed(1)],
    ['Uniqueness', report.qualityScore.uniqueness.toFixed(1)],
    ['Timeliness', report.qualityScore.timeliness.toFixed(1)],
    [],
    
    // Issues
    ['Issues'],
    ['Column', 'Type', 'Severity', 'Affected Rows', 'Impact (%)', 'Description'],
    ...report.issues.map(issue => [
      issue.column,
      issue.type,
      issue.severity,
      issue.affectedRows.toString(),
      issue.percentage.toFixed(1),
      issue.description
    ])
  ];

  const csvContent = csvData.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().split('T')[0];
  link.download = `data-quality-report-${timestamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToExcel = async (report: DataQualityReport, options: ExportOptions): Promise<void> => {
  // For now, export as CSV with Excel-friendly format
  // Future enhancement could use a library like xlsx
  await exportToCSV(report, options);
};
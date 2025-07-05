// Export all PDF functionality for backward compatibility
export { exportDashboardToPDF, exportDashboardToPNG, exportDashboardToSVG } from './dashboardExport';
export { exportAIChatToPDF } from './chatExport';
export { exportAIReportToPDF } from './reportExport';
export { exportChartToPNG, exportChartToSVG, exportChartToPDF } from './chartExport';
export * from './pdfUtils';
import { waitForChartToRender } from './helpers';

export const exportChartToPNG = async (chartContainer: HTMLElement, fileName?: string) => {
  try {
    if (!chartContainer) {
      console.error("Chart element not found.");
      return;
    }

    console.log('Starting delayed screenshot approach...');
    
    // Enhanced wait for chart rendering
    await waitForChartToRender(chartContainer);
    
    console.log('Chart should be fully rendered, starting capture...');

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      foreignObjectRendering: true,
      logging: true,
      scale: 2,
      // Force re-render of SVG elements
      ignoreElements: (element) => {
        // Only ignore actual UI controls, not chart elements
        const isExportButton = element.closest('[data-export-exclude]') !== null;
        const isInteractiveButton = element.tagName === 'BUTTON' && 
          (element.textContent?.includes('Export') || 
           element.textContent?.includes('×'));
        return isExportButton || isInteractiveButton;
      }
    });

    console.log('Canvas created:', { width: canvas.width, height: canvas.height });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas has zero dimensions');
    }

    // Check if canvas has actual content by sampling pixels
    const ctx = canvas.getContext('2d');
    const imageData = ctx?.getImageData(0, 0, Math.min(canvas.width, 50), Math.min(canvas.height, 50));
    const hasContent = imageData ? !Array.from(imageData.data).every((pixel, i) => i % 4 === 3 || pixel === 255 || pixel === 0) : false;
    
    console.log('Canvas content check:', { hasContent, dimensions: { width: canvas.width, height: canvas.height } });

    const imgData = canvas.toDataURL("image/png", 1.0);
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
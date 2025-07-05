import { inlineComputedStyles } from './helpers';

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
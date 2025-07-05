// Helper functions for chart export functionality

// Enhanced delayed screenshot approach
export async function waitForChartToRender(chartElement: HTMLElement): Promise<void> {
  // Wait for initial render
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if chart has rendered content
  const svg = chartElement.querySelector('svg');
  if (!svg) {
    throw new Error('No SVG found in chart element');
  }
  
  // Wait for SVG to have content
  let attempts = 0;
  while (attempts < 20) { // Max 10 seconds
    const paths = svg.querySelectorAll('path, rect, circle, line');
    const texts = svg.querySelectorAll('text');
    
    if (paths.length > 0 || texts.length > 0) {
      // Found content, wait a bit more for full render
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }
  
  // Fallback: just wait longer
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Helper: Inline computed styles from source to target
export function inlineComputedStyles(source: SVGElement, target: SVGElement) {
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
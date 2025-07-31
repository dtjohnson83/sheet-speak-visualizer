/**
 * Utility functions for theme-aware chart styling
 */

/**
 * Returns the appropriate text fill color for chart labels based on current theme
 * @param isOnColoredBackground - Whether the text is on a colored background (like treemap cells)
 * @returns CSS fill value compatible with SVG elements
 */
export const getChartTextColor = (isOnColoredBackground = false): string => {
  if (isOnColoredBackground) {
    return 'hsl(var(--foreground))';
  }
  return 'hsl(var(--foreground))';
};

/**
 * Returns chart text color as a CSS class
 * @param isOnColoredBackground - Whether the text is on a colored background
 * @returns Tailwind CSS class name
 */
export const getChartTextClass = (isOnColoredBackground = false): string => {
  if (isOnColoredBackground) {
    return 'fill-[hsl(var(--foreground))]';
  }
  return 'fill-[hsl(var(--foreground))]';
};
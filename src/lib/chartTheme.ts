/**
 * Enhanced utility functions for theme-aware chart styling
 */

/**
 * Returns the appropriate text fill color for chart labels based on current theme
 * @param isOnColoredBackground - Whether the text is on a colored background (like treemap cells)
 * @returns CSS fill value compatible with SVG elements
 */
export const getChartTextColor = (isOnColoredBackground = false): string => {
  if (isOnColoredBackground) {
    return 'hsl(var(--chart-text-contrast))';
  }
  return 'hsl(var(--chart-text))';
};

/**
 * Returns chart text color as a CSS class
 * @param isOnColoredBackground - Whether the text is on a colored background
 * @returns Tailwind CSS class name
 */
export const getChartTextClass = (isOnColoredBackground = false): string => {
  if (isOnColoredBackground) {
    return 'fill-[hsl(var(--chart-text-contrast))]';
  }
  return 'fill-[hsl(var(--chart-text))]';
};

/**
 * Enhanced color palette configurations with gradient support
 */
export const chartColorPalettes = {
  modern: [
    'hsl(220 98% 61%)',   // Primary blue
    'hsl(262 83% 58%)',   // Purple
    'hsl(291 47% 71%)',   // Pink
    'hsl(173 58% 39%)',   // Teal
    'hsl(43 74% 66%)',    // Yellow
    'hsl(27 96% 61%)',    // Orange
    'hsl(339 82% 62%)',   // Rose
    'hsl(142 71% 45%)',   // Green
  ],
  vibrant: [
    'hsl(217 91% 60%)',   // Bright blue
    'hsl(278 94% 70%)',   // Bright purple
    'hsl(330 100% 70%)',  // Bright pink
    'hsl(168 76% 50%)',   // Bright teal
    'hsl(45 93% 58%)',    // Bright yellow
    'hsl(25 95% 65%)',    // Bright orange
    'hsl(348 83% 67%)',   // Bright red
    'hsl(120 60% 50%)',   // Bright green
  ],
  subtle: [
    'hsl(220 38% 55%)',   // Muted blue
    'hsl(262 40% 55%)',   // Muted purple
    'hsl(291 25% 60%)',   // Muted pink
    'hsl(173 25% 45%)',   // Muted teal
    'hsl(43 35% 58%)',    // Muted yellow
    'hsl(27 45% 58%)',    // Muted orange
    'hsl(339 40% 58%)',   // Muted rose
    'hsl(142 35% 50%)',   // Muted green
  ],
  monochrome: [
    'hsl(220 25% 60%)',   // Light gray-blue
    'hsl(220 15% 45%)',   // Medium gray
    'hsl(220 10% 65%)',   // Light gray
    'hsl(220 20% 35%)',   // Dark gray
    'hsl(220 8% 75%)',    // Very light gray
    'hsl(220 30% 25%)',   // Very dark gray
    'hsl(220 5% 85%)',    // Pale gray
    'hsl(220 40% 15%)',   // Almost black
  ]
};

/**
 * Get colors for a specific palette
 * @param paletteName - Name of the color palette
 * @returns Array of color strings
 */
export const getChartColors = (paletteName: keyof typeof chartColorPalettes = 'modern'): string[] => {
  return chartColorPalettes[paletteName] || chartColorPalettes.modern;
};

/**
 * Get theme-aware chart colors that adapt to light/dark mode
 * @returns Array of CSS custom property references
 */
export const getThemeAwareChartColors = (): string[] => {
  return [
    'hsl(var(--chart-primary))',
    'hsl(var(--chart-secondary))', 
    'hsl(var(--chart-accent))',
    'hsl(var(--chart-destructive))',
    'hsl(var(--chart-warning))',
    'hsl(var(--chart-success))',
  ];
};

/**
 * Generate gradient definitions for chart colors
 * @param colors - Array of color strings
 * @param direction - Gradient direction (vertical, horizontal, radial)
 * @returns Gradient definition object
 */
export const generateGradients = (
  colors: string[], 
  direction: 'vertical' | 'horizontal' | 'radial' = 'vertical'
) => {
  return colors.map((color, index) => {
    const gradientId = `gradient-${index}`;
    const lightColor = color.replace(/hsl\(([^)]+)\)/, (match, hsl) => {
      const [h, s, l] = hsl.split(/\s+/);
      const lightness = Math.min(90, parseInt(l) + 15);
      return `hsl(${h} ${s} ${lightness}%)`;
    });
    
    return {
      id: gradientId,
      colors: direction === 'vertical' 
        ? [{ offset: '0%', color: lightColor }, { offset: '100%', color }]
        : [{ offset: '0%', color }, { offset: '100%', color: lightColor }]
    };
  });
};

/**
 * Generate shadow styles for chart elements
 * @param color - Base color for the shadow
 * @param intensity - Shadow intensity (0-1)
 * @returns CSS filter string
 */
export const generateShadow = (color: string, intensity: number = 0.2): string => {
  const shadowColor = color.replace(/hsl\(([^)]+)\)/, (match, hsl) => {
    return `hsl(${hsl} / ${intensity})`;
  });
  return `drop-shadow(0 4px 12px ${shadowColor})`;
};

/**
 * Generate hover glow effect
 * @param color - Base color for the glow
 * @param intensity - Glow intensity (0-1)
 * @returns CSS filter string
 */
export const generateGlow = (color: string, intensity: number = 0.4): string => {
  const glowColor = color.replace(/hsl\(([^)]+)\)/, (match, hsl) => {
    return `hsl(${hsl} / ${intensity})`;
  });
  return `drop-shadow(0 0 16px ${glowColor})`;
};
/**
 * Recipe Engine Configuration
 * 
 * Central configuration for the Recipe Engine including logging settings,
 * scoring parameters, and other configurable constants.
 */

// === LOGGING CONFIGURATION ===
export const RECIPE_CONFIG = {
  // Enable/disable debug logging (should be false in production)
  enableDebugLogging: process.env.NODE_ENV === 'development',
  
  // Enable/disable performance logging
  enablePerformanceLogging: process.env.NODE_ENV === 'development',
  
  // Maximum number of recipes to return
  maxRecipeResults: 12,
  
  // Minimum confidence threshold for recipes
  minConfidenceThreshold: 0.1,
  
  // Sample size for value analysis
  valueSampleSize: 50,
  
  // Maximum number of logs to show in debug mode
  maxDebugLogs: 100
} as const;

// === SCORING PARAMETERS ===
export const SCORING_CONFIG = {
  // Base scores
  PRIMARY_INGREDIENT_SCORE: 0.4,
  SECONDARY_INGREDIENT_SCORE: 0.4,
  
  // Bonus thresholds and values
  SYNERGY_BONUS_MAX: 0.15,
  QUALITY_BONUS_HIGH: 0.1,  // for potency > 0.8
  QUALITY_BONUS_MEDIUM: 0.05, // for potency > 0.6
  QUALITY_PENALTY_LOW: -0.05, // for potency < 0.3
  
  // Complexity matching
  COMPLEXITY_BONUS_HIGH: 0.08, // for >80% match
  COMPLEXITY_BONUS_MEDIUM: 0.04, // for >60% match
  
  // Penalties
  PIE_CHART_MULTI_CATEGORICAL_PENALTY: -0.3,
  OVERCROWDING_PENALTY_MAX: 0.25,
  
  // Perfect combination bonuses
  PERFECT_PIE_BONUS: 0.2,         // 1 categorical + 1 numeric, 2 total ingredients
  GOOD_PIE_BONUS: 0.1,            // 1 categorical + 1 numeric, more ingredients
  HISTOGRAM_PERFECT_BONUS: 0.15,   // exactly 1 numeric ingredient
  SCATTER3D_BONUS: 0.12,          // 3+ numeric ingredients
  NETWORK_BONUS: 0.15,            // 2+ categorical ingredients
  
  // Data size preferences
  DATA_SIZE_SMALL: 50,
  DATA_SIZE_MEDIUM: 500
} as const;

// === CHART COMPLEXITY MAPPING ===
export const CHART_COMPLEXITY: Record<string, number> = {
  // Simple charts (complexity 0.2-0.4)
  pie: 0.2,
  bar: 0.3,
  line: 0.3,
  
  // Medium charts (complexity 0.4-0.7)
  scatter: 0.5,
  area: 0.5,
  histogram: 0.4,
  heatmap: 0.6,
  
  // Complex charts (complexity 0.7-1.0)
  treemap: 0.7,
  network: 0.8,
  scatter3d: 0.9,
  surface3d: 1.0,
  network3d: 0.95
};

// === OVERCROWDING TOLERANCE ===
export const OVERCROWDING_TOLERANCE: Record<string, number> = {
  network: 0.02,     // Networks can handle many nodes
  heatmap: 0.03,     // Heatmaps work with many dimensions
  treemap: 0.025,    // Treemaps accommodate hierarchies
  scatter3d: 0.035,  // 3D scatter can show more dimensions
  surface3d: 0.04,   // Surfaces can use multiple metrics
};

// === DATA SIZE PREFERENCES ===
export const DATA_SIZE_PREFERENCES: Record<string, { small: number; medium: number; large: number }> = {
  pie: { small: 0.1, medium: 0.05, large: -0.1 },        // Pie charts better with fewer categories
  treemap: { small: 0.0, medium: 0.08, large: 0.1 },     // Treemaps handle more data well
  network: { small: 0.05, medium: 0.1, large: 0.05 },    // Networks work best with medium complexity
  heatmap: { small: -0.05, medium: 0.08, large: 0.12 },  // Heatmaps excel with larger datasets
  histogram: { small: -0.1, medium: 0.05, large: 0.1 },  // Histograms need sufficient data
  scatter3d: { small: -0.05, medium: 0.05, large: 0.08 }, // 3D scatter needs enough points
  surface3d: { small: -0.1, medium: 0.0, large: 0.1 }    // Surfaces need dense data
};

// === UTILITY FUNCTIONS ===
export function shouldLog(type: 'debug' | 'performance' = 'debug'): boolean {
  switch (type) {
    case 'debug':
      return RECIPE_CONFIG.enableDebugLogging;
    case 'performance':
      return RECIPE_CONFIG.enablePerformanceLogging;
    default:
      return false;
  }
}

export function logDebug(message: string, data?: any): void {
  if (shouldLog('debug')) {
    console.log(`[RecipeEngine] ${message}`, data || '');
  }
}

export function logPerformance(operation: string, startTime: number): void {
  if (shouldLog('performance')) {
    const duration = Date.now() - startTime;
    console.log(`[RecipeEngine Performance] ${operation}: ${duration}ms`);
  }
}
import { IngredientAnalysis } from './recipeEngine';

/**
 * Pie Chart Handler
 * 
 * Dedicated handler for pie chart logic due to its specific requirements and multiple special cases.
 * Pie charts have unique constraints that warrant specialized handling.
 */
export class PieChartHandler {
  
  /**
   * Validates if ingredients are suitable for pie chart visualization
   * Pie charts require exactly 1 categorical (for slices) and 1 numeric (for values)
   */
  static validatePieChartIngredients(ingredients: IngredientAnalysis[]): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const categoricalIngredients = ingredients.filter(i => i.type === 'categorical');
    const numericIngredients = ingredients.filter(i => i.type === 'numeric');
    const issues: string[] = [];
    let score = 0;

    // Must have exactly one categorical ingredient
    if (categoricalIngredients.length === 0) {
      issues.push('Pie charts require categorical data for slices');
      return { isValid: false, score: 0, issues };
    }
    
    if (categoricalIngredients.length > 1) {
      issues.push(`Too many categorical dimensions (${categoricalIngredients.length}). Pie charts work best with single dimension`);
      score -= 0.3; // Heavy penalty for multiple categorical dimensions
    }

    // Must have at least one numeric ingredient
    if (numericIngredients.length === 0) {
      issues.push('Pie charts require numeric data for slice values');
      return { isValid: false, score: 0, issues };
    }

    // Perfect setup: exactly 1 categorical + 1 numeric
    if (categoricalIngredients.length === 1 && numericIngredients.length === 1 && ingredients.length === 2) {
      score += 0.2; // Strong bonus for perfect pie chart setup
    } else if (categoricalIngredients.length === 1 && numericIngredients.length === 1) {
      score += 0.1; // Decent bonus even with extra ingredients
    }

    // Check cardinality - pie charts work best with limited categories
    const primaryCategorical = categoricalIngredients[0];
    if (primaryCategorical.uniqueValues > 12) {
      issues.push(`Too many categories (${primaryCategorical.uniqueValues}). Pie charts are hard to read with >12 slices`);
      score -= 0.15;
    } else if (primaryCategorical.uniqueValues > 8) {
      issues.push(`Many categories (${primaryCategorical.uniqueValues}). Consider using bar chart for better readability`);
      score -= 0.05;
    } else if (primaryCategorical.uniqueValues >= 3) {
      score += 0.1; // Good number of categories for pie chart
    }

    const isValid = categoricalIngredients.length >= 1 && numericIngredients.length >= 1;
    return { isValid, score, issues };
  }

  /**
   * Calculates pie-specific synergy bonus
   */
  static calculatePieSynergyBonus(ingredients: IngredientAnalysis[]): number {
    const validation = this.validatePieChartIngredients(ingredients);
    return Math.max(0, validation.score);
  }

  /**
   * Gets pie chart specific recommendations
   */
  static getPieChartRecommendations(ingredients: IngredientAnalysis[]): string[] {
    const recommendations: string[] = [];
    const categoricalIngredients = ingredients.filter(i => i.type === 'categorical');
    const numericIngredients = ingredients.filter(i => i.type === 'numeric');

    if (categoricalIngredients.length > 1) {
      recommendations.push('Consider using a stacked bar chart to show multiple categorical dimensions');
    }

    if (categoricalIngredients.length > 0 && categoricalIngredients[0].uniqueValues > 8) {
      recommendations.push('Consider using a bar chart for better readability with many categories');
    }

    if (numericIngredients.length > 1) {
      recommendations.push('Pie charts show single numeric values. Consider scatter or bubble chart for multiple metrics');
    }

    if (ingredients.some(i => i.type === 'temporal')) {
      recommendations.push('Time-based data works better in line or area charts to show trends');
    }

    return recommendations;
  }

  /**
   * Determines if pie chart should be filtered out based on data characteristics
   */
  static shouldFilterPieChart(ingredients: IngredientAnalysis[], dataSize: number): boolean {
    const validation = this.validatePieChartIngredients(ingredients);
    
    // Filter out if basic validation fails
    if (!validation.isValid) {
      return true;
    }

    // Filter out if too many issues
    if (validation.issues.length > 2) {
      return true;
    }

    // Filter out if data is too sparse for meaningful pie chart
    if (dataSize < 3) {
      return true;
    }

    // Filter out if categorical dimension has too many unique values
    const categoricalIngredients = ingredients.filter(i => i.type === 'categorical');
    if (categoricalIngredients.length > 0 && categoricalIngredients[0].uniqueValues > 15) {
      return true;
    }

    return false;
  }
}
import { ColumnInfo } from '@/pages/Index';

export interface ChartRecipe {
  id: string;
  name: string;
  chartType: string;
  confidence: number;
  reasoning: string;
  requiredIngredients: {
    primary: IngredientType[];
    secondary?: IngredientType[];
    optional?: IngredientType[];
  };
  optimalColumns: {
    x?: string;
    y?: string;
    value?: string;
    category?: string;
  };
  magicalEffects: string[];
}

export type IngredientType = 'temporal' | 'numeric' | 'categorical' | 'geographic' | 'textual';

export interface IngredientAnalysis {
  column: string;
  type: IngredientType;
  potency: number; // 0-1 scale
  uniqueValues: number;
  magicalName: string;
  properties: string[];
}

export class RecipeEngine {
  private static recipes: ChartRecipe[] = [
    {
      id: 'temporal-essence-line',
      name: 'Temporal Essence Line Potion',
      chartType: 'line',
      confidence: 0.95,
      reasoning: 'Time-based data flows naturally through line visualizations, revealing trends and patterns',
      requiredIngredients: {
        primary: ['temporal'],
        secondary: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Shows trends over time', 'Reveals seasonal patterns', 'Highlights growth cycles']
    },
    {
      id: 'categorical-power-bar',
      name: 'Categorical Power Bar Elixir',
      chartType: 'bar',
      confidence: 0.9,
      reasoning: 'Categories naturally separate into distinct bars, perfect for comparisons',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Compares categories clearly', 'Ranks performance', 'Shows distribution']
    },
    {
      id: 'proportional-pie-spell',
      name: 'Proportional Pie Spell',
      chartType: 'pie',
      confidence: 0.85,
      reasoning: 'When categories form a complete whole, pie charts reveal proportional relationships',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Shows parts of whole', 'Reveals proportions', 'Highlights dominance']
    },
    {
      id: 'correlation-scatter-matrix',
      name: 'Correlation Scatter Matrix',
      chartType: 'scatter',
      confidence: 0.88,
      reasoning: 'Two numeric dimensions create perfect correlation landscapes',
      requiredIngredients: {
        primary: ['numeric'],
        secondary: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Reveals correlations', 'Shows clusters', 'Identifies outliers']
    },
    {
      id: 'geographic-map-enchantment',
      name: 'Geographic Map Enchantment',
      chartType: 'map',
      confidence: 0.92,
      reasoning: 'Geographic coordinates unlock the power of spatial visualization',
      requiredIngredients: {
        primary: ['geographic'],
        secondary: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Shows spatial patterns', 'Reveals geographic trends', 'Maps distributions']
    },
    {
      id: 'multi-dimensional-area',
      name: 'Multi-dimensional Area Brew',
      chartType: 'area',
      confidence: 0.8,
      reasoning: 'Stacked areas show how parts contribute to the whole over time',
      requiredIngredients: {
        primary: ['temporal'],
        secondary: ['numeric'],
        optional: ['categorical']
      },
      optimalColumns: {},
      magicalEffects: ['Shows cumulative effects', 'Reveals composition changes', 'Stacks contributions']
    }
  ];

  static analyzeIngredients(columns: ColumnInfo[]): IngredientAnalysis[] {
    return columns.map(column => {
      const type = this.classifyColumnType(column);
      const potency = this.calculatePotency(column);
      const magicalName = this.generateMagicalName(column.name, type);
      const properties = this.getIngredientProperties(column, type);

      return {
        column: column.name,
        type,
        potency,
        uniqueValues: 0, // Will be calculated from actual data if available
        magicalName,
        properties
      };
    });
  }

  static findBestRecipe(ingredients: IngredientAnalysis[]): ChartRecipe | null {
    let bestRecipe: ChartRecipe | null = null;
    let highestScore = 0;

    for (const recipe of this.recipes) {
      const score = this.scoreRecipe(recipe, ingredients);
      if (score > highestScore) {
        highestScore = score;
        bestRecipe = { ...recipe, confidence: score };
      }
    }

    return bestRecipe;
  }

  static findCompatibleRecipes(ingredients: IngredientAnalysis[]): ChartRecipe[] {
    return this.recipes
      .map(recipe => ({
        ...recipe,
        confidence: this.scoreRecipe(recipe, ingredients)
      }))
      .filter(recipe => recipe.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  static validateIngredientCombination(ingredients: IngredientAnalysis[]): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for minimum ingredients
    if (ingredients.length < 2) {
      issues.push('Need at least 2 ingredients for a proper recipe');
      suggestions.push('Add another data column to create a visualization');
    }

    // Check for ingredient diversity
    const types = new Set(ingredients.map(i => i.type));
    if (types.size === 1 && ingredients.length > 2) {
      issues.push('Too many ingredients of the same type may create chaos');
      suggestions.push('Try mixing different types of data columns');
    }

    // Check for temporal + categorical without numeric
    const hasNumeric = ingredients.some(i => i.type === 'numeric');
    const hasTemporal = ingredients.some(i => i.type === 'temporal');
    const hasCategorical = ingredients.some(i => i.type === 'categorical');

    if ((hasTemporal || hasCategorical) && !hasNumeric) {
      issues.push('Missing numeric essence for proper measurement');
      suggestions.push('Add a numeric column to provide values for visualization');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  private static classifyColumnType(column: ColumnInfo): IngredientType {
    const name = column.name.toLowerCase();
    
    // Geographic detection
    if (/(lat|lng|longitude|latitude|coord|geo)/i.test(name)) {
      return 'geographic';
    }

    // Column type mapping
    switch (column.type) {
      case 'date':
        return 'temporal';
      case 'numeric':
        return 'numeric';
      case 'categorical':
        return 'categorical';
      default:
        return 'textual';
    }
  }

  private static calculatePotency(column: ColumnInfo): number {
    let potency = 0.5; // Base potency

    // Higher potency for more unique values (up to a point)
    const uniqueRatio = 0 / 100; // Placeholder since uniqueValues not available
    potency += Math.min(uniqueRatio * 0.3, 0.3);

    // Boost for temporal and numeric types
    if (column.type === 'date' || column.type === 'numeric') {
      potency += 0.2;
    }

    return Math.min(potency, 1);
  }

  private static generateMagicalName(columnName: string, type: IngredientType): string {
    const prefixes = {
      temporal: ['Temporal Crystals of', 'Chronos Essence of', 'Time Spirits of'],
      numeric: ['Mystical Numbers of', 'Quantified Essence of', 'Numerical Aura of'],
      categorical: ['Categorical Gems of', 'Classification Runes of', 'Sorting Stones of'],
      geographic: ['Spatial Coordinates of', 'Geographic Compass of', 'Location Crystals of'],
      textual: ['Textual Scrolls of', 'Word Essence of', 'Script Magic of']
    };

    const typePrefix = prefixes[type];
    const randomPrefix = typePrefix[Math.floor(Math.random() * typePrefix.length)];
    
    return `${randomPrefix} ${columnName}`;
  }

  private static getIngredientProperties(column: ColumnInfo, type: IngredientType): string[] {
    const properties: string[] = [];
    
    properties.push('Essence ready'); // Placeholder since uniqueValues not available
    
    switch (type) {
      case 'temporal':
        properties.push('Flows through time', 'Reveals trends', 'Shows patterns');
        break;
      case 'numeric':
        properties.push('Quantifiable power', 'Measurable energy', 'Statistical magic');
        break;
      case 'categorical':
        properties.push('Distinct categories', 'Classification power', 'Grouping magic');
        break;
      case 'geographic':
        properties.push('Spatial awareness', 'Location binding', 'Geographic essence');
        break;
      case 'textual':
        properties.push('Descriptive power', 'Textual magic', 'Word essence');
        break;
    }

    return properties;
  }

  private static scoreRecipe(recipe: ChartRecipe, ingredients: IngredientAnalysis[]): number {
    let score = 0;
    const ingredientTypes = ingredients.map(i => i.type);

    // Check required primary ingredients
    const hasPrimary = recipe.requiredIngredients.primary.every(reqType =>
      ingredientTypes.includes(reqType)
    );
    if (!hasPrimary) return 0;

    score += 0.6; // Base score for meeting requirements

    // Check secondary ingredients
    if (recipe.requiredIngredients.secondary) {
      const hasSecondary = recipe.requiredIngredients.secondary.every(reqType =>
        ingredientTypes.includes(reqType)
      );
      if (hasSecondary) score += 0.3;
    } else {
      score += 0.3; // No secondary requirements
    }

    // Bonus for optimal number of ingredients
    const optimalCount = recipe.requiredIngredients.primary.length + 
                        (recipe.requiredIngredients.secondary?.length || 0);
    if (ingredients.length === optimalCount) {
      score += 0.1;
    }

    // Penalty for too many ingredients
    if (ingredients.length > optimalCount + 2) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }
}
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
    // === TEMPORAL ESSENCE RECIPES ===
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
    },

    // === CATEGORICAL POWER RECIPES ===
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
      id: 'hierarchy-treemap-potion',
      name: 'Hierarchy Treemap Potion',
      chartType: 'treemap',
      confidence: 0.82,
      reasoning: 'Nested categorical data forms natural hierarchies perfect for treemap visualization',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['numeric'],
        optional: ['categorical']
      },
      optimalColumns: {},
      magicalEffects: ['Shows hierarchical structure', 'Reveals size relationships', 'Nested proportions']
    },

    // === FREQUENCY & DISTRIBUTION RECIPES ===
    {
      id: 'histogram-transmutation',
      name: 'Histogram Transmutation Brew',
      chartType: 'histogram',
      confidence: 0.87,
      reasoning: 'Single numeric column reveals its distribution through frequency binning',
      requiredIngredients: {
        primary: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Shows data distribution', 'Reveals frequency patterns', 'Identifies data clusters']
    },

    // === CORRELATION & SCATTER RECIPES ===
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
      id: 'heatmap-intensity-fusion',
      name: 'Heatmap Intensity Fusion',
      chartType: 'heatmap',
      confidence: 0.84,
      reasoning: 'Two categorical dimensions with numeric intensity create perfect heatmap matrices',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['categorical', 'numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Shows intensity patterns', 'Reveals correlation matrices', 'Heat distribution']
    },

    // === GEOGRAPHIC ENCHANTMENTS ===
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
      id: 'geographic-3d-elevation',
      name: 'Geographic 3D Elevation Spell',
      chartType: 'map3d',
      confidence: 0.89,
      reasoning: 'Geographic data with elevation values creates immersive 3D terrain',
      requiredIngredients: {
        primary: ['geographic'],
        secondary: ['numeric'],
        optional: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['3D spatial visualization', 'Elevation mapping', 'Terrain analysis']
    },

    // === 3D DIMENSIONAL SPELLS ===
    {
      id: 'bar-3d-crystal-formation',
      name: '3D Bar Crystal Formation',
      chartType: 'bar3d',
      confidence: 0.86,
      reasoning: 'Three-dimensional bar charts add depth and perspective to categorical comparisons',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['numeric'],
        optional: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['3D categorical comparison', 'Multi-dimensional bars', 'Depth perception']
    },
    {
      id: 'scatter-3d-constellation',
      name: '3D Scatter Constellation',
      chartType: 'scatter3d',
      confidence: 0.91,
      reasoning: 'Three numeric dimensions create perfect 3D scatter constellation patterns',
      requiredIngredients: {
        primary: ['numeric'],
        secondary: ['numeric', 'numeric']
      },
      optimalColumns: {},
      magicalEffects: ['3D correlation patterns', 'Multi-dimensional clusters', 'Space visualization']
    },
    {
      id: 'surface-3d-reality-weaving',
      name: '3D Surface Reality Weaving',
      chartType: 'surface3d',
      confidence: 0.85,
      reasoning: 'Three numeric dimensions weave together to form continuous 3D surfaces',
      requiredIngredients: {
        primary: ['numeric'],
        secondary: ['numeric', 'numeric']
      },
      optimalColumns: {},
      magicalEffects: ['3D surface modeling', 'Continuous landscapes', 'Mathematical surfaces']
    },

    // === NETWORK & GRAPH SPELLS ===
    {
      id: 'network-connection-elixir',
      name: 'Network Connection Elixir',
      chartType: 'network',
      confidence: 0.83,
      reasoning: 'Categorical relationships form natural network connections and hierarchies',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['categorical'],
        optional: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Shows relationships', 'Network topology', 'Connection strength']
    },
    {
      id: 'network-3d-constellation',
      name: '3D Network Constellation',
      chartType: 'network3d',
      confidence: 0.87,
      reasoning: 'Multi-dimensional categorical relationships create immersive 3D network galaxies',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['categorical'],
        optional: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['3D network visualization', 'Spatial relationships', 'Network galaxies']
    },

    // === PERFORMANCE & KPI CRYSTALS ===
    {
      id: 'kpi-crystal-formation',
      name: 'KPI Crystal Formation',
      chartType: 'kpi',
      confidence: 0.79,
      reasoning: 'Key numeric indicators crystallize into powerful performance visualizations',
      requiredIngredients: {
        primary: ['numeric'],
        optional: ['categorical']
      },
      optimalColumns: {},
      magicalEffects: ['Key metric display', 'Performance indicators', 'Status crystals']
    },

    // === ADVANCED COMBINATIONS ===
    {
      id: 'stacked-bar-amplification',
      name: 'Stacked Bar Amplification',
      chartType: 'stackedbar',
      confidence: 0.88,
      reasoning: 'Multiple categorical dimensions with numeric values create powerful stacked comparisons',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['categorical', 'numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Stacked comparisons', 'Multi-dimensional analysis', 'Category breakdowns']
    },
    {
      id: 'sankey-flow-enchantment',
      name: 'Sankey Flow Enchantment',
      chartType: 'sankey',
      confidence: 0.81,
      reasoning: 'Flow between categorical states reveals process patterns and transitions',
      requiredIngredients: {
        primary: ['categorical'],
        secondary: ['categorical'],
        optional: ['numeric']
      },
      optimalColumns: {},
      magicalEffects: ['Shows process flows', 'Reveals transitions', 'Energy transfers']
    }
  ];

  static analyzeIngredients(columns: ColumnInfo[]): IngredientAnalysis[] {
    return columns.map(column => {
      const type = this.classifyColumnType(column);
      const potency = this.calculatePotency(column);
      const magicalName = this.generateMagicalName(column.name, type);
      const properties = this.getIngredientProperties(column, type);
      
      // Calculate unique values from actual column data
      const uniqueValues = column.values ? new Set(column.values).size : 0;

      return {
        column: column.name,
        type,
        potency,
        uniqueValues,
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
    const uniqueRecipes = new Map();
    
    return this.recipes
      .map(recipe => ({
        ...recipe,
        confidence: this.scoreRecipe(recipe, ingredients)
      }))
      .filter(recipe => recipe.confidence > 0.3)
      .filter(recipe => {
        // Prevent duplicate recipes by checking if we already have this chart type
        if (uniqueRecipes.has(recipe.chartType)) {
          const existing = uniqueRecipes.get(recipe.chartType);
          if (recipe.confidence > existing.confidence) {
            uniqueRecipes.set(recipe.chartType, recipe);
            return true;
          }
          return false;
        } else {
          uniqueRecipes.set(recipe.chartType, recipe);
          return true;
        }
      })
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
    
    // Enhanced Geographic detection
    if (/(lat|lng|longitude|latitude|coord|geo|location|address|city|state|country|postal|zip|region)/i.test(name)) {
      return 'geographic';
    }

    // Enhanced Temporal detection (for edge cases)
    if (/(time|date|year|month|day|quarter|fiscal|period|timestamp|created|updated|when)/i.test(name)) {
      return 'temporal';
    }

    // Column type mapping with enhanced categorical detection
    switch (column.type) {
      case 'date':
        return 'temporal';
      case 'numeric':
        // Check if numeric column might be geographic (like postal codes)
        if (/(postal|zip|code|id)/i.test(name) && column.values) {
          const uniqueValues = new Set(column.values).size;
          // If many unique values, might be geographic identifiers
          if (uniqueValues > column.values.length * 0.8) {
            return 'geographic';
          }
        }
        return 'numeric';
      case 'categorical':
        return 'categorical';
      default:
        // Enhanced textual analysis
        if (column.values) {
          const uniqueValues = new Set(column.values).size;
          const totalValues = column.values.length;
          
          // If low cardinality, treat as categorical
          if (uniqueValues <= 20 && uniqueValues < totalValues * 0.5) {
            return 'categorical';
          }
        }
        return 'textual';
    }
  }

  private static calculatePotency(column: ColumnInfo): number {
    let potency = 0.5; // Base potency

    // Calculate unique values ratio if data is available
    if (column.values && column.values.length > 0) {
      const uniqueValues = new Set(column.values).size;
      const totalValues = column.values.length;
      const uniqueRatio = uniqueValues / totalValues;
      potency += Math.min(uniqueRatio * 0.3, 0.3);
    }

    // Boost for temporal and numeric types
    if (column.type === 'date' || column.type === 'numeric') {
      potency += 0.2;
    }

    return Math.min(potency, 1);
  }

  private static generateMagicalName(columnName: string, type: IngredientType): string {
    const prefixes = {
      temporal: ['Temporal Crystals of', 'Chronos Essence of', 'Time Spirits of', 'Eternal Flows of', 'Temporal Vortex of'],
      numeric: ['Mystical Numbers of', 'Quantified Essence of', 'Numerical Aura of', 'Sacred Metrics of', 'Dimensional Power of'],
      categorical: ['Categorical Gems of', 'Classification Runes of', 'Sorting Stones of', 'Essence Clusters of', 'Category Crystals of'],
      geographic: ['Spatial Coordinates of', 'Geographic Compass of', 'Location Crystals of', 'Terrain Essence of', 'Cartographic Magic of'],
      textual: ['Textual Scrolls of', 'Word Essence of', 'Script Magic of', 'Linguistic Aura of', 'Semantic Crystals of']
    };

    const typePrefix = prefixes[type];
    const randomPrefix = typePrefix[Math.floor(Math.random() * typePrefix.length)];
    
    return `${randomPrefix} ${columnName}`;
  }

  private static getIngredientProperties(column: ColumnInfo, type: IngredientType): string[] {
    const properties: string[] = [];
    
    // Calculate actual unique values for better properties
    if (column.values && column.values.length > 0) {
      const uniqueValues = new Set(column.values).size;
      if (uniqueValues > 100) {
        properties.push('Highly diverse');
      } else if (uniqueValues > 10) {
        properties.push('Moderately diverse');
      } else {
        properties.push('Limited variety');
      }
    } else {
      properties.push('Essence ready');
    }
    
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
    const typeCount = ingredientTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check required primary ingredients
    const hasPrimary = recipe.requiredIngredients.primary.every(reqType =>
      ingredientTypes.includes(reqType)
    );
    if (!hasPrimary) return 0;

    score += 0.6; // Base score for meeting requirements

    // Enhanced secondary ingredient scoring
    if (recipe.requiredIngredients.secondary) {
      const requiredSecondary = recipe.requiredIngredients.secondary;
      let secondaryScore = 0;
      
      for (const reqType of requiredSecondary) {
        if (ingredientTypes.includes(reqType)) {
          secondaryScore += 1;
        }
      }
      
      // Partial credit for secondary ingredients
      const secondaryPercent = secondaryScore / requiredSecondary.length;
      score += secondaryPercent * 0.3;
    } else {
      score += 0.3; // No secondary requirements
    }

    // Bonus for ingredient diversity in appropriate recipes
    const uniqueTypes = new Set(ingredientTypes).size;
    if (uniqueTypes >= 2 && ['scatter', 'heatmap', 'scatter3d', 'network'].includes(recipe.chartType)) {
      score += 0.05;
    }

    // Special bonuses for specific combinations
    if (recipe.chartType === 'histogram' && typeCount.numeric === 1 && ingredients.length === 1) {
      score += 0.15; // Perfect histogram scenario
    }
    
    if (recipe.chartType === 'scatter3d' && typeCount.numeric >= 3) {
      score += 0.1; // Ideal 3D scatter scenario
    }
    
    if (['bar3d', 'surface3d'].includes(recipe.chartType) && typeCount.numeric >= 2) {
      score += 0.08; // Good 3D visualization scenario
    }

    if (['network', 'network3d'].includes(recipe.chartType) && typeCount.categorical >= 2) {
      score += 0.12; // Excellent network scenario
    }

    // Data quality bonuses
    const avgPotency = ingredients.reduce((sum, ing) => sum + ing.potency, 0) / ingredients.length;
    score += avgPotency * 0.1;

    // Penalty for too many ingredients (more nuanced)
    const optimalCount = recipe.requiredIngredients.primary.length + 
                        (recipe.requiredIngredients.secondary?.length || 0);
    if (ingredients.length > optimalCount + 2) {
      score -= Math.min((ingredients.length - optimalCount - 2) * 0.05, 0.2);
    }

    return Math.max(0, Math.min(1, score));
  }
}
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
    
    // Enhanced Geographic detection with comprehensive patterns
    if (this.isGeographicColumn(name, column)) {
      return 'geographic';
    }

    // Enhanced Temporal detection with more patterns
    if (this.isTemporalColumn(name, column)) {
      return 'temporal';
    }

    // Column type mapping with enhanced categorical detection
    switch (column.type) {
      case 'date':
        return 'temporal';
      case 'numeric':
        return this.analyzeNumericColumn(name, column);
      case 'categorical':
        return 'categorical';
      default:
        return this.analyzeTextualColumn(column);
    }
  }

  private static isGeographicColumn(name: string, column: ColumnInfo): boolean {
    // Extended geographic patterns
    const geoPatterns = [
      // Coordinate patterns
      /(lat|lng|longitude|latitude|coord|geo)/i,
      // Location patterns
      /(location|address|city|state|country|region|territory|province)/i,
      // Postal patterns
      /(postal|zip|zipcode|postcode)/i,
      // Administrative patterns
      /(county|district|municipality|borough|parish)/i,
      // Geographic identifiers
      /(fips|iso|geoname|placeid)/i
    ];

    // Check name patterns
    if (geoPatterns.some(pattern => pattern.test(name))) {
      return true;
    }

    // Analyze actual values for geographic patterns
    if (column.values && column.values.length > 0) {
      const sampleValues = column.values.slice(0, Math.min(50, column.values.length));
      
      // Check for coordinate patterns (lat/lng ranges) - only if name suggests geographic
      if (column.type === 'numeric') {
        const numValues = sampleValues.map(v => parseFloat(String(v))).filter(v => !isNaN(v));
        if (numValues.length > 0) {
          const min = Math.min(...numValues);
          const max = Math.max(...numValues);
          
          // Only check coordinate ranges if column name explicitly suggests coordinates
          const isExplicitlyGeographic = /(lat|lng|longitude|latitude|coord|geo|x_coord|y_coord)/i.test(name);
          
          if (isExplicitlyGeographic) {
            // Latitude range check (-90 to 90)
            if (min >= -90 && max <= 90 && /(lat|latitude|y_coord)/i.test(name)) {
              return true;
            }
            
            // Longitude range check (-180 to 180)  
            if (min >= -180 && max <= 180 && /(lng|lon|longitude|x_coord)/i.test(name)) {
              return true;
            }
          }
        }
      }

      // Check for postal codes patterns
      const postalPattern = /^\d{5}(-\d{4})?$|^[A-Z]\d[A-Z] \d[A-Z]\d$/;
      if (sampleValues.some(val => postalPattern.test(String(val)))) {
        return true;
      }

      // Check for country codes (ISO patterns)
      if (sampleValues.every(val => /^[A-Z]{2,3}$/.test(String(val)))) {
        return true;
      }
    }

    return false;
  }

  private static isTemporalColumn(name: string, column: ColumnInfo): boolean {
    // Extended temporal patterns
    const temporalPatterns = [
      // Standard time patterns
      /(time|date|year|month|day|hour|minute|second)/i,
      // Business time patterns
      /(quarter|fiscal|period|semester|season)/i,
      // Event time patterns
      /(timestamp|created|updated|modified|published|when|start|end|begin|finish)/i,
      // Relative time patterns
      /(ago|since|until|before|after|during)/i
    ];

    // Check name patterns
    if (temporalPatterns.some(pattern => pattern.test(name))) {
      return true;
    }

    // Analyze values for temporal patterns
    if (column.values && column.values.length > 0) {
      const sampleValues = column.values.slice(0, Math.min(20, column.values.length));
      
      // Check for year patterns (1900-2100)
      if (column.type === 'numeric') {
        const numValues = sampleValues.map(v => parseInt(String(v))).filter(v => !isNaN(v));
        if (numValues.every(val => val >= 1900 && val <= 2100)) {
          return true;
        }
      }

      // Check for date-like strings
      const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}/;
      if (sampleValues.some(val => datePattern.test(String(val)))) {
        return true;
      }

      // Check for quarter patterns (Q1, Q2, etc.)
      if (sampleValues.some(val => /^Q[1-4]|[1-4]Q|\d{4}Q[1-4]/.test(String(val)))) {
        return true;
      }
    }

    return false;
  }

  private static analyzeNumericColumn(name: string, column: ColumnInfo): IngredientType {
    // Check if numeric column might be geographic (like postal codes)
    if (/(postal|zip|code|id|fips)/i.test(name) && column.values) {
      const uniqueValues = new Set(column.values).size;
      // If many unique values, might be geographic identifiers
      if (uniqueValues > column.values.length * 0.8) {
        return 'geographic';
      }
    }

    // Check if it might be temporal (years, timestamps)
    if (column.values && column.values.length > 0) {
      const sampleValues = column.values.slice(0, Math.min(20, column.values.length));
      const numValues = sampleValues.map(v => parseFloat(String(v))).filter(v => !isNaN(v));
      
      if (numValues.length > 0) {
        const min = Math.min(...numValues);
        const max = Math.max(...numValues);
        
        // Check for year range
        if (min >= 1900 && max <= 2100 && numValues.every(v => v % 1 === 0)) {
          return 'temporal';
        }
        
        // Check for timestamp range (Unix timestamps)
        if (min > 1000000000 && max < 9999999999) {
          return 'temporal';
        }
      }
    }

    return 'numeric';
  }

  private static analyzeTextualColumn(column: ColumnInfo): IngredientType {
    if (!column.values || column.values.length === 0) {
      return 'textual';
    }

    const uniqueValues = new Set(column.values).size;
    const totalValues = column.values.length;
    const uniqueRatio = uniqueValues / totalValues;

    // Enhanced categorical detection
    // Low cardinality suggests categorical
    if (uniqueValues <= 50 && uniqueRatio < 0.7) {
      return 'categorical';
    }

    // Medium cardinality with patterns might still be categorical
    if (uniqueValues <= 200 && uniqueRatio < 0.5) {
      // Check if values follow categorical patterns
      const sampleValues = column.values.slice(0, Math.min(50, column.values.length));
      
      // Check for status/category patterns
      const categoryPatterns = [
        /^(yes|no|true|false|y|n|t|f)$/i,
        /^(active|inactive|enabled|disabled|on|off)$/i,
        /^(high|medium|low|small|large|xl|xxl)$/i,
        /^(new|old|pending|approved|rejected|cancelled)$/i,
        /^[A-Z]{1,3}$/  // Short codes like "CA", "NY", "USD"
      ];
      
      if (sampleValues.some(val => categoryPatterns.some(pattern => pattern.test(String(val))))) {
        return 'categorical';
      }
    }

    return 'textual';
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

    // Apply advanced scoring bonuses
    score += this.calculateSynergyBonus(recipe, ingredients, typeCount);
    score += this.calculateDataSizeBonus(recipe, ingredients);
    score += this.calculateComplexityBonus(recipe, ingredients);
    score += this.calculateQualityBonus(ingredients);

    // Apply penalties
    score -= this.calculateOvercrowdingPenalty(recipe, ingredients);

    return Math.max(0, Math.min(1, score));
  }

  private static calculateSynergyBonus(recipe: ChartRecipe, ingredients: IngredientAnalysis[], typeCount: Record<string, number>): number {
    let synergyBonus = 0;

    // Ingredient diversity bonuses for appropriate recipes
    const uniqueTypes = new Set(ingredients.map(i => i.type)).size;
    
    // Multi-dimensional visualizations benefit from diversity
    if (['scatter', 'heatmap', 'scatter3d', 'network', 'bubble'].includes(recipe.chartType)) {
      if (uniqueTypes >= 3) synergyBonus += 0.1;
      else if (uniqueTypes >= 2) synergyBonus += 0.05;
    }

    // Perfect combinations for specific chart types
    const perfectCombinations: Record<string, () => number> = {
      histogram: () => typeCount.numeric === 1 && ingredients.length === 1 ? 0.15 : 0,
      scatter3d: () => typeCount.numeric >= 3 ? 0.12 : 0,
      surface3d: () => typeCount.numeric >= 2 && typeCount.categorical >= 1 ? 0.1 : 0,
      bar3d: () => typeCount.categorical >= 1 && typeCount.numeric >= 1 ? 0.08 : 0,
      network: () => typeCount.categorical >= 2 ? 0.15 : 0,
      network3d: () => typeCount.categorical >= 2 && typeCount.numeric >= 1 ? 0.12 : 0,
      treemap: () => typeCount.categorical >= 2 && typeCount.numeric >= 1 ? 0.1 : 0,
      map3d: () => typeCount.geographic >= 1 && typeCount.numeric >= 1 ? 0.12 : 0,
      line: () => typeCount.temporal >= 1 && typeCount.numeric >= 1 ? 0.1 : 0,
      area: () => typeCount.temporal >= 1 && typeCount.numeric >= 1 && typeCount.categorical >= 1 ? 0.08 : 0
    };

    const perfectBonus = perfectCombinations[recipe.chartType];
    if (perfectBonus) {
      synergyBonus += perfectBonus();
    }

    // Temporal-numeric synergy (time series magic)
    if (typeCount.temporal >= 1 && typeCount.numeric >= 1) {
      if (['line', 'area', 'scatter'].includes(recipe.chartType)) {
        synergyBonus += 0.08;
      }
    }

    // Geographic-numeric synergy (spatial analysis magic)
    if (typeCount.geographic >= 1 && typeCount.numeric >= 1) {
      if (['map', 'map3d', 'heatmap'].includes(recipe.chartType)) {
        synergyBonus += 0.1;
      }
    }

    // Categorical-numeric synergy (comparison magic)
    if (typeCount.categorical >= 1 && typeCount.numeric >= 1) {
      if (['bar', 'pie', 'treemap', 'stacked-bar'].includes(recipe.chartType)) {
        synergyBonus += 0.06;
      }
    }

    return synergyBonus;
  }

  private static calculateDataSizeBonus(recipe: ChartRecipe, ingredients: IngredientAnalysis[]): number {
    let sizeBonus = 0;
    
    // Calculate total data points estimate
    const totalDataPoints = ingredients.reduce((sum, ing) => sum + ing.uniqueValues, 0);
    
    // Different charts work better with different data sizes
    const sizePreferences: Record<string, { small: number; medium: number; large: number }> = {
      pie: { small: 0.1, medium: 0.05, large: -0.1 }, // Pie charts better with fewer categories
      treemap: { small: 0.0, medium: 0.08, large: 0.1 }, // Treemaps handle more data well
      network: { small: 0.05, medium: 0.1, large: 0.05 }, // Networks work best with medium complexity
      heatmap: { small: -0.05, medium: 0.08, large: 0.12 }, // Heatmaps excel with larger datasets
      histogram: { small: -0.1, medium: 0.05, large: 0.1 }, // Histograms need sufficient data
      scatter3d: { small: -0.05, medium: 0.05, large: 0.08 }, // 3D scatter needs enough points
      surface3d: { small: -0.1, medium: 0.0, large: 0.1 } // Surfaces need dense data
    };

    const preferences = sizePreferences[recipe.chartType];
    if (preferences) {
      if (totalDataPoints < 50) {
        sizeBonus += preferences.small;
      } else if (totalDataPoints < 500) {
        sizeBonus += preferences.medium;
      } else {
        sizeBonus += preferences.large;
      }
    }

    return sizeBonus;
  }

  private static calculateComplexityBonus(recipe: ChartRecipe, ingredients: IngredientAnalysis[]): number {
    let complexityBonus = 0;
    
    // Calculate data complexity score
    const avgPotency = ingredients.reduce((sum, ing) => sum + ing.potency, 0) / ingredients.length;
    const typeVariety = new Set(ingredients.map(i => i.type)).size;
    const complexityScore = (avgPotency + (typeVariety / 5)) / 2;

    // Match complexity with chart sophistication
    const chartComplexity: Record<string, number> = {
      // Simple charts (complexity 0.2-0.4)
      pie: 0.2, bar: 0.3, line: 0.3,
      // Medium charts (complexity 0.4-0.7)
      scatter: 0.5, area: 0.5, histogram: 0.4, heatmap: 0.6,
      // Complex charts (complexity 0.7-1.0)
      treemap: 0.7, network: 0.8, scatter3d: 0.9, surface3d: 1.0, network3d: 0.95
    };

    const targetComplexity = chartComplexity[recipe.chartType] || 0.5;
    const complexityMatch = 1 - Math.abs(complexityScore - targetComplexity);
    
    // Bonus for good complexity matching
    if (complexityMatch > 0.8) {
      complexityBonus += 0.08;
    } else if (complexityMatch > 0.6) {
      complexityBonus += 0.04;
    }

    return complexityBonus;
  }

  private static calculateQualityBonus(ingredients: IngredientAnalysis[]): number {
    const avgPotency = ingredients.reduce((sum, ing) => sum + ing.potency, 0) / ingredients.length;
    
    // High-quality ingredients deserve better recipes
    if (avgPotency > 0.8) return 0.1;
    if (avgPotency > 0.6) return 0.05;
    if (avgPotency < 0.3) return -0.05; // Penalty for low-quality ingredients
    
    return 0;
  }

  private static calculateOvercrowdingPenalty(recipe: ChartRecipe, ingredients: IngredientAnalysis[]): number {
    const optimalCount = recipe.requiredIngredients.primary.length + 
                        (recipe.requiredIngredients.secondary?.length || 0);
    
    // More nuanced overcrowding penalties
    const excessIngredients = ingredients.length - optimalCount;
    
    if (excessIngredients <= 0) return 0;
    
    // Some charts handle extra ingredients better than others
    const overcrowdingTolerance: Record<string, number> = {
      network: 0.02,    // Networks can handle many nodes
      heatmap: 0.03,    // Heatmaps work with many dimensions
      treemap: 0.025,   // Treemaps accommodate hierarchies
      scatter3d: 0.035, // 3D scatter can show more dimensions
      surface3d: 0.04,  // Surfaces can use multiple metrics
    };

    const basePenalty = overcrowdingTolerance[recipe.chartType] || 0.05;
    return Math.min(excessIngredients * basePenalty, 0.25); // Cap penalty at 0.25
  }

  // Enhanced recipe finding with conditional logic
  static findCompatibleRecipes(ingredients: IngredientAnalysis[]): ChartRecipe[] {
    if (ingredients.length === 0) return [];

    const allRecipes = this.recipes
      .map(recipe => ({
        ...recipe,
        confidence: this.scoreRecipe(recipe, ingredients)
      }))
      .filter(recipe => recipe.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence);

    // Apply conditional filtering based on data characteristics
    return this.applyConditionalFiltering(allRecipes, ingredients);
  }

  private static applyConditionalFiltering(recipes: ChartRecipe[], ingredients: IngredientAnalysis[]): ChartRecipe[] {
    const dataSize = ingredients.reduce((sum, ing) => sum + ing.uniqueValues, 0);
    const typeCount = ingredients.reduce((acc, ing) => {
      acc[ing.type] = (acc[ing.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return recipes.filter(recipe => {
      // Filter out inappropriate 3D visualizations for small datasets
      if (['scatter3d', 'surface3d', 'bar3d'].includes(recipe.chartType) && dataSize < 100) {
        return recipe.confidence > 0.7; // Higher threshold for 3D with small data
      }

      // Filter out network graphs if insufficient categorical relationships
      if (['network', 'network3d'].includes(recipe.chartType) && typeCount.categorical < 2) {
        return false;
      }

      // Filter out geographic charts if no clear geographic data
      if (['map', 'map3d'].includes(recipe.chartType) && !typeCount.geographic) {
        return recipe.confidence > 0.8; // Very high threshold for non-geo data on maps
      }

      // Filter out overly complex visualizations for simple data
      const complexCharts = ['treemap', 'heatmap', 'surface3d', 'network3d'];
      if (complexCharts.includes(recipe.chartType) && ingredients.length <= 2 && dataSize < 50) {
        return recipe.confidence > 0.6;
      }

      return true;
    }).slice(0, 12); // Limit to top 12 most relevant recipes
  }
}
import { ColumnInfo } from '@/pages/Index';
import { CHART_RECIPES } from './chartRecipes';
import { 
  TEMPORAL_PATTERNS, 
  DATE_PATTERN,
  QUARTER_PATTERN,
  CATEGORY_PATTERNS,
  POSTAL_CODE_PATTERN,
  YEAR_RANGE,
  UNIX_TIMESTAMP_RANGE,
  CARDINALITY_THRESHOLDS
} from './recipePatterns';
import { GeographicDetector } from './geographicDetector';
import { PieChartHandler } from './pieChartHandler';
import { 
  RECIPE_CONFIG,
  SCORING_CONFIG, 
  CHART_COMPLEXITY,
  OVERCROWDING_TOLERANCE,
  DATA_SIZE_PREFERENCES,
  logDebug,
  logPerformance
} from './recipeConfig';

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

/**
 * Recipe Engine - Enhanced and Refactored
 * 
 * Analyzes data ingredients (columns) and suggests optimal chart recipes.
 * Now with improved modularity, better documentation, and configurable logging.
 */
export class RecipeEngine {
  private static recipes: ChartRecipe[] = CHART_RECIPES;

  /**
   * Analyzes column data and converts them into magical ingredients
   */
  static analyzeIngredients(columns: ColumnInfo[]): IngredientAnalysis[] {
    const startTime = Date.now();
    
    const ingredients = columns.map(column => {
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
    
    logPerformance('analyzeIngredients', startTime);
    logDebug('Analyzed ingredients', { count: ingredients.length, types: ingredients.map(i => i.type) });
    
    return ingredients;
  }

  /**
   * Finds the best recipe for given ingredients
   */
  static findBestRecipe(ingredients: IngredientAnalysis[]): ChartRecipe | null {
    const startTime = Date.now();
    
    let bestRecipe: ChartRecipe | null = null;
    let highestScore = 0;

    for (const recipe of this.recipes) {
      const score = this.scoreRecipe(recipe, ingredients);
      if (score > highestScore) {
        highestScore = score;
        bestRecipe = { ...recipe, confidence: score };
      }
    }

    logPerformance('findBestRecipe', startTime);
    logDebug('Best recipe found', { 
      recipe: bestRecipe?.name, 
      score: highestScore,
      ingredientCount: ingredients.length 
    });

    return bestRecipe;
  }

  /**
   * Validates ingredient combination and provides feedback
   */
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

  /**
   * Classifies column type with enhanced detection logic
   */
  private static classifyColumnType(column: ColumnInfo): IngredientType {
    // Enhanced Geographic detection with contextual analysis
    if (GeographicDetector.isGeographic(column.name, column)) {
      return 'geographic';
    }

    // Enhanced Temporal detection with more patterns
    if (this.isTemporalColumn(column.name, column)) {
      return 'temporal';
    }

    // Column type mapping with enhanced categorical detection
    switch (column.type) {
      case 'date':
        return 'temporal';
      case 'numeric':
        return this.analyzeNumericColumn(column.name, column);
      case 'categorical':
        return 'categorical';
      default:
        return this.analyzeTextualColumn(column);
    }
  }

  /**
   * Enhanced temporal detection with exclusion patterns and confidence scoring
   */
  private static isTemporalColumn(name: string, column: ColumnInfo): boolean {
    const normalizedName = name.toLowerCase();
    
    // 1. HIGHEST CONFIDENCE - Exact temporal column names
    const exactTemporalNames = [
      'date', 'datetime', 'timestamp', 'time',
      'created_at', 'updated_at', 'deleted_at',
      'created_date', 'updated_date', 'modified_date',
      'start_date', 'end_date', 'due_date',
      'birth_date', 'hire_date', 'termination_date',
      'publication_date', 'expiry_date', 'expiration_date'
    ];
    
    if (exactTemporalNames.includes(normalizedName.replace(/[_\-]/g, ''))) {
      return true; // 100% confidence for exact matches
    }
    
    // 2. Check column type first (most reliable)
    if (column.type === 'date') {
      return true; // Database told us it's temporal
    }
    
    // 3. Check for temporal patterns in name (but exclude false positives)
    const temporalPatterns = [
      /^(year|month|day|week|quarter)$/i,  // Exact time units
      /_(date|time|timestamp|at)$/i,        // Suffix patterns
      /^(date|time|timestamp)_/i,           // Prefix patterns
      /\b(created|updated|modified|deleted|published|expired)\b.*\b(at|on|date|time)\b/i,
    ];
    
    // EXCLUSION PATTERNS - these are NOT temporal
    const exclusionPatterns = [
      /spend|cost|price|amount|revenue|profit|budget|expense/i,  // Financial terms
      /count|total|sum|avg|average|mean|median/i,                // Aggregations
      /score|rating|rank|percent|ratio/i,                        // Metrics
      /id|code|number|num$/i,                                    // Identifiers
    ];
    
    // Reject if it matches exclusion patterns
    if (exclusionPatterns.some(pattern => pattern.test(normalizedName))) {
      return false;
    }
    
    // Check temporal patterns
    if (temporalPatterns.some(pattern => pattern.test(normalizedName))) {
      return true;
    }
    
    // 4. Analyze actual values for temporal patterns
    if (column.values && column.values.length > 0) {
      return this.analyzeValuesForTemporalPatterns(column.values);
    }
    
    return false;
  }

  /**
   * Analyzes column values to detect temporal patterns
   */
  private static analyzeValuesForTemporalPatterns(values: any[]): boolean {
    const sampleSize = Math.min(20, values.length);
    const sampleValues = values.slice(0, sampleSize).filter(v => v != null);
    
    if (sampleValues.length === 0) return false;
    
    let temporalMatches = 0;
    
    for (const value of sampleValues) {
      const strValue = String(value).trim();
      
      // Check various date formats
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/,                    // 2024-01-15
        /^\d{4}\/\d{2}\/\d{2}$/,                  // 2024/01/15
        /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/,      // 1/15/2024 or 15-01-2024
        /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/, // ISO datetime
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i, // Month names
        /^Q[1-4]\s?\d{4}$/,                       // Q1 2024
        /^\d{4}$/,                                 // Just year (if 1900-2100)
      ];
      
      if (datePatterns.some(pattern => pattern.test(strValue))) {
        temporalMatches++;
        continue;
      }
      
      // Check if it's a year (special case for numeric columns)
      const numValue = parseInt(strValue);
      if (!isNaN(numValue) && numValue >= 1900 && numValue <= 2100) {
        temporalMatches++;
      }
    }
    
    // If >80% of samples match temporal patterns, it's temporal
    return (temporalMatches / sampleValues.length) > 0.8;
  }

  /**
   * Enhanced temporal detection with confidence scoring
   */
  private static detectTemporalWithConfidence(
    name: string, 
    column: ColumnInfo
  ): { type: IngredientType; confidence: number; reasoning: string } | null {
    const normalizedName = name.toLowerCase();
    
    // Very high confidence cases
    if (column.type === 'date') {
      return {
        type: 'temporal',
        confidence: 1.0,
        reasoning: 'Column type is explicitly date/datetime'
      };
    }
    
    // Exact name matches
    const exactMatches = ['date', 'datetime', 'timestamp', 'created_at', 'updated_at'];
    if (exactMatches.includes(normalizedName.replace(/[_\-]/g, ''))) {
      return {
        type: 'temporal',
        confidence: 0.95,
        reasoning: 'Column name is a standard temporal field'
      };
    }
    
    // Check for false positives first
    if (/spend|cost|revenue|amount|price|budget/i.test(normalizedName)) {
      return null; // Definitely not temporal
    }
    
    // Partial name matches
    if (/date|time|year|month|day/i.test(normalizedName)) {
      // But check values to be sure
      const valueScore = this.scoreTemporalValues(column.values);
      if (valueScore > 0.5) {
        return {
          type: 'temporal',
          confidence: Math.min(0.9, 0.6 + valueScore * 0.3),
          reasoning: 'Name suggests temporal, values confirm'
        };
      }
    }
    
    // Pure value-based detection (lower confidence)
    const valueScore = this.scoreTemporalValues(column.values);
    if (valueScore > 0.8) {
      return {
        type: 'temporal',
        confidence: valueScore * 0.7, // Max 0.7 confidence without name evidence
        reasoning: 'Values appear to be dates/times'
      };
    }
    
    return null;
  }

  /**
   * Scores how temporal the column values appear to be
   */
  private static scoreTemporalValues(values: any[]): number {
    if (!values || values.length === 0) return 0;
    
    const sample = values.slice(0, Math.min(50, values.length));
    let matches = 0;
    
    for (const value of sample) {
      if (this.looksLikeTemporal(value)) {
        matches++;
      }
    }
    
    return matches / sample.length;
  }

  /**
   * Checks if a single value looks like temporal data
   */
  private static looksLikeTemporal(value: any): boolean {
    if (value == null) return false;
    
    const str = String(value).trim();
    
    // Try parsing as date
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) {
      const date = new Date(parsed);
      // Check if it's a reasonable date (1900-2100)
      const year = date.getFullYear();
      if (year >= 1900 && year <= 2100) {
        return true;
      }
    }
    
    // Check common patterns
    const patterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^(19|20)\d{2}$/,  // Years
      /^Q[1-4]\s?\d{4}$/,  // Quarters
    ];
    
    return patterns.some(p => p.test(str));
  }

  /**
   * Analyzes numeric columns for potential type reclassification
   */
  private static analyzeNumericColumn(name: string, column: ColumnInfo): IngredientType {
    // Check if numeric column might be geographic (like postal codes)
    if (POSTAL_CODE_PATTERN.test(name) && column.values) {
      const uniqueValues = new Set(column.values).size;
      // If many unique values, might be geographic identifiers
      if (uniqueValues > column.values.length * CARDINALITY_THRESHOLDS.HIGH_UNIQUENESS_GEOGRAPHIC) {
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
        if (min >= YEAR_RANGE.min && max <= YEAR_RANGE.max && numValues.every(v => v % 1 === 0)) {
          return 'temporal';
        }
        
        // Check for timestamp range (Unix timestamps)
        if (min > UNIX_TIMESTAMP_RANGE.min && max < UNIX_TIMESTAMP_RANGE.max) {
          return 'temporal';
        }
      }
    }

    return 'numeric';
  }

  /**
   * Analyzes textual columns for categorical classification
   */
  private static analyzeTextualColumn(column: ColumnInfo): IngredientType {
    if (!column.values || column.values.length === 0) {
      return 'textual';
    }

    const uniqueValues = new Set(column.values).size;
    const totalValues = column.values.length;
    const uniqueRatio = uniqueValues / totalValues;

    // Enhanced categorical detection - Low cardinality suggests categorical
    if (uniqueValues <= CARDINALITY_THRESHOLDS.LOW_CATEGORICAL && uniqueRatio < CARDINALITY_THRESHOLDS.LOW_UNIQUENESS_RATIO) {
      return 'categorical';
    }

    // Medium cardinality with patterns might still be categorical
    if (uniqueValues <= CARDINALITY_THRESHOLDS.MEDIUM_CATEGORICAL && uniqueRatio < CARDINALITY_THRESHOLDS.MEDIUM_UNIQUENESS_RATIO) {
      // Check if values follow categorical patterns
      const sampleValues = column.values.slice(0, Math.min(RECIPE_CONFIG.valueSampleSize, column.values.length));
      
      if (sampleValues.some(val => CATEGORY_PATTERNS.some(pattern => pattern.test(String(val))))) {
        return 'categorical';
      }
    }

    return 'textual';
  }

  /**
   * Calculates ingredient potency based on data quality metrics
   */
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

  /**
   * Generates magical names for ingredients based on type
   */
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

  /**
   * Gets ingredient properties based on type and characteristics
   */
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

  /**
   * Scores a recipe against given ingredients with enhanced logic
   */
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

    score += SCORING_CONFIG.PRIMARY_INGREDIENT_SCORE; // Base score for meeting primary requirements

    // Enhanced secondary ingredient scoring - MUST have at least one secondary ingredient
    if (recipe.requiredIngredients.secondary) {
      const requiredSecondary = recipe.requiredIngredients.secondary;
      let secondaryMatches = 0;
      
      for (const reqType of requiredSecondary) {
        if (ingredientTypes.includes(reqType)) {
          secondaryMatches += 1;
        }
      }
      
      // CRITICAL: Require at least one secondary ingredient match for charts that need them
      if (secondaryMatches === 0) {
        logDebug(`Recipe ${recipe.id} rejected: No secondary ingredients match`, {
          required: requiredSecondary,
          available: ingredientTypes,
          ingredientCount: ingredients.length
        });
        return 0;
      }
      
      // Use dedicated pie chart handler for pie chart logic
      if (recipe.chartType === 'pie') {
        const pieValidation = PieChartHandler.validatePieChartIngredients(ingredients);
        if (!pieValidation.isValid) {
          logDebug(`Pie chart rejected`, { issues: pieValidation.issues });
          return 0;
        }
        score += pieValidation.score;
      }
      
      // Award points based on how many secondary ingredients match
      const secondaryPercent = secondaryMatches / requiredSecondary.length;
      score += SCORING_CONFIG.SECONDARY_INGREDIENT_SCORE + (secondaryPercent * 0.2); // Base + bonus for extra matches
    } else {
      score += SCORING_CONFIG.SECONDARY_INGREDIENT_SCORE; // No secondary requirements
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

  /**
   * Calculates synergy bonus for ingredient combinations
   */
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
      histogram: () => typeCount.numeric === 1 && ingredients.length === 1 ? SCORING_CONFIG.HISTOGRAM_PERFECT_BONUS : 0,
      pie: () => PieChartHandler.calculatePieSynergyBonus(ingredients),
      scatter3d: () => typeCount.numeric >= 3 ? SCORING_CONFIG.SCATTER3D_BONUS : 0,
      surface3d: () => typeCount.numeric >= 2 && typeCount.categorical >= 1 ? 0.1 : 0,
      bar3d: () => typeCount.categorical >= 1 && typeCount.numeric >= 1 ? 0.08 : 0,
      network: () => typeCount.categorical >= 2 ? SCORING_CONFIG.NETWORK_BONUS : 0,
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

    // Type-specific synergy bonuses
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

  /**
   * Calculates data size bonus based on chart preferences
   */
  private static calculateDataSizeBonus(recipe: ChartRecipe, ingredients: IngredientAnalysis[]): number {
    let sizeBonus = 0;
    
    // Calculate total data points estimate
    const totalDataPoints = ingredients.reduce((sum, ing) => sum + ing.uniqueValues, 0);
    
    const preferences = DATA_SIZE_PREFERENCES[recipe.chartType];
    if (preferences) {
      if (totalDataPoints < SCORING_CONFIG.DATA_SIZE_SMALL) {
        sizeBonus += preferences.small;
      } else if (totalDataPoints < SCORING_CONFIG.DATA_SIZE_MEDIUM) {
        sizeBonus += preferences.medium;
      } else {
        sizeBonus += preferences.large;
      }
    }

    return sizeBonus;
  }

  /**
   * Calculates complexity bonus based on data-chart matching
   */
  private static calculateComplexityBonus(recipe: ChartRecipe, ingredients: IngredientAnalysis[]): number {
    let complexityBonus = 0;
    
    // Calculate data complexity score
    const avgPotency = ingredients.reduce((sum, ing) => sum + ing.potency, 0) / ingredients.length;
    const typeVariety = new Set(ingredients.map(i => i.type)).size;
    const complexityScore = (avgPotency + (typeVariety / 5)) / 2;

    // Match complexity with chart sophistication
    const targetComplexity = CHART_COMPLEXITY[recipe.chartType] || 0.5;
    const complexityMatch = 1 - Math.abs(complexityScore - targetComplexity);
    
    // Bonus for good complexity matching
    if (complexityMatch > 0.8) {
      complexityBonus += SCORING_CONFIG.COMPLEXITY_BONUS_HIGH;
    } else if (complexityMatch > 0.6) {
      complexityBonus += SCORING_CONFIG.COMPLEXITY_BONUS_MEDIUM;
    }

    return complexityBonus;
  }

  /**
   * Calculates quality bonus based on ingredient potency
   */
  private static calculateQualityBonus(ingredients: IngredientAnalysis[]): number {
    const avgPotency = ingredients.reduce((sum, ing) => sum + ing.potency, 0) / ingredients.length;
    
    // High-quality ingredients deserve better recipes
    if (avgPotency > 0.8) return SCORING_CONFIG.QUALITY_BONUS_HIGH;
    if (avgPotency > 0.6) return SCORING_CONFIG.QUALITY_BONUS_MEDIUM;
    if (avgPotency < 0.3) return SCORING_CONFIG.QUALITY_PENALTY_LOW; // Penalty for low-quality ingredients
    
    return 0;
  }

  /**
   * Calculates overcrowding penalty for too many ingredients
   */
  private static calculateOvercrowdingPenalty(recipe: ChartRecipe, ingredients: IngredientAnalysis[]): number {
    const optimalCount = recipe.requiredIngredients.primary.length + 
                        (recipe.requiredIngredients.secondary?.length || 0);
    
    // More nuanced overcrowding penalties
    const excessIngredients = ingredients.length - optimalCount;
    
    if (excessIngredients <= 0) return 0;
    
    // Some charts handle extra ingredients better than others
    const basePenalty = OVERCROWDING_TOLERANCE[recipe.chartType] || 0.05;
    return Math.min(excessIngredients * basePenalty, SCORING_CONFIG.OVERCROWDING_PENALTY_MAX); // Cap penalty
  }

  /**
   * Enhanced recipe finding with conditional logic
   */
  static findCompatibleRecipes(ingredients: IngredientAnalysis[]): ChartRecipe[] {
    const startTime = Date.now();
    
    if (ingredients.length === 0) return [];

    const allRecipes = this.recipes
      .map(recipe => ({
        ...recipe,
        confidence: this.scoreRecipe(recipe, ingredients)
      }))
      .filter(recipe => recipe.confidence > RECIPE_CONFIG.minConfidenceThreshold)
      .sort((a, b) => b.confidence - a.confidence);

    // Apply conditional filtering based on data characteristics
    const result = this.applyConditionalFiltering(allRecipes, ingredients);
    
    logPerformance('findCompatibleRecipes', startTime);
    logDebug('Compatible recipes found', { 
      total: allRecipes.length, 
      afterFiltering: result.length,
      top3: result.slice(0, 3).map(r => ({ name: r.name, confidence: r.confidence }))
    });
    
    return result;
  }

  /**
   * Applies conditional filtering to remove inappropriate recipes
   */
  private static applyConditionalFiltering(recipes: ChartRecipe[], ingredients: IngredientAnalysis[]): ChartRecipe[] {
    const dataSize = ingredients.reduce((sum, ing) => sum + ing.uniqueValues, 0);
    const typeCount = ingredients.reduce((acc, ing) => {
      acc[ing.type] = (acc[ing.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return recipes.filter(recipe => {
      // Use dedicated pie chart handler for filtering
      if (recipe.chartType === 'pie') {
        return !PieChartHandler.shouldFilterPieChart(ingredients, dataSize);
      }

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
    }).slice(0, RECIPE_CONFIG.maxRecipeResults); // Limit to configured max results
  }
}
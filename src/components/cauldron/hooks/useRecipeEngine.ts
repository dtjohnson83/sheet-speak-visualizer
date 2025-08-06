import { useState, useCallback, useMemo, useEffect } from 'react';
import { ColumnInfo } from '@/pages/Index';
import { RecipeEngine, ChartRecipe, IngredientAnalysis, IngredientType } from '../utils/recipeEngine';
import { useColumnTypeFeedback } from '@/hooks/useColumnTypeFeedback';
import { LearningEngine } from '@/services/learningEngine';
import { detectColumnTypeWithName } from '@/lib/columnTypeDetection';

interface UseRecipeEngineProps {
  columns: ColumnInfo[];
  datasetName?: string;
}

interface TypeOverride {
  type: IngredientType;
  confidence?: number;
  isOverridden?: boolean;
}

export const useRecipeEngine = ({ columns, datasetName }: UseRecipeEngineProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<ChartRecipe | null>(null);
  const [typeOverrides, setTypeOverrides] = useState<Record<string, TypeOverride>>({});
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
  
  const { submitFeedback } = useColumnTypeFeedback();

  // Load confidence scores when columns change
  useEffect(() => {
    const loadConfidenceScores = async () => {
      const scores: Record<string, number> = {};
      for (const column of columns) {
        try {
          const confidence = await LearningEngine.getClassificationConfidence(column.name, column.type);
          scores[column.name] = confidence;
        } catch (error) {
          console.error('Error loading confidence for column:', column.name, error);
          scores[column.name] = 0.5; // Default confidence
        }
      }
      setConfidenceScores(scores);
    };
    
    if (columns.length > 0) {
      loadConfidenceScores();
    }
  }, [columns]);

  // Analyze all available ingredients with improved type detection
  const availableIngredients = useMemo(() => {
    // Create enhanced columns with improved type detection
    const enhancedColumns = columns.map(column => {
      const override = typeOverrides[column.name];
      if (override) {
        // Use overridden type
        return {
          ...column,
          type: mapIngredientTypeToColumnType(override.type)
        };
      }
      
      // Use enhanced detection that considers learned rules
      const detectedType = detectColumnTypeWithName(column.name, column.values);
      return {
        ...column,
        type: detectedType
      };
    });
    
    return RecipeEngine.analyzeIngredients(enhancedColumns);
  }, [columns, typeOverrides]);

  // Helper function to map ingredient types to column types
  const mapIngredientTypeToColumnType = (ingredientType: IngredientType): 'numeric' | 'date' | 'categorical' | 'text' => {
    switch (ingredientType) {
      case 'numeric': return 'numeric';
      case 'temporal': return 'date';
      case 'categorical': return 'categorical';
      case 'geographic': return 'categorical'; // Geographic data is often categorical for visualization
      case 'textual': return 'text';
      default: return 'text';
    }
  };

  // Helper function to map column types to ingredient types
  const mapColumnTypeToIngredientType = (columnType: 'numeric' | 'date' | 'categorical' | 'text'): IngredientType => {
    switch (columnType) {
      case 'numeric': return 'numeric';
      case 'date': return 'temporal';
      case 'categorical': return 'categorical';
      case 'text': return 'textual';
      default: return 'textual';
    }
  };

  // Get active ingredients based on selection
  const activeIngredients = useMemo(() => {
    return availableIngredients.filter(ingredient => 
      selectedIngredients.includes(ingredient.column)
    );
  }, [availableIngredients, selectedIngredients]);

  // Find compatible recipes for current ingredients
  const compatibleRecipes = useMemo(() => {
    if (activeIngredients.length === 0) return [];
    return RecipeEngine.findCompatibleRecipes(activeIngredients);
  }, [activeIngredients]);

  // Get the best recipe
  const bestRecipe = useMemo(() => {
    if (activeIngredients.length === 0) return null;
    return RecipeEngine.findBestRecipe(activeIngredients);
  }, [activeIngredients]);

  // Validate current ingredient combination
  const validationResult = useMemo(() => {
    return RecipeEngine.validateIngredientCombination(activeIngredients);
  }, [activeIngredients]);

  const addIngredient = useCallback((columnName: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(columnName)) return prev;
      return [...prev, columnName];
    });
  }, []);

  const removeIngredient = useCallback((columnName: string) => {
    setSelectedIngredients(prev => prev.filter(name => name !== columnName));
  }, []);

  const clearIngredients = useCallback(() => {
    setSelectedIngredients([]);
    setSelectedRecipe(null);
  }, []);

  const toggleIngredient = useCallback((columnName: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(columnName)) {
        return prev.filter(name => name !== columnName);
      } else {
        return [...prev, columnName];
      }
    });
  }, []);

  const selectRecipe = useCallback((recipe: ChartRecipe) => {
    setSelectedRecipe(recipe);
  }, []);

  const analyzeIngredientCombination = useCallback(async (ingredients: string[]) => {
    setIsAnalyzing(true);
    
    // Simulate analysis time for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const ingredientAnalysis = availableIngredients.filter(ing => 
      ingredients.includes(ing.column)
    );
    
    const recipes = RecipeEngine.findCompatibleRecipes(ingredientAnalysis);
    const best = RecipeEngine.findBestRecipe(ingredientAnalysis);
    
    setIsAnalyzing(false);
    
    return {
      recipes,
      bestRecipe: best,
      analysis: ingredientAnalysis,
      validation: RecipeEngine.validateIngredientCombination(ingredientAnalysis)
    };
  }, [availableIngredients]);

  const getIngredientByColumn = useCallback((columnName: string): IngredientAnalysis | undefined => {
    return availableIngredients.find(ing => ing.column === columnName);
  }, [availableIngredients]);

  const isIngredientSelected = useCallback((columnName: string): boolean => {
    return selectedIngredients.includes(columnName);
  }, [selectedIngredients]);

  const handleIngredientTypeChange = useCallback(async (columnName: string, newType: IngredientType, confidence: number = 1.0) => {
    // Find the original column to get its current type
    const originalColumn = columns.find(col => col.name === columnName);
    if (!originalColumn) return;

    const originalType = mapColumnTypeToIngredientType(originalColumn.type);
    
    // Update type overrides
    setTypeOverrides(prev => ({
      ...prev,
      [columnName]: {
        type: newType,
        confidence,
        isOverridden: true
      }
    }));

    // Submit feedback to learning engine if the type actually changed
    if (originalType !== newType && datasetName) {
      try {
        await submitFeedback({
          columnName,
          originalType: originalColumn.type,
          correctedType: mapIngredientTypeToColumnType(newType),
          sampleValues: originalColumn.values.slice(0, 10),
          datasetName
        });
      } catch (error) {
        console.error('Error submitting type feedback:', error);
      }
    }
  }, [columns, datasetName, submitFeedback]);

  const clearTypeOverrides = useCallback(() => {
    setTypeOverrides({});
  }, []);

  const canBrewRecipe = useMemo(() => {
    return validationResult.isValid && compatibleRecipes.length > 0;
  }, [validationResult.isValid, compatibleRecipes.length]);

  return {
    // Ingredients
    availableIngredients,
    activeIngredients,
    selectedIngredients,
    
    // Recipes
    compatibleRecipes,
    bestRecipe,
    selectedRecipe,
    
    // Validation
    validationResult,
    canBrewRecipe,
    
    // Actions
    addIngredient,
    removeIngredient,
    clearIngredients,
    toggleIngredient,
    selectRecipe,
    analyzeIngredientCombination,
    getIngredientByColumn,
    isIngredientSelected,
    handleIngredientTypeChange,
    clearTypeOverrides,
    
    // Type Management
    typeOverrides,
    confidenceScores,
    
    // State
    isAnalyzing
  };
};
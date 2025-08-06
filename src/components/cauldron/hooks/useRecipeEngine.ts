import { useState, useCallback, useMemo } from 'react';
import { ColumnInfo } from '@/pages/Index';
import { RecipeEngine, ChartRecipe, IngredientAnalysis } from '../utils/recipeEngine';

interface UseRecipeEngineProps {
  columns: ColumnInfo[];
}

export const useRecipeEngine = ({ columns }: UseRecipeEngineProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<ChartRecipe | null>(null);

  // Analyze all available ingredients
  const availableIngredients = useMemo(() => {
    return RecipeEngine.analyzeIngredients(columns);
  }, [columns]);

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
    
    // State
    isAnalyzing
  };
};
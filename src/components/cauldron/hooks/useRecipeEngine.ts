import { useCallback } from 'react';
import { CauldronSlot, CauldronRecipe, CauldronIngredient } from './useCauldronState';

export const useRecipeEngine = () => {
  
  const generateRecipe = useCallback((filledSlots: CauldronSlot[]): CauldronRecipe | null => {
    if (filledSlots.length === 0) return null;

    const primaryEssence = filledSlots.find(slot => slot.id === 'primary-essence')?.ingredient;
    const secondaryEssence = filledSlots.find(slot => slot.id === 'secondary-essence')?.ingredient;
    const dimensionalPortal = filledSlots.find(slot => slot.id === 'dimensional-portal')?.ingredient;
    const groupingCrystals = filledSlots.find(slot => slot.id === 'grouping-crystals')?.ingredient;
    const temporalAccelerator = filledSlots.find(slot => slot.id === 'temporal-accelerator')?.ingredient;

    if (!primaryEssence || !secondaryEssence) return null;

    // Recipe logic based on ingredient combinations
    let chartType = 'bar';
    let confidence = 0;
    let reasoning = '';

    // Temporal + Numeric = Line Chart
    if (temporalAccelerator && secondaryEssence.type === 'numeric') {
      chartType = 'line';
      confidence = 95;
      reasoning = 'Time-based data with numeric values creates perfect temporal visualizations';
    }
    // 3 Numeric dimensions = 3D Scatter
    else if (primaryEssence.type === 'numeric' && secondaryEssence.type === 'numeric' && dimensionalPortal) {
      chartType = 'scatter3d';
      confidence = 90;
      reasoning = 'Three numeric dimensions reveal multidimensional patterns in 3D space';
    }
    // 2 Numeric = Scatter Plot
    else if (primaryEssence.type === 'numeric' && secondaryEssence.type === 'numeric') {
      chartType = 'scatter';
      confidence = 85;
      reasoning = 'Two numeric essences reveal correlations through scatter visualization';
    }
    // Categorical + Numeric with high cardinality = Pie Chart
    else if (primaryEssence.type === 'categorical' && secondaryEssence.type === 'numeric' && primaryEssence.uniqueValues > 8) {
      chartType = 'pie';
      confidence = 80;
      reasoning = 'Categorical essence with many fragments works best as proportional pie slices';
    }
    // Categorical + Numeric with stacking = Stacked Bar
    else if (primaryEssence.type === 'categorical' && secondaryEssence.type === 'numeric' && groupingCrystals) {
      chartType = 'stacked-bar';
      confidence = 88;
      reasoning = 'Categorical base with grouping crystals creates layered dimensional views';
    }
    // Categorical + Numeric = Bar Chart
    else if (primaryEssence.type === 'categorical' && secondaryEssence.type === 'numeric') {
      chartType = 'bar';
      confidence = 85;
      reasoning = 'Classic combination of categories and values manifests as bar visualization';
    }
    // Date + Numeric = Area Chart (if no specific temporal accelerator)
    else if (primaryEssence.type === 'date' && secondaryEssence.type === 'numeric') {
      chartType = 'area';
      confidence = 82;
      reasoning = 'Date essence with numeric values flows naturally as area visualization';
    }
    else {
      // Default fallback
      confidence = 60;
      reasoning = 'Standard essence combination suggests basic bar visualization';
    }

    // Determine aggregation method based on data types
    let aggregationMethod = 'sum';
    if (secondaryEssence.potency > 80) {
      aggregationMethod = 'average';
    } else if (primaryEssence.type === 'date') {
      aggregationMethod = 'sum';
    }

    return {
      chartType,
      confidence,
      reasoning,
      xColumn: primaryEssence.columnName,
      yColumn: secondaryEssence.columnName,
      zColumn: dimensionalPortal?.columnName,
      stackColumn: groupingCrystals?.columnName,
      aggregationMethod
    };
  }, []);

  const getRecipeDescription = useCallback((recipe: CauldronRecipe): string => {
    const chartTypeNames: Record<string, string> = {
      'bar': 'Mystical Bar Elixir',
      'line': 'Temporal Flow Potion',
      'area': 'Essence Flow Brew',
      'scatter': 'Correlation Crystal Ball',
      'scatter3d': 'Dimensional Reality Sphere',
      'pie': 'Proportional Wisdom Wheel',
      'stacked-bar': 'Layered Power Columns'
    };

    return chartTypeNames[recipe.chartType] || 'Unknown Magical Concoction';
  }, []);

  const getConfidenceLevel = useCallback((confidence: number): { level: string; color: string } => {
    if (confidence >= 90) return { level: 'Legendary', color: 'text-yellow-400' };
    if (confidence >= 80) return { level: 'Epic', color: 'text-purple-400' };
    if (confidence >= 70) return { level: 'Rare', color: 'text-blue-400' };
    if (confidence >= 60) return { level: 'Common', color: 'text-green-400' };
    return { level: 'Unstable', color: 'text-red-400' };
  }, []);

  return {
    generateRecipe,
    getRecipeDescription,
    getConfidenceLevel
  };
};
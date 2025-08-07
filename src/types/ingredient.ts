export type IngredientType = 'numeric' | 'temporal' | 'categorical' | 'geographic' | 'textual';

export interface IngredientAnalysis {
  column: string;
  type: IngredientType;
  potency: number; // 0-1 scale, matching existing interface
  uniqueValues: number;
  magicalName: string;
  properties: string[];
}

export interface TypeOverride {
  type: IngredientType;
  confidence?: number;
  isOverridden?: boolean;
}

export interface CauldronIngredientPaletteProps {
  ingredients: IngredientAnalysis[];
  selectedIngredients: string[];
  onIngredientSelect: (columnName: string) => void;
  onIngredientTypeChange?: (columnName: string, newType: IngredientType, confidence?: number) => void;
  typeOverrides?: Record<string, TypeOverride>;
  confidenceScores?: Record<string, number>;
}
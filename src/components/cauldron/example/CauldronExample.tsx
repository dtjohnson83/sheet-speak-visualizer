import React, { useState, useCallback } from 'react';
import { CauldronIngredientPalette } from '../CauldronIngredientPalette';
import { useIngredientAnalysis } from '@/hooks/useIngredientAnalysis';
import { IngredientType, TypeOverride } from '@/types/ingredient';
import { ColumnInfo, DataRow } from '@/pages/Index';

interface CauldronExampleProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const CauldronExample: React.FC<CauldronExampleProps> = ({
  data,
  columns
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [typeOverrides, setTypeOverrides] = useState<Record<string, TypeOverride>>({});
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});

  // Use the ingredient analysis hook
  const { ingredients } = useIngredientAnalysis(columns, data);

  // Handle ingredient selection
  const handleIngredientSelect = useCallback((columnName: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(columnName)) {
        return prev.filter(name => name !== columnName);
      } else {
        return [...prev, columnName];
      }
    });
  }, []);

  // Handle ingredient type change with proper state management
  const handleIngredientTypeChange = useCallback((
    columnName: string,
    newType: IngredientType,
    confidence?: number
  ) => {
    console.log('Type change requested:', { columnName, newType, confidence });
    
    setTypeOverrides(prev => ({
      ...prev,
      [columnName]: {
        type: newType,
        confidence: confidence || 1.0,
        isOverridden: true
      }
    }));

    // Update confidence scores if provided
    if (confidence) {
      setConfidenceScores(prev => ({
        ...prev,
        [columnName]: confidence
      }));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Cauldron Ingredient Palette Example</h2>
        <p className="text-muted-foreground">
          This example shows how to use the CauldronIngredientPalette component with proper memoization and state management.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Selected Ingredients:</h3>
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.length > 0 ? (
            selectedIngredients.map(ingredient => (
              <span key={ingredient} className="px-2 py-1 bg-primary/10 rounded text-sm">
                {ingredient}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No ingredients selected</span>
          )}
        </div>
      </div>

      <CauldronIngredientPalette
        ingredients={ingredients}
        selectedIngredients={selectedIngredients}
        onIngredientSelect={handleIngredientSelect}
        onIngredientTypeChange={handleIngredientTypeChange}
        typeOverrides={typeOverrides}
        confidenceScores={confidenceScores}
      />

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-muted/50 rounded">
        <h4 className="font-medium mb-2">Debug Information:</h4>
        <div className="text-sm space-y-1">
          <p>Total Ingredients: {ingredients.length}</p>
          <p>Selected: {selectedIngredients.length}</p>
          <p>Type Overrides: {Object.keys(typeOverrides).length}</p>
          <p>Confidence Scores: {Object.keys(confidenceScores).length}</p>
        </div>
      </div>
    </div>
  );
};
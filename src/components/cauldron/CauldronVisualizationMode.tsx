import React, { useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { CauldronIngredientPalette } from './CauldronIngredientPalette';
import { MagicCauldron } from './MagicCauldron';
import { BrewingAnimation } from './BrewingAnimation';
import { RecipeSuggestions } from './RecipeSuggestions';
import { useCauldronState } from './hooks/useCauldronState';
import { useRecipeEngine } from './hooks/useRecipeEngine';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { ChartVisualization } from '@/components/ChartVisualization';

interface CauldronVisualizationModeProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSaveTile?: (tileData: any) => void;
}

export const CauldronVisualizationMode: React.FC<CauldronVisualizationModeProps> = ({
  data,
  columns,
  onSaveTile
}) => {
  const [isBrewingActive, setIsBrewingActive] = useState(false);
  const [brewingRecipe, setBrewingRecipe] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const { 
    availableIngredients,
    activeIngredients, 
    compatibleRecipes, 
    bestRecipe,
    selectedRecipe,
    validationResult,
    canBrewRecipe,
    toggleIngredient,
    selectRecipe,
    clearIngredients,
    selectedIngredients
  } = useRecipeEngine({ columns });
  
  const { handleDragStart } = useDragAndDrop();

  const handleIngredientDrop = (columnName: string) => {
    toggleIngredient(columnName);
  };

  const handleBrewPotion = async () => {
    if (!canBrewRecipe || !bestRecipe) return;

    setBrewingRecipe({
      name: bestRecipe.name,
      confidence: bestRecipe.confidence,
      chartType: bestRecipe.chartType,
      ingredients: activeIngredients.map(ing => ing.magicalName)
    });
    setIsBrewingActive(true);
  };

  const handleBrewingComplete = () => {
    setIsBrewingActive(false);
    setShowResult(true);
  };

  const handleStartOver = () => {
    clearIngredients();
    setShowResult(false);
    setBrewingRecipe(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Column - Ingredient Palette */}
      <div className="lg:col-span-1">
        <CauldronIngredientPalette
          ingredients={availableIngredients}
          selectedIngredients={selectedIngredients}
          onIngredientSelect={toggleIngredient}
          onDragStart={() => {}}
        />
      </div>

      {/* Middle Column - Cauldron and Brewing */}
      <div className="lg:col-span-1 space-y-4">
        {isBrewingActive ? (
          <BrewingAnimation
            isActive={isBrewingActive}
            recipe={brewingRecipe}
            onComplete={handleBrewingComplete}
          />
        ) : (
          <div className="space-y-4">
            <RecipeSuggestions
              ingredients={activeIngredients}
              recipes={compatibleRecipes}
              onSelectRecipe={selectRecipe}
              selectedRecipe={selectedRecipe}
            />
          </div>
        )}
      </div>

      {/* Right Column - Recipe Suggestions and Results */}
      <div className="lg:col-span-1">
        {showResult && selectedRecipe ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                🎉 Brewing Complete!
              </h3>
              <p className="text-muted-foreground">
                Your {selectedRecipe.name} is ready
              </p>
            </div>
            <ChartVisualization
              data={data}
              columns={columns}
              onSaveTile={onSaveTile}
              dataSourceName="Cauldron Creation"
            />
          </div>
        ) : (
          <RecipeSuggestions
            ingredients={activeIngredients}
            recipes={compatibleRecipes}
            onSelectRecipe={selectRecipe}
            selectedRecipe={selectedRecipe}
          />
        )}
      </div>
    </div>
  );
};
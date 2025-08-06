import React, { useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { CauldronIngredientPalette } from './CauldronIngredientPalette';
import { MagicCauldron } from './MagicCauldron';
import { BrewingAnimation } from './BrewingAnimation';
import { RecipeSuggestions } from './RecipeSuggestions';
import { useCauldronState } from './hooks/useCauldronState';
import { useRecipeEngine } from './hooks/useRecipeEngine';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { AIConfiguredChart } from '@/components/unified-ai/AIConfiguredChart';
import { AIChartSuggestion } from '@/hooks/useAIChartGeneration';

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
    selectedIngredients,
    handleIngredientTypeChange,
    typeOverrides,
    confidenceScores
  } = useRecipeEngine({ columns, datasetName: 'cauldron-dataset' });
  
  const { handleDragStart } = useDragAndDrop();

  const handleIngredientDrop = (columnName: string) => {
    toggleIngredient(columnName);
  };

  const handleBrewPotion = async (recipe?: any) => {
    const recipeToUse = recipe || bestRecipe;
    if (!recipeToUse) return;

    setBrewingRecipe({
      name: recipeToUse.name,
      confidence: recipeToUse.confidence,
      chartType: recipeToUse.chartType,
      ingredients: activeIngredients.map(ing => ing.magicalName)
    });
    
    // Set the selected recipe if one was passed
    if (recipe) {
      selectRecipe(recipe);
    }
    
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

  // Convert recipe to chart suggestion for proper chart rendering
  const createChartSuggestionFromRecipe = (recipe: any, ingredients: any[]): AIChartSuggestion => {
    const temporalIngredient = ingredients.find(ing => ing.type === 'temporal');
    const numericIngredients = ingredients.filter(ing => ing.type === 'numeric');
    const categoricalIngredients = ingredients.filter(ing => ing.type === 'categorical');
    const geographicIngredient = ingredients.find(ing => ing.type === 'geographic');

    let xColumn = '';
    let yColumn = '';
    let valueColumn = '';
    
    // Smart column assignment based on chart type and available ingredients
    switch (recipe.chartType) {
      case 'line':
      case 'area':
        xColumn = temporalIngredient?.column || categoricalIngredients[0]?.column || '';
        yColumn = numericIngredients[0]?.column || '';
        break;
      case 'bar':
      case 'pie':
        xColumn = categoricalIngredients[0]?.column || temporalIngredient?.column || '';
        yColumn = numericIngredients[0]?.column || '';
        break;
      case 'scatter':
        xColumn = numericIngredients[0]?.column || '';
        yColumn = numericIngredients[1]?.column || numericIngredients[0]?.column || '';
        break;
      case 'heatmap':
        // Heatmap requires two categorical/geographic dimensions and a numeric value
        xColumn = categoricalIngredients[0]?.column || geographicIngredient?.column || '';
        yColumn = categoricalIngredients[1]?.column || categoricalIngredients[0]?.column || '';
        valueColumn = numericIngredients[0]?.column || '';
        break;
      case 'treemap':
        xColumn = categoricalIngredients[0]?.column || '';
        yColumn = categoricalIngredients[1]?.column || '';
        valueColumn = numericIngredients[0]?.column || '';
        break;
      case 'map':
      case 'map3d':
        xColumn = geographicIngredient?.column || '';
        yColumn = geographicIngredient?.column || '';
        valueColumn = numericIngredients[0]?.column || '';
        break;
      case 'histogram':
        xColumn = numericIngredients[0]?.column || '';
        yColumn = '';
        break;
      case 'network':
      case 'network3d':
        xColumn = categoricalIngredients[0]?.column || '';
        yColumn = categoricalIngredients[1]?.column || '';
        valueColumn = numericIngredients[0]?.column || '';
        break;
      default:
        xColumn = ingredients[0]?.column || '';
        yColumn = ingredients[1]?.column || '';
    }

    return {
      chartType: recipe.chartType,
      title: `${recipe.name}: ${xColumn}${yColumn ? ` vs ${yColumn}` : ''}${valueColumn ? ` (${valueColumn})` : ''}`,
      xColumn,
      yColumn,
      valueColumn,
      stackColumn: '',
      aggregationMethod: 'sum',
      series: [],
      reasoning: recipe.reasoning,
      confidence: recipe.confidence || 0.8
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Column - Ingredient Palette */}
      <div className="lg:col-span-1">
        <CauldronIngredientPalette
          ingredients={availableIngredients}
          selectedIngredients={selectedIngredients}
          onIngredientSelect={toggleIngredient}
          onIngredientTypeChange={handleIngredientTypeChange}
          typeOverrides={typeOverrides}
          confidenceScores={confidenceScores}
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
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">🔮 Magic Cauldron</h3>
            <p className="text-muted-foreground mb-4">
              Select ingredients from the palette to create visualizations
            </p>
            {canBrewRecipe && bestRecipe && (
              <button
                onClick={() => handleBrewPotion()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                🧪 Brew {bestRecipe.name}
              </button>
            )}
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
            <AIConfiguredChart
              data={data}
              columns={columns}
              chartSuggestion={createChartSuggestionFromRecipe(selectedRecipe, activeIngredients)}
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
            onBrewRecipe={handleBrewPotion}
          />
        )}
      </div>
    </div>
  );
};
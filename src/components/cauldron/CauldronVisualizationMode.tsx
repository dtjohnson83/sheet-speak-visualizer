import React, { useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CauldronIngredientPalette } from './CauldronIngredientPalette';
import { MagicCauldron } from './MagicCauldron';
import { BrewingAnimation } from './BrewingAnimation';
import { RecipeSuggestions } from './RecipeSuggestions';
import { useCauldronState } from './hooks/useCauldronState';
import { useRecipeEngine } from './hooks/useRecipeEngine';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { AIConfiguredChart } from '@/components/unified-ai/AIConfiguredChart';
import { CauldronChartWrapper } from './CauldronChartWrapper';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 relative overflow-hidden">
      {/* Magical background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden">
        {/* Left Column - Ingredient Palette */}
        <div className="lg:col-span-1 h-full">
          <CauldronIngredientPalette
            ingredients={availableIngredients}
            selectedIngredients={selectedIngredients}
            onIngredientSelect={toggleIngredient}
            onIngredientTypeChange={handleIngredientTypeChange}
            typeOverrides={typeOverrides}
            confidenceScores={confidenceScores}
          />
        </div>

        {/* Middle Column - Enhanced Cauldron */}
        <div className="lg:col-span-1 flex flex-col justify-center">
          {isBrewingActive ? (
            <BrewingAnimation
              isActive={isBrewingActive}
              recipe={brewingRecipe}
              onComplete={handleBrewingComplete}
            />
          ) : (
            <div className="text-center relative">
              {/* Cauldron container with enhanced styling */}
              <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl">
                {/* Magical glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="text-6xl mb-4 animate-pulse">🔮</div>
                    <h3 className="text-2xl font-bold text-foreground mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      Magic Cauldron
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedIngredients.length === 0 
                        ? "Select ingredients from the palette to begin your magical visualization journey"
                        : `${selectedIngredients.length} ingredient${selectedIngredients.length > 1 ? 's' : ''} ready for brewing`
                      }
                    </p>
                  </div>
                  
                  {/* Ingredient preview */}
                  {selectedIngredients.length > 0 && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="text-sm font-medium text-primary mb-2">Selected Ingredients:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedIngredients.map(ingredient => (
                          <Badge key={ingredient} variant="secondary" className="animate-fade-in">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {canBrewRecipe && bestRecipe && (
                    <button
                      onClick={() => handleBrewPotion()}
                      className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 animate-scale-in"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        🧪 Brew {bestRecipe.name}
                        <span className="text-xs opacity-80">({Math.round(bestRecipe.confidence * 100)}% match)</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  )}
                  
                  {!canBrewRecipe && selectedIngredients.length > 0 && (
                    <div className="text-sm text-muted-foreground animate-fade-in">
                      {validationResult.issues.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-4">
                          <p className="font-medium text-yellow-600 mb-1">⚠️ Brewing Issues:</p>
                          <ul className="text-xs space-y-1">
                            {validationResult.issues.map((issue, i) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Enhanced Results */}
        <div className="lg:col-span-1">
          {showResult && selectedRecipe ? (
            <div className="space-y-6 h-full flex flex-col animate-fade-in">
              {/* Results header */}
              <div className="text-center flex-shrink-0">
                <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-xl blur-xl"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-3 animate-bounce">🎉</div>
                    <h3 className="text-xl font-bold text-foreground mb-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Brewing Complete!
                    </h3>
                    <p className="text-muted-foreground">
                      Your <span className="font-semibold text-primary">{selectedRecipe.name}</span> is ready
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartOver}
                      className="mt-3 hover-scale"
                    >
                      ✨ Start Over
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Chart display */}
              <div className="flex-1 min-h-0">
                <div className="h-full bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-4">
                  <CauldronChartWrapper>
                    <AIConfiguredChart
                      data={data}
                      columns={columns}
                      chartSuggestion={createChartSuggestionFromRecipe(selectedRecipe, activeIngredients)}
                      onSaveTile={onSaveTile}
                      dataSourceName="Cauldron Creation"
                      hideSeriesManager={true}
                      hideConfiguration={true}
                    />
                  </CauldronChartWrapper>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <RecipeSuggestions
                ingredients={activeIngredients}
                recipes={compatibleRecipes}
                onSelectRecipe={selectRecipe}
                selectedRecipe={selectedRecipe}
                onBrewRecipe={handleBrewPotion}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChartRecipe, IngredientAnalysis } from './utils/recipeEngine';
import { Sparkles, Zap, TrendingUp, PieChart, BarChart3, ScatterChart, Map, AreaChart } from 'lucide-react';

interface RecipeSuggestionsProps {
  ingredients: IngredientAnalysis[];
  recipes: ChartRecipe[];
  onSelectRecipe: (recipe: ChartRecipe) => void;
  selectedRecipe?: ChartRecipe;
}

const getChartIcon = (chartType: string) => {
  switch (chartType) {
    case 'line': return <TrendingUp className="h-4 w-4" />;
    case 'bar': return <BarChart3 className="h-4 w-4" />;
    case 'pie': return <PieChart className="h-4 w-4" />;
    case 'scatter': return <ScatterChart className="h-4 w-4" />;
    case 'map': return <Map className="h-4 w-4" />;
    case 'area': return <AreaChart className="h-4 w-4" />;
    default: return <Sparkles className="h-4 w-4" />;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'hsl(var(--primary))';
  if (confidence >= 0.6) return 'hsl(var(--secondary))';
  return 'hsl(var(--muted-foreground))';
};

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 0.9) return 'Perfect Match';
  if (confidence >= 0.8) return 'Excellent';
  if (confidence >= 0.7) return 'Very Good';
  if (confidence >= 0.6) return 'Good';
  if (confidence >= 0.5) return 'Fair';
  return 'Experimental';
};

export const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({
  ingredients,
  recipes,
  onSelectRecipe,
  selectedRecipe
}) => {
  if (ingredients.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2 text-foreground">No Ingredients Yet</h3>
        <p className="text-muted-foreground">
          Add some data ingredients to the cauldron to see magical recipe suggestions
        </p>
      </Card>
    );
  }

  if (recipes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2 text-foreground">No Compatible Recipes</h3>
        <p className="text-muted-foreground">
          The current ingredient combination doesn't match any known recipes. Try different ingredients!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Recipe Suggestions</h3>
        <Badge variant="outline">{recipes.length} recipes found</Badge>
      </div>

      <div className="grid gap-3">
        {recipes.map((recipe, index) => {
          const isSelected = selectedRecipe?.id === recipe.id;
          const confidenceColor = getConfidenceColor(recipe.confidence);
          const confidenceLabel = getConfidenceLabel(recipe.confidence);

          return (
            <Card 
              key={recipe.id}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                  : 'hover:bg-muted/50 hover:border-primary/30'
              }`}
              onClick={() => onSelectRecipe(recipe)}
            >
              <div className="space-y-3">
                {/* Recipe header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getChartIcon(recipe.chartType)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{recipe.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Creates {recipe.chartType} visualization
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      style={{ borderColor: confidenceColor, color: confidenceColor }}
                    >
                      {Math.round(recipe.confidence * 100)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {confidenceLabel}
                    </p>
                  </div>
                </div>

                {/* Recipe reasoning */}
                <p className="text-sm text-muted-foreground italic">
                  "{recipe.reasoning}"
                </p>

                {/* Magical effects */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Magical Effects:</p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.magicalEffects.map((effect, effectIndex) => (
                      <Badge key={effectIndex} variant="secondary" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Required ingredients indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Required:</span>
                  {recipe.requiredIngredients.primary.map((type, typeIndex) => (
                    <Badge key={typeIndex} variant="outline" className="text-xs capitalize">
                      {type}
                    </Badge>
                  ))}
                  {recipe.requiredIngredients.secondary && (
                    <>
                      <span>+</span>
                      {recipe.requiredIngredients.secondary.map((type, typeIndex) => (
                        <Badge key={typeIndex} variant="outline" className="text-xs capitalize">
                          {type}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>

                {/* Action button for selected recipe */}
                {isSelected && (
                  <>
                    <Separator />
                    <Button className="w-full" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Brew This Recipe
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Best recipe indicator */}
      {recipes.length > 0 && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Recommended: {recipes[0].name}
            </span>
            <Badge variant="outline" className="text-xs">
              Best Match
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
};
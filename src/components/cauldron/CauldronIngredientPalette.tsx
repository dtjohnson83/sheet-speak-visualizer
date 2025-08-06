import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IngredientAnalysis } from './utils/recipeEngine';

interface CauldronIngredientPaletteProps {
  ingredients: IngredientAnalysis[];
  selectedIngredients: string[];
  onIngredientSelect: (columnName: string) => void;
}

export const CauldronIngredientPalette: React.FC<CauldronIngredientPaletteProps> = ({
  ingredients,
  selectedIngredients,
  onIngredientSelect
}) => {
  const getIngredientIcon = (type: string): string => {
    switch (type) {
      case 'numeric': return '🔢';
      case 'date': return '📅';
      case 'categorical': return '📝';
      default: return '🏷️';
    }
  };

  const getIngredientColor = (type: string): string => {
    switch (type) {
      case 'numeric': return 'bg-blue-500/20 border-blue-400/50';
      case 'date': return 'bg-purple-500/20 border-purple-400/50';
      case 'categorical': return 'bg-green-500/20 border-green-400/50';
      default: return 'bg-gray-500/20 border-gray-400/50';
    }
  };

  const getPotencyColor = (potency: number): string => {
    if (potency >= 80) return 'text-yellow-400';
    if (potency >= 60) return 'text-orange-400';
    if (potency >= 40) return 'text-blue-400';
    return 'text-gray-400';
  };

  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.type]) acc[ingredient.type] = [];
    acc[ingredient.type].push(ingredient);
    return acc;
  }, {} as Record<string, IngredientAnalysis[]>);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary mb-2">🧪 Magical Ingredients</h3>
        <p className="text-sm text-muted-foreground">
          Drag powerful essences into the cauldron to brew your visualization
        </p>
      </div>

      {Object.entries(groupedIngredients).map(([type, typeIngredients]) => (
        <div key={type} className="space-y-3">
          <h4 className="text-sm font-medium text-primary capitalize flex items-center gap-2">
            {getIngredientIcon(type)} {type} Essences
          </h4>
          
          <div className="grid grid-cols-1 gap-2">
            {typeIngredients.map((ingredient) => (
              <Card
                key={ingredient.column}
                className={`
                  p-3 cursor-pointer transition-all duration-200 
                  hover:scale-105 hover:shadow-lg hover:border-primary/50
                  ${getIngredientColor(ingredient.type)}
                  ${selectedIngredients.includes(ingredient.column) ? 'ring-2 ring-primary bg-primary/10' : ''}
                  animate-fade-in group
                `}
                onClick={() => onIngredientSelect(ingredient.column)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getIngredientIcon(ingredient.type)}</span>
                      <span className="font-medium text-sm text-foreground truncate">
                        {ingredient.magicalName}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {ingredient.column}
                    </div>
                    {ingredient.properties && ingredient.properties.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {ingredient.properties.slice(0, 3).join(', ')}
                        {ingredient.properties.length > 3 && '...'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      {ingredient.uniqueValues} values
                    </Badge>
                    <div className={`text-xs font-medium ${getPotencyColor(ingredient.potency * 100)}`}>
                      ✨ {Math.round(ingredient.potency * 100)}%
                    </div>
                  </div>
                </div>
                
                {/* Magical sparkle effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute top-1 right-1 text-yellow-400 animate-pulse">✨</div>
                  <div className="absolute bottom-1 left-1 text-blue-400 animate-pulse delay-150">✨</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
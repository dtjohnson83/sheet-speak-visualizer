import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Edit, Sparkles } from 'lucide-react';
import { IngredientAnalysis, IngredientType, CauldronIngredientPaletteProps } from '@/types/ingredient';

export const CauldronIngredientPalette: React.FC<CauldronIngredientPaletteProps> = ({
  ingredients,
  selectedIngredients,
  onIngredientSelect,
  onIngredientTypeChange,
  typeOverrides = {},
  confidenceScores = {}
}) => {
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [tempType, setTempType] = useState<IngredientType>('numeric');
  const [isEditMode, setIsEditMode] = useState(false);

  // Move these functions BEFORE they're used
  const generateMagicalName = useCallback((columnName: string, type: IngredientType): string => {
    const prefixes = {
      'numeric': ['Essence of', 'Numeric Spirit of', 'Quantified'],
      'temporal': ['Chronos\'s', 'Time-bound', 'Temporal'],
      'categorical': ['Sorted', 'Classified', 'Grouped'],
      'geographic': ['Worldly', 'Terrestrial', 'Geographic'],
      'textual': ['Scripted', 'Literary', 'Textual']
    };
    
    const typePrefix = prefixes[type] || ['Essence of'];
    // Use stable index based on column name, not Math.random()
    const index = columnName.charCodeAt(0) % typePrefix.length;
    return `${typePrefix[index]} ${columnName.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}`;
  }, []);

  const getIngredientProperties = useCallback((columnName: string, type: IngredientType): string[] => {
    const properties = {
      'numeric': ['Measurable', 'Quantifiable', 'Calculable'],
      'temporal': ['Time-sensitive', 'Sequential', 'Chronological'],
      'categorical': ['Distinct', 'Classifiable', 'Groupable'],
      'geographic': ['Spatial', 'Locational', 'Mappable'],
      'textual': ['Descriptive', 'Narrative', 'Semantic']
    };
    return properties[type] || ['Mysterious'];
  }, []);

  // Now define getEffectiveIngredient using the functions above
  const getEffectiveIngredient = useCallback((ingredient: IngredientAnalysis): IngredientAnalysis => {
    const override = typeOverrides[ingredient.column];
    if (override) {
      return {
        ...ingredient,
        type: override.type,
        magicalName: generateMagicalName(ingredient.column, override.type),
        properties: getIngredientProperties(ingredient.column, override.type)
      };
    }
    return ingredient;
  }, [typeOverrides, generateMagicalName, getIngredientProperties]);

  // Group ingredients with proper memoization
  const groupedIngredients = useMemo(() => {
    if (!ingredients || ingredients.length === 0) {
      return {};
    }

    return ingredients.reduce((acc, ingredient) => {
      try {
        const effectiveIngredient = getEffectiveIngredient(ingredient);
        const type = effectiveIngredient.type;
        
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(effectiveIngredient);
      } catch (error) {
        console.error('Error processing ingredient:', ingredient, error);
      }
      return acc;
    }, {} as Record<string, IngredientAnalysis[]>);
  }, [ingredients, getEffectiveIngredient]);

  // Event handlers with proper error handling
  const handleEditStart = useCallback((e: React.MouseEvent, columnName: string, currentType: IngredientType) => {
    e.stopPropagation();
    setEditingIngredient(columnName);
    setTempType(currentType);
  }, []);

  const handleEditConfirm = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (!editingIngredient) {
      console.error('No ingredient being edited');
      return;
    }
    
    if (!onIngredientTypeChange) {
      console.error('onIngredientTypeChange prop is not provided');
      return;
    }
    
    try {
      console.log('Saving type change:', editingIngredient, tempType);
      onIngredientTypeChange(editingIngredient, tempType, 1.0);
      setEditingIngredient(null);
    } catch (error) {
      console.error('Error saving type change:', error);
    }
  }, [editingIngredient, tempType, onIngredientTypeChange]);

  const handleEditCancel = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingIngredient(null);
  }, []);

  // Icon and color getters
  const getIngredientIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'numeric': '🔢',
      'temporal': '📅',
      'categorical': '📝',
      'geographic': '🌍',
      'textual': '📄'
    };
    return icons[type] || '🏷️';
  };

  const getIngredientColor = (type: string): string => {
    const colors: Record<string, string> = {
      'numeric': 'bg-blue-500/20 border-blue-400/50',
      'temporal': 'bg-purple-500/20 border-purple-400/50',
      'categorical': 'bg-green-500/20 border-green-400/50',
      'geographic': 'bg-orange-500/20 border-orange-400/50',
      'textual': 'bg-pink-500/20 border-pink-400/50'
    };
    return colors[type] || 'bg-gray-500/20 border-gray-400/50';
  };

  const getPotencyColor = (potency: number): string => {
    if (potency >= 80) return 'text-yellow-400';
    if (potency >= 60) return 'text-orange-400';
    if (potency >= 40) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIngredientTypeOptions = (): IngredientType[] => {
    return ['numeric', 'temporal', 'categorical', 'geographic', 'textual'];
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Ingredient Palette
            </h3>
            <p className="text-sm text-muted-foreground">
              Magical ingredients detected from your data columns
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {isEditMode ? 'Done Editing' : 'Edit Types'}
          </Button>
        </div>

        {Object.entries(groupedIngredients).map(([type, typeIngredients]) => (
          <Card key={type} className={`border-2 ${getIngredientColor(type)}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getIngredientIcon(type)}</span>
                <h4 className="font-medium capitalize">{type} Ingredients</h4>
                <Badge variant="secondary" className="text-xs">
                  {typeIngredients.length}
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {typeIngredients.map((ingredient) => {
                  const isSelected = selectedIngredients.includes(ingredient.column);
                  const isEditing = editingIngredient === ingredient.column;
                  const confidence = confidenceScores[ingredient.column];
                  const override = typeOverrides[ingredient.column];
                  
                  return (
                    <div
                      key={ingredient.column}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-primary/10 border-primary ring-2 ring-primary/20' 
                          : 'bg-background/50 border-border hover:bg-background/80'
                      }`}
                      onClick={() => !isEditing && onIngredientSelect(ingredient.column)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h5 className="font-medium text-sm truncate">
                                  {ingredient.magicalName}
                                </h5>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Column: {ingredient.column}</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            {override?.isOverridden && (
                              <Badge variant="outline" className="text-xs">
                                Modified
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {ingredient.properties.map((property) => (
                              <Badge 
                                key={property} 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {property}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs">
                            <span className={`flex items-center gap-1 ${getPotencyColor(Math.round(ingredient.potency * 100))}`}>
                              ⚡ {Math.round(ingredient.potency * 100)}% potency
                            </span>
                            <span className="text-muted-foreground">
                              Unique: {ingredient.uniqueValues}
                            </span>
                            {confidence && (
                              <span className={getConfidenceColor(confidence)}>
                                Confidence: {Math.round(confidence * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {isEditMode && !isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleEditStart(e, ingredient.column, ingredient.type)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {isEditing && (
                            <div className="flex items-center gap-1">
                              <Select value={tempType} onValueChange={(value) => setTempType(value as IngredientType)}>
                                <SelectTrigger className="h-6 w-24 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getIngredientTypeOptions().map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {getIngredientIcon(option)} {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEditConfirm}
                                className="h-6 w-6 p-0 text-green-600"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEditCancel}
                                className="h-6 w-6 p-0 text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {Object.keys(groupedIngredients).length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">No Ingredients Detected</h4>
              <p className="text-sm text-muted-foreground">
                Upload data to discover magical ingredients for your cauldron
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit3, Save, X, AlertTriangle, Brain } from 'lucide-react';
import { IngredientAnalysis, IngredientType } from './utils/recipeEngine';

interface CauldronIngredientPaletteProps {
  ingredients: IngredientAnalysis[];
  selectedIngredients: string[];
  onIngredientSelect: (columnName: string) => void;
  onIngredientTypeChange?: (columnName: string, newType: IngredientType, confidence?: number) => void;
  typeOverrides?: Record<string, { type: IngredientType; confidence?: number; isOverridden?: boolean }>;
  confidenceScores?: Record<string, number>;
}

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
  const getIngredientIcon = (type: string): string => {
    switch (type) {
      case 'numeric': return '🔢';
      case 'temporal': return '📅';
      case 'categorical': return '📝';
      case 'geographic': return '🌍';
      case 'textual': return '📄';
      default: return '🏷️';
    }
  };

  const getIngredientTypeOptions = (): IngredientType[] => {
    return ['numeric', 'temporal', 'categorical', 'geographic', 'textual'];
  };

  const getEffectiveIngredient = (ingredient: IngredientAnalysis): IngredientAnalysis => {
    const override = typeOverrides[ingredient.column];
    if (override) {
      return {
        ...ingredient,
        type: override.type,
        // Regenerate magical name and properties based on new type
        magicalName: generateMagicalName(ingredient.column, override.type),
        properties: getIngredientProperties(ingredient.column, override.type)
      };
    }
    return ingredient;
  };

  const generateMagicalName = (columnName: string, type: IngredientType): string => {
    const prefixes = {
      'numeric': ['Essence of', 'Numeric Spirit of', 'Quantified'],
      'temporal': ['Chronos\'s', 'Time-bound', 'Temporal'],
      'categorical': ['Sorted', 'Classified', 'Grouped'],
      'geographic': ['Worldly', 'Terrestrial', 'Geographic'],
      'textual': ['Scripted', 'Literary', 'Textual']
    };
    const typePrefix = prefixes[type]?.[Math.floor(Math.random() * prefixes[type].length)] || 'Essence of';
    return `${typePrefix} ${columnName.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}`;
  };

  const getIngredientProperties = (columnName: string, type: IngredientType): string[] => {
    const properties = {
      'numeric': ['Measurable', 'Quantifiable', 'Calculable'],
      'temporal': ['Time-sensitive', 'Sequential', 'Chronological'],
      'categorical': ['Distinct', 'Classifiable', 'Groupable'],
      'geographic': ['Spatial', 'Locational', 'Mappable'],
      'textual': ['Descriptive', 'Narrative', 'Semantic']
    };
    return properties[type] || ['Mysterious'];
  };

  const getIngredientColor = (type: string): string => {
    switch (type) {
      case 'numeric': return 'bg-blue-500/20 border-blue-400/50';
      case 'temporal': return 'bg-purple-500/20 border-purple-400/50';
      case 'categorical': return 'bg-green-500/20 border-green-400/50';
      case 'geographic': return 'bg-orange-500/20 border-orange-400/50';
      case 'textual': return 'bg-pink-500/20 border-pink-400/50';
      default: return 'bg-gray-500/20 border-gray-400/50';
    }
  };

  const getPotencyColor = (potency: number): string => {
    if (potency >= 80) return 'text-yellow-400';
    if (potency >= 60) return 'text-orange-400';
    if (potency >= 40) return 'text-blue-400';
    return 'text-gray-400';
  };

  const handleEditStart = (columnName: string, currentType: IngredientType) => {
    setEditingIngredient(columnName);
    setTempType(currentType);
  };

  const handleEditConfirm = () => {
    if (editingIngredient && onIngredientTypeChange) {
      onIngredientTypeChange(editingIngredient, tempType, 1.0); // High confidence for manual override
    }
    setEditingIngredient(null);
  };

  const handleEditCancel = () => {
    setEditingIngredient(null);
  };

  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'text-muted-foreground';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Group ingredients by their effective type (after overrides)
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const effectiveIngredient = getEffectiveIngredient(ingredient);
    const type = effectiveIngredient.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(effectiveIngredient);
    return acc;
  }, {} as Record<string, IngredientAnalysis[]>);

  return (
    <TooltipProvider>
      <div className="space-y-6 h-full">
        {/* Header with magical styling */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 rounded-lg blur-xl"></div>
          <div className="relative bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-4">
            <h3 className="text-xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
              <span className="text-2xl animate-pulse">🧪</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Magical Ingredients
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag powerful essences into the cauldron to brew your visualization
            </p>
            
            {onIngredientTypeChange && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="gap-2 hover-scale transition-all duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditMode ? "Done Editing" : "Edit Types"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Ingredient groups with enhanced styling */}
        <div className="space-y-4 overflow-y-auto flex-1">
          {Object.entries(groupedIngredients).map(([type, typeIngredients]) => (
            <div key={type} className="space-y-3 animate-fade-in">
              {/* Type header with glow effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded"></div>
                <h4 className="relative text-sm font-semibold text-primary capitalize flex items-center gap-2 p-2 rounded border border-border/30 bg-card/50 backdrop-blur-sm">
                  <span className="text-lg animate-pulse">{getIngredientIcon(type)}</span>
                  <span className="tracking-wide">{type} Essences</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {typeIngredients.length}
                  </Badge>
                </h4>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
            {typeIngredients.map((ingredient) => {
              const originalIngredient = ingredients.find(ing => ing.column === ingredient.column)!;
              const override = typeOverrides[ingredient.column];
              const isOverridden = override?.isOverridden;
              const confidence = override?.confidence ?? confidenceScores[ingredient.column];
              const isEditing = editingIngredient === ingredient.column;
              
              return (
                <Card
                  key={ingredient.column}
                  className={`
                    group relative p-4 ${isEditing ? '' : 'cursor-pointer'} 
                    transition-all duration-300 ease-out
                    ${!isEditing ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 hover:-translate-y-1' : ''}
                    ${getIngredientColor(ingredient.type)}
                    ${selectedIngredients.includes(ingredient.column) ? 
                      'ring-2 ring-primary bg-primary/10 shadow-lg shadow-primary/20 border-primary/60' : 
                      'hover:bg-gradient-to-br hover:from-transparent hover:to-primary/5'
                    }
                    ${isOverridden ? 'border-2 border-yellow-400 shadow-yellow-400/20 shadow-lg' : ''}
                    animate-fade-in backdrop-blur-sm
                  `}
                  onClick={() => !isEditing && onIngredientSelect(ingredient.column)}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getIngredientIcon(tempType)}</span>
                        <span className="font-medium text-sm text-foreground">
                          Edit: {ingredient.column}
                        </span>
                      </div>
                      
                      <Select value={tempType} onValueChange={(value: IngredientType) => setTempType(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getIngredientTypeOptions().map((option) => (
                            <SelectItem key={option} value={option}>
                              <div className="flex items-center gap-2">
                                <span>{getIngredientIcon(option)}</span>
                                <span className="capitalize">{option}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleEditConfirm} className="gap-1">
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel} className="gap-1">
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getIngredientIcon(ingredient.type)}</span>
                          <span className="font-medium text-sm text-foreground truncate">
                            {ingredient.magicalName}
                          </span>
                          {isOverridden && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Brain className="h-3 w-3 text-yellow-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Type manually corrected</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
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
                        {confidence !== undefined && confidence < 0.8 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                <span className={`text-xs ${getConfidenceColor(confidence)}`}>
                                  {Math.round(confidence * 100)}% confidence
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Low confidence in type detection</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {ingredient.uniqueValues} values
                        </Badge>
                        <div className={`text-xs font-medium ${getPotencyColor(ingredient.potency * 100)}`}>
                          ✨ {Math.round(ingredient.potency * 100)}%
                        </div>
                        {isEditMode && onIngredientTypeChange && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(ingredient.column, ingredient.type);
                            }}
                            className="h-6 w-6 p-0 mt-1"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced magical sparkle effects */}
                  {!isEditing && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none overflow-hidden rounded-lg">
                      <div className="absolute top-2 right-2 text-yellow-400 animate-pulse">✨</div>
                      <div className="absolute bottom-2 left-2 text-blue-400 animate-pulse delay-150">✨</div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse delay-300">✨</div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
                    </div>
                  )}
                  
                  {/* Selection indicator */}
                  {selectedIngredients.includes(ingredient.column) && !isEditing && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold animate-scale-in">
                      ✓
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CauldronSlot, CauldronIngredient, CauldronRecipe } from './hooks/useCauldronState';
import { useRecipeEngine } from './hooks/useRecipeEngine';


interface MagicCauldronProps {
  slots: CauldronSlot[];
  isReadyToBrew: boolean;
  isBrewing: boolean;
  currentRecipe: CauldronRecipe | null;
  isIngredientCompatible: (ingredient: CauldronIngredient, slot: CauldronSlot) => boolean;
  addIngredientToSlot: (slotId: string, ingredient: CauldronIngredient) => void;
  removeIngredientFromSlot: (slotId: string) => void;
  clearCauldron: () => void;
  onBrew: (recipe: CauldronRecipe) => void;
  filledSlots: CauldronSlot[];
  draggedIngredient: CauldronIngredient | null;
  dragOverSlot: string | null;
  onDragOver: (slotId: string) => void;
  onDragLeave: () => void;
}

export const MagicCauldron: React.FC<MagicCauldronProps> = ({
  slots,
  isReadyToBrew,
  isBrewing,
  currentRecipe,
  isIngredientCompatible,
  addIngredientToSlot,
  removeIngredientFromSlot,
  clearCauldron,
  onBrew,
  filledSlots,
  draggedIngredient,
  dragOverSlot,
  onDragOver,
  onDragLeave
}) => {
  const { generateRecipe, getRecipeDescription, getConfidenceLevel } = useRecipeEngine();

  const handleDragOverInternal = (e: React.DragEvent, slot: CauldronSlot) => {
    e.preventDefault();
    if (draggedIngredient && isIngredientCompatible(draggedIngredient, slot)) {
      onDragOver(slot.id);
    }
  };

  const handleDragLeaveInternal = () => {
    onDragLeave();
  };

  const handleDrop = (e: React.DragEvent, slot: CauldronSlot) => {
    e.preventDefault();
    onDragLeave();
    
    if (draggedIngredient && isIngredientCompatible(draggedIngredient, slot)) {
      addIngredientToSlot(slot.id, draggedIngredient);
    }
  };

  const handleBrew = () => {
    const recipe = generateRecipe(filledSlots);
    if (recipe) {
      onBrew(recipe);
    }
  };

  const getSlotIcon = (slotId: string): string => {
    switch (slotId) {
      case 'primary-essence': return '🌟';
      case 'secondary-essence': return '💎';
      case 'dimensional-portal': return '🌀';
      case 'grouping-crystals': return '🔮';
      case 'temporal-accelerator': return '⏰';
      default: return '✨';
    }
  };

  const getSlotColor = (slot: CauldronSlot): string => {
    if (slot.ingredient) return 'border-primary bg-primary/10';
    if (dragOverSlot === slot.id && draggedIngredient && isIngredientCompatible(draggedIngredient, slot)) {
      return 'border-green-400 bg-green-400/20 shadow-lg';
    }
    if (dragOverSlot === slot.id) {
      return 'border-red-400 bg-red-400/20';
    }
    if (slot.required) return 'border-orange-400/50 bg-orange-400/10';
    return 'border-muted bg-muted/20';
  };

  return (
    <div className="space-y-6">
      {/* Cauldron Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">🪄 Magic Cauldron</h2>
        <p className="text-muted-foreground">
          Drop ingredients into the mystical slots to brew powerful visualizations
        </p>
      </div>

      {/* Main Cauldron */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-primary/30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`
                relative p-4 rounded-lg border-2 border-dashed transition-all duration-300
                min-h-[120px] flex flex-col justify-center items-center
                ${getSlotColor(slot)}
              `}
              onDragOver={(e) => handleDragOverInternal(e, slot)}
              onDragLeave={handleDragLeaveInternal}
              onDrop={(e) => handleDrop(e, slot)}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{getSlotIcon(slot.id)}</div>
                <h4 className="font-medium text-sm text-foreground mb-1">{slot.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{slot.description}</p>
                
                {slot.required && (
                  <Badge variant="outline" className="text-xs mb-2">Required</Badge>
                )}
                
                {slot.ingredient ? (
                  <div className="space-y-2">
                    <Badge className="text-xs">{slot.ingredient.columnName}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeIngredientFromSlot(slot.id)}
                      className="text-xs h-6"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Drop {slot.acceptedTypes.join(' or ')} essence
                  </div>
                )}
              </div>
              
              {/* Magical bubbling effect when filled */}
              {slot.ingredient && (
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div className="absolute top-2 left-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="absolute bottom-3 right-3 w-1 h-1 bg-primary rounded-full animate-pulse delay-300"></div>
                  <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-700"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Brewing Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            onClick={handleBrew}
            disabled={!isReadyToBrew || isBrewing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isBrewing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Brewing Magic...
              </>
            ) : (
              <>🧙‍♂️ Brew Visualization</>
            )}
          </Button>
          
          <Button variant="outline" onClick={clearCauldron}>
            🧹 Clear Cauldron
          </Button>
        </div>
      </Card>

      {/* Recipe Preview */}
      {currentRecipe && (
        <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">📜</div>
            <div>
              <h3 className="font-semibold text-foreground">{getRecipeDescription(currentRecipe)}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getConfidenceLevel(currentRecipe.confidence).color}>
                  {getConfidenceLevel(currentRecipe.confidence).level}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentRecipe.confidence}% confidence
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">
            "{currentRecipe.reasoning}"
          </p>
        </Card>
      )}
    </div>
  );
};
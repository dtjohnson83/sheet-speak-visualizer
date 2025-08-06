import React, { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { CauldronIngredientPalette } from './CauldronIngredientPalette';
import { MagicCauldron } from './MagicCauldron';
import { useCauldronState, CauldronIngredient, CauldronRecipe } from './hooks/useCauldronState';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useChartConfiguration } from '@/components/chart/hooks/useChartConfiguration';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

interface CauldronVisualizationModeProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSwitchToTraditional: () => void;
}

export const CauldronVisualizationMode: React.FC<CauldronVisualizationModeProps> = ({
  data,
  columns,
  onSwitchToTraditional
}) => {
  const {
    slots,
    ingredients,
    isBrewing,
    currentRecipe,
    filledSlots,
    isReadyToBrew,
    getMagicalName,
    addIngredientToSlot,
    removeIngredientFromSlot,
    clearCauldron,
    isIngredientCompatible,
    setIsBrewing,
    setCurrentRecipe
  } = useCauldronState(columns);

  const {
    draggedIngredient,
    dragOverSlot,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave
  } = useDragAndDrop();

  const chartConfig = useChartConfiguration();

  const handleBrew = useCallback(async (recipe: CauldronRecipe) => {
    setIsBrewing(true);
    setCurrentRecipe(recipe);

    try {
      // Apply the recipe to the chart configuration
      await new Promise(resolve => setTimeout(resolve, 2000)); // Brewing animation delay
      
      chartConfig.setChartType(recipe.chartType as any);
      chartConfig.setXColumn(recipe.xColumn);
      chartConfig.setYColumn(recipe.yColumn);
      
      if (recipe.zColumn) {
        chartConfig.setZColumn(recipe.zColumn);
      }
      
      if (recipe.stackColumn) {
        chartConfig.setStackColumn(recipe.stackColumn);
      }
      
      chartConfig.setAggregationMethod(recipe.aggregationMethod as any);

      toast.success(`🎉 ${recipe.chartType} visualization brewed successfully!`, {
        description: `Your magical chart is ready with ${recipe.confidence}% confidence!`
      });

    } catch (error) {
      toast.error('🚫 Brewing failed!', {
        description: 'The magical ingredients could not be combined properly.'
      });
    } finally {
      setIsBrewing(false);
    }
  }, [chartConfig]);

  const handleClearCauldron = useCallback(() => {
    clearCauldron();
    setCurrentRecipe(null);
    toast.info('🧹 Cauldron cleared', {
      description: 'Ready for new magical ingredients!'
    });
  }, [clearCauldron]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Ingredient Palette */}
      <div className="lg:col-span-1">
        <Card className="p-4 h-full overflow-y-auto">
          <CauldronIngredientPalette
            ingredients={ingredients}
            getMagicalName={getMagicalName}
            onDragStart={handleDragStart}
          />
        </Card>
      </div>

      {/* Magic Cauldron */}
      <div className="lg:col-span-2">
        <MagicCauldron
          slots={slots}
          isReadyToBrew={isReadyToBrew}
          isBrewing={isBrewing}
          currentRecipe={currentRecipe}
          isIngredientCompatible={isIngredientCompatible}
          addIngredientToSlot={addIngredientToSlot}
          removeIngredientFromSlot={removeIngredientFromSlot}
          clearCauldron={handleClearCauldron}
          onBrew={handleBrew}
          filledSlots={filledSlots}
          draggedIngredient={draggedIngredient}
          dragOverSlot={dragOverSlot}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />
      </div>
    </div>
  );
};
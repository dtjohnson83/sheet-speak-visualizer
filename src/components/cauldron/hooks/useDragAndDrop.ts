import { useState, useCallback } from 'react';
import { CauldronIngredient } from './useCauldronState';

export const useDragAndDrop = () => {
  const [draggedIngredient, setDraggedIngredient] = useState<CauldronIngredient | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const handleDragStart = useCallback((ingredient: CauldronIngredient) => {
    setDraggedIngredient(ingredient);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIngredient(null);
    setDragOverSlot(null);
  }, []);

  const handleDragOver = useCallback((slotId: string) => {
    setDragOverSlot(slotId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  return {
    draggedIngredient,
    dragOverSlot,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave
  };
};
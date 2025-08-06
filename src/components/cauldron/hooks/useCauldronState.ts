import { useState, useCallback, useMemo } from 'react';
import { ColumnInfo } from '@/pages/Index';

export interface CauldronIngredient {
  id: string;
  columnName: string;
  type: 'numeric' | 'categorical' | 'date' | 'text';
  dataType: string;
  uniqueValues: number;
  sampleValues: any[];
  potency: number; // 0-100 based on data quality and uniqueness
}

export interface CauldronSlot {
  id: string;
  name: string;
  description: string;
  acceptedTypes: string[];
  ingredient?: CauldronIngredient;
  required: boolean;
}

export interface CauldronRecipe {
  chartType: string;
  confidence: number;
  reasoning: string;
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  stackColumn?: string;
  aggregationMethod: string;
}

export const useCauldronState = (columns: ColumnInfo[]) => {
  const [slots, setSlots] = useState<CauldronSlot[]>([
    {
      id: 'primary-essence',
      name: 'Primary Essence',
      description: 'Main data dimension (X-axis)',
      acceptedTypes: ['categorical', 'date', 'numeric'],
      required: true
    },
    {
      id: 'secondary-essence', 
      name: 'Secondary Essence',
      description: 'Value dimension (Y-axis)',
      acceptedTypes: ['numeric'],
      required: true
    },
    {
      id: 'dimensional-portal',
      name: 'Dimensional Portal',
      description: 'Third dimension for 3D charts',
      acceptedTypes: ['numeric'],
      required: false
    },
    {
      id: 'grouping-crystals',
      name: 'Grouping Crystals', 
      description: 'Category grouping and stacking',
      acceptedTypes: ['categorical'],
      required: false
    },
    {
      id: 'temporal-accelerator',
      name: 'Temporal Accelerator',
      description: 'Time-based progression',
      acceptedTypes: ['date'],
      required: false
    }
  ]);

  const [isBrewing, setIsBrewing] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<CauldronRecipe | null>(null);

  // Convert columns to magical ingredients
  const ingredients = useMemo((): CauldronIngredient[] => {
    return columns.map(col => {
      // Calculate ingredient properties based on actual column data
      const uniqueValues = new Set(col.values).size;
      const totalRows = col.values.length;
      const potency = Math.min(100, Math.max(10, (uniqueValues / Math.max(1, totalRows)) * 100));
      
      // Get sample values (first 5 unique values)
      const sampleValues = Array.from(new Set(col.values)).slice(0, 5);
      
      return {
        id: col.name,
        columnName: col.name,
        type: col.type,
        dataType: col.type,
        uniqueValues,
        sampleValues,
        potency: Math.round(potency)
      };
    });
  }, [columns]);

  // Get magical name for ingredient
  const getMagicalName = useCallback((ingredient: CauldronIngredient): string => {
    const { type, columnName } = ingredient;
    const baseName = columnName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    switch (type) {
      case 'numeric':
        return `Essence of ${baseName}`;
      case 'date':
        return `Temporal Crystals of ${baseName}`;
      case 'categorical':
        return `Mystical ${baseName} Fragments`;
      default:
        return `Arcane ${baseName} Dust`;
    }
  }, []);

  // Add ingredient to slot
  const addIngredientToSlot = useCallback((slotId: string, ingredient: CauldronIngredient) => {
    setSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, ingredient }
          : slot
      )
    );
  }, []);

  // Remove ingredient from slot
  const removeIngredientFromSlot = useCallback((slotId: string) => {
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.id === slotId
          ? { ...slot, ingredient: undefined }
          : slot
      )
    );
  }, []);

  // Clear all slots
  const clearCauldron = useCallback(() => {
    setSlots(prevSlots =>
      prevSlots.map(slot => ({ ...slot, ingredient: undefined }))
    );
    setCurrentRecipe(null);
  }, []);

  // Check if ingredient is compatible with slot
  const isIngredientCompatible = useCallback((ingredient: CauldronIngredient, slot: CauldronSlot): boolean => {
    return slot.acceptedTypes.includes(ingredient.type);
  }, []);

  // Get filled slots
  const filledSlots = useMemo(() => {
    return slots.filter(slot => slot.ingredient);
  }, [slots]);

  // Check if cauldron is ready to brew
  const isReadyToBrew = useMemo(() => {
    const requiredSlots = slots.filter(slot => slot.required);
    return requiredSlots.every(slot => slot.ingredient);
  }, [slots]);

  return {
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
  };
};
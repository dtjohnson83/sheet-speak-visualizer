import { useMemo, useCallback } from 'react';
import { ColumnInfo } from '@/pages/Index';
import { IngredientAnalysis, IngredientType, TypeOverride } from '@/types/ingredient';

export const useIngredientAnalysis = (
  columns: ColumnInfo[],
  data: any[] = []
) => {
  const analyzeIngredients = useCallback((columns: ColumnInfo[], data: any[]): IngredientAnalysis[] => {
    return columns.map((column) => {
      const samples = data.slice(0, 5).map(row => row[column.name]).filter(val => val != null);
      
      // Determine ingredient type based on column type
      let type: IngredientType;
      switch (column.type) {
        case 'numeric':
          type = 'numeric';
          break;
        case 'date':
          type = 'temporal';
          break;
        case 'text':
          // Check if it might be geographic
          if (column.name.toLowerCase().includes('location') || 
              column.name.toLowerCase().includes('address') ||
              column.name.toLowerCase().includes('city') ||
              column.name.toLowerCase().includes('country')) {
            type = 'geographic';
          } else {
            // Check uniqueness to determine if categorical or textual
            const uniqueValues = new Set(samples).size;
            const totalSamples = samples.length;
            type = (uniqueValues / totalSamples) < 0.5 ? 'categorical' : 'textual';
          }
          break;
        case 'categorical':
        default:
          type = 'categorical';
      }

      // Calculate potency based on data characteristics (0-1 scale)
      const potency = calculatePotency(column, samples);
      
      // Calculate unique values
      const uniqueValues = new Set(samples).size;

      return {
        column: column.name,
        type,
        potency,
        uniqueValues,
        magicalName: generateMagicalName(column.name, type),
        properties: getIngredientProperties(column.name, type)
      };
    });
  }, []);

  const ingredients = useMemo(() => {
    if (!columns || columns.length === 0) return [];
    return analyzeIngredients(columns, data);
  }, [columns, data, analyzeIngredients]);

  const handleIngredientTypeChange = useCallback((
    columnName: string,
    newType: IngredientType,
    confidence?: number
  ): TypeOverride => {
    return {
      type: newType,
      confidence: confidence || 1.0,
      isOverridden: true
    };
  }, []);

  return {
    ingredients,
    handleIngredientTypeChange
  };
};

// Helper functions
const generateMagicalName = (columnName: string, type: IngredientType): string => {
  const prefixes = {
    'numeric': ['Essence of', 'Numeric Spirit of', 'Quantified'],
    'temporal': ['Chronos\'s', 'Time-bound', 'Temporal'],
    'categorical': ['Sorted', 'Classified', 'Grouped'],
    'geographic': ['Worldly', 'Terrestrial', 'Geographic'],
    'textual': ['Scripted', 'Literary', 'Textual']
  };
  
  const typePrefix = prefixes[type] || ['Essence of'];
  const index = columnName.charCodeAt(0) % typePrefix.length;
  return `${typePrefix[index]} ${columnName.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}`;
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

const calculatePotency = (column: ColumnInfo, samples: any[]): number => {
  // Base potency on data completeness and variety (0-1 scale)
  const completeness = samples.filter(s => s != null).length / Math.max(samples.length, 1);
  const uniqueness = new Set(samples).size / Math.max(samples.length, 1);
  
  return (completeness * 0.6 + uniqueness * 0.4);
};
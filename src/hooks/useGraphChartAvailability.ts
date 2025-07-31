import { useMemo } from 'react';
import { useDatasetSelection } from './useDatasetSelection';
import { useGraphEnhancedSemanticFusion } from './useGraphEnhancedSemanticFusion';

export interface GraphChartAvailability {
  canShowGraphCharts: boolean;
  graphChartTypes: string[];
  reasonUnavailable: string | null;
  availabilityDetails: {
    hasMultipleDatasets: boolean;
    hasGraphRelationships: boolean;
    hasSufficientData: boolean;
    datasetCount: number;
    relationshipCount: number;
    entityCount: number;
  };
}

export const useGraphChartAvailability = (): GraphChartAvailability => {
  const { availableDatasets } = useDatasetSelection();
  const { relationships, entities, isAnalyzing } = useGraphEnhancedSemanticFusion();

  return useMemo(() => {
    const hasMultipleDatasets = availableDatasets.length >= 2;
    const hasGraphRelationships = relationships.length > 0;
    const hasSufficientData = entities.length >= 5 && relationships.length >= 2;

    const canShowGraphCharts = hasMultipleDatasets && hasGraphRelationships && hasSufficientData;

    let reasonUnavailable: string | null = null;
    if (!hasMultipleDatasets) {
      reasonUnavailable = 'Requires 2+ datasets';
    } else if (!hasGraphRelationships) {
      reasonUnavailable = 'No relationships detected';
    } else if (!hasSufficientData) {
      reasonUnavailable = 'Insufficient graph structure';
    }

    return {
      canShowGraphCharts,
      graphChartTypes: ['network', 'network3d', 'entity-relationship'],
      reasonUnavailable,
      availabilityDetails: {
        hasMultipleDatasets,
        hasGraphRelationships,
        hasSufficientData,
        datasetCount: availableDatasets.length,
        relationshipCount: relationships.length,
        entityCount: entities.length
      }
    };
  }, [availableDatasets, relationships, entities, isAnalyzing]);
};
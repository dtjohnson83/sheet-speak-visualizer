import { useState, useEffect, useCallback } from 'react';
import { useRealtimeData } from '@/contexts/RealtimeDataContext';
import { useEnhancedAIContext } from './useEnhancedAIContext';
import { SemanticDataFusion, SemanticEntity, SemanticRelationship, FusedDataset } from '@/lib/semantic/SemanticDataFusion';
import { AIOntogyBuilder, BusinessOntology } from '@/lib/semantic/AIOntogyBuilder';

export const useSemanticDataFusion = () => {
  const { latestUpdates } = useRealtimeData();
  const { enhancedContext } = useEnhancedAIContext();
  
  const [semanticFusion] = useState(() => new SemanticDataFusion());
  const [ontologyBuilder] = useState(() => new AIOntogyBuilder());
  
  const [entities, setEntities] = useState<SemanticEntity[]>([]);
  const [relationships, setRelationships] = useState<SemanticRelationship[]>([]);
  const [fusedDatasets, setFusedDatasets] = useState<FusedDataset[]>([]);
  const [currentOntology, setCurrentOntology] = useState<BusinessOntology | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Update context when enhanced context changes
  useEffect(() => {
    if (enhancedContext) {
      semanticFusion.setEnhancedContext(enhancedContext);
      ontologyBuilder.setEnhancedContext(enhancedContext);
    }
  }, [enhancedContext, semanticFusion, ontologyBuilder]);

  // Analyze real-time data for semantic patterns
  useEffect(() => {
    const activeUpdates = Object.keys(latestUpdates).length;
    
    if (activeUpdates >= 2) { // Need at least 2 sources for fusion
      setIsAnalyzing(true);
      
      // Debounce analysis to avoid too frequent updates
      const analysisTimer = setTimeout(() => {
        performSemanticAnalysis();
      }, 1000);

      return () => clearTimeout(analysisTimer);
    } else {
      // Reset state when not enough sources
      setEntities([]);
      setRelationships([]);
      setFusedDatasets([]);
      setCurrentOntology(null);
      setSuggestions([]);
    }
  }, [latestUpdates]);

  const performSemanticAnalysis = useCallback(async () => {
    try {
      console.log('🔍 Starting semantic analysis of real-time data sources...');
      
      // Discover entities from all active sources
      const discoveredEntities = semanticFusion.discoverEntities(latestUpdates);
      console.log('📊 Discovered entities:', discoveredEntities.length);
      setEntities(discoveredEntities);

      if (discoveredEntities.length < 2) {
        setIsAnalyzing(false);
        return;
      }

      // Detect relationships between entities
      const discoveredRelationships = semanticFusion.detectRelationships(discoveredEntities, latestUpdates);
      console.log('🔗 Discovered relationships:', discoveredRelationships.length);
      setRelationships(discoveredRelationships);

      // Build ontology from discovered patterns
      const ontology = ontologyBuilder.buildOntology(discoveredEntities, discoveredRelationships);
      console.log('🏗️ Built ontology:', ontology.domain, 'with', ontology.classes.length, 'classes');
      setCurrentOntology(ontology);

      // Generate suggestions for improvement
      const improvementSuggestions = ontologyBuilder.suggestOntologyImprovements(ontology, []);
      setSuggestions(improvementSuggestions);

      // Create fused datasets if high-confidence relationships exist
      const highConfidenceRelationships = discoveredRelationships.filter(rel => rel.confidence > 0.6);
      if (highConfidenceRelationships.length > 0) {
        const fusedDataset = semanticFusion.fuseDataSources(latestUpdates, discoveredEntities, highConfidenceRelationships);
        console.log('🚀 Created fused dataset with', fusedDataset.data.length, 'rows');
        setFusedDatasets([fusedDataset]);
      }

    } catch (error) {
      console.error('❌ Error in semantic analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [latestUpdates, semanticFusion, ontologyBuilder]);

  const acceptRelationship = useCallback((relationshipId: string) => {
    if (currentOntology) {
      const userActions = [{
        type: 'accept_relationship' as const,
        targetId: relationshipId,
        timestamp: new Date()
      }];
      
      const updatedOntology = ontologyBuilder.learnFromUserFeedback(currentOntology, userActions);
      setCurrentOntology(updatedOntology);
      
      // Trigger re-analysis with improved confidence
      performSemanticAnalysis();
    }
  }, [currentOntology, ontologyBuilder, performSemanticAnalysis]);

  const rejectRelationship = useCallback((relationshipId: string) => {
    if (currentOntology) {
      const userActions = [{
        type: 'reject_relationship' as const,
        targetId: relationshipId,
        timestamp: new Date()
      }];
      
      const updatedOntology = ontologyBuilder.learnFromUserFeedback(currentOntology, userActions);
      setCurrentOntology(updatedOntology);
      
      // Update relationships with lower confidence
      setRelationships(prev => 
        prev.map(rel => 
          rel.sourceEntity.sourceId + rel.targetEntity.sourceId === relationshipId 
            ? { ...rel, confidence: Math.max(rel.confidence - 0.2, 0) }
            : rel
        )
      );
    }
  }, [currentOntology, ontologyBuilder]);

  const createCustomFusion = useCallback((selectedEntityIds: string[]) => {
    const selectedEntities = entities.filter(entity => 
      selectedEntityIds.includes(`${entity.type}_${entity.sourceId}`)
    );
    
    if (selectedEntities.length < 2) return null;

    const relevantRelationships = relationships.filter(rel => 
      selectedEntities.some(e => e.sourceId === rel.sourceEntity.sourceId) &&
      selectedEntities.some(e => e.sourceId === rel.targetEntity.sourceId)
    );

    const customUpdates: Record<string, any> = {};
    selectedEntities.forEach(entity => {
      if (latestUpdates[entity.sourceId]) {
        customUpdates[entity.sourceId] = latestUpdates[entity.sourceId];
      }
    });

    const fusedDataset = semanticFusion.fuseDataSources(customUpdates, selectedEntities, relevantRelationships);
    setFusedDatasets(prev => [...prev, fusedDataset]);
    
    return fusedDataset;
  }, [entities, relationships, latestUpdates, semanticFusion]);

  const getEntitySummary = useCallback(() => {
    const summary = {
      totalEntities: entities.length,
      entitiesByType: entities.reduce((acc, entity) => {
        acc[entity.type] = (acc[entity.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalRelationships: relationships.length,
      highConfidenceRelationships: relationships.filter(rel => rel.confidence > 0.7).length,
      fusedDatasets: fusedDatasets.length,
      averageQualityScore: fusedDatasets.length > 0 
        ? fusedDatasets.reduce((sum, ds) => sum + ds.qualityScore, 0) / fusedDatasets.length 
        : 0
    };
    
    return summary;
  }, [entities, relationships, fusedDatasets]);

  const getRecommendedJoins = useCallback(() => {
    return relationships
      .filter(rel => rel.confidence > 0.5)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Top 5 recommendations
      .map(rel => ({
        id: `${rel.sourceEntity.sourceId}_${rel.targetEntity.sourceId}`,
        description: `Join ${rel.sourceEntity.name} with ${rel.targetEntity.name}`,
        confidence: rel.confidence,
        joinColumns: rel.joinColumns,
        relationshipType: rel.relationshipType,
        sourceEntity: rel.sourceEntity,
        targetEntity: rel.targetEntity
      }));
  }, [relationships]);

  return {
    // State
    entities,
    relationships,
    fusedDatasets,
    currentOntology,
    isAnalyzing,
    suggestions,
    
    // Actions
    acceptRelationship,
    rejectRelationship,
    createCustomFusion,
    performSemanticAnalysis,
    
    // Computed values
    getEntitySummary,
    getRecommendedJoins,
    
    // Status
    hasMultipleSources: Object.keys(latestUpdates).length >= 2,
    canFuseData: relationships.some(rel => rel.confidence > 0.5)
  };
};
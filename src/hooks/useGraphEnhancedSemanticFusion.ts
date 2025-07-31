import { useState, useEffect, useCallback } from 'react';
import { useRealtimeData } from '@/contexts/RealtimeDataContext';
import { useEnhancedAIContext } from './useEnhancedAIContext';
import { KnowledgeGraphBuilder } from '@/lib/graph/KnowledgeGraphBuilder';
import { GraphNode, GraphRelationship } from '@/lib/graph/GraphDatabaseManager';

export interface GraphEnhancedEntity {
  id: string;
  type: string;
  name: string;
  sourceId: string;
  confidence: number;
  graphNode?: GraphNode;
  connections: string[];
  centralityScore: number;
}

export interface GraphEnhancedRelationship {
  id: string;
  sourceEntity: GraphEnhancedEntity;
  targetEntity: GraphEnhancedEntity;
  relationshipType: string;
  confidence: number;
  graphPath: GraphNode[];
  semanticStrength: number;
}

export interface GraphFusedDataset {
  id: string;
  name: string;
  data: any[];
  qualityScore: number;
  fusionMethod: 'graph_traversal' | 'semantic_similarity' | 'hybrid';
  graphMetrics: {
    nodeCount: number;
    relationshipCount: number;
    avgPathLength: number;
    clusteringCoefficient: number;
  };
}

export const useGraphEnhancedSemanticFusion = () => {
  const { latestUpdates } = useRealtimeData();
  const { enhancedContext } = useEnhancedAIContext();
  
  const [graphBuilder] = useState(() => new KnowledgeGraphBuilder());
  const [entities, setEntities] = useState<GraphEnhancedEntity[]>([]);
  const [relationships, setRelationships] = useState<GraphEnhancedRelationship[]>([]);
  const [fusedDatasets, setFusedDatasets] = useState<GraphFusedDataset[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [graphMetrics, setGraphMetrics] = useState({
    totalNodes: 0,
    totalRelationships: 0,
    averageConnectivity: 0,
    clusterCount: 0
  });

  // Build knowledge graphs for each data source
  useEffect(() => {
    const buildGraphsForSources = async () => {
      if (Object.keys(latestUpdates).length < 2) return;

      setIsAnalyzing(true);
      try {
        const graphEntities: GraphEnhancedEntity[] = [];
        const graphRelationships: GraphEnhancedRelationship[] = [];

        // Build knowledge graph for each source
        for (const [sourceId, sourceData] of Object.entries(latestUpdates)) {
          if ((sourceData as any)?.data && (sourceData as any)?.columns) {
            await graphBuilder.buildFromDataset(
              (sourceData as any).data,
              (sourceData as any).columns,
              sourceId,
              enhancedContext
            );

            // Extract graph-enhanced entities
            const sourceEntities = await extractGraphEntities(sourceId);
            graphEntities.push(...sourceEntities);
          }
        }

        // Detect cross-source relationships using graph analysis
        const crossSourceRelationships = await detectGraphRelationships(graphEntities);
        graphRelationships.push(...crossSourceRelationships);

        // Calculate graph metrics
        const metrics = calculateGraphMetrics(graphEntities, graphRelationships);
        
        setEntities(graphEntities);
        setRelationships(graphRelationships);
        setGraphMetrics(metrics);

        // Create fused datasets based on graph analysis
        if (graphRelationships.length > 0) {
          const fusedDataset = await createGraphFusedDataset(graphEntities, graphRelationships);
          setFusedDatasets([fusedDataset]);
        }

      } catch (error) {
        console.error('❌ Error in graph-enhanced semantic fusion:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const debounceTimer = setTimeout(buildGraphsForSources, 1500);
    return () => clearTimeout(debounceTimer);
  }, [latestUpdates, enhancedContext, graphBuilder]);

  const extractGraphEntities = useCallback(async (sourceId: string): Promise<GraphEnhancedEntity[]> => {
    const graphDB = graphBuilder.getGraphDB();
    const sourceNodes = await graphDB.getNodesByLabel('Entity');
    
    return sourceNodes
      .filter(node => node.properties.dataset === sourceId)
      .map(node => {
        const connections = calculateConnections(node, sourceNodes);
        const centralityScore = calculateCentralityScore(node, sourceNodes);
        
        return {
          id: node.id,
          type: node.labels.find(label => label !== 'Entity') || 'Unknown',
          name: node.properties.name || node.properties.value,
          sourceId,
          confidence: node.properties.confidence || 0.8,
          graphNode: node,
          connections,
          centralityScore
        };
      });
  }, [graphBuilder]);

  const detectGraphRelationships = useCallback(async (
    entities: GraphEnhancedEntity[]
  ): Promise<GraphEnhancedRelationship[]> => {
    const graphDB = graphBuilder.getGraphDB();
    const relationships: GraphEnhancedRelationship[] = [];

    // Group entities by source
    const entitiesBySource = entities.reduce((acc, entity) => {
      if (!acc[entity.sourceId]) acc[entity.sourceId] = [];
      acc[entity.sourceId].push(entity);
      return acc;
    }, {} as Record<string, GraphEnhancedEntity[]>);

    const sourceIds = Object.keys(entitiesBySource);

    // Find relationships between entities from different sources
    for (let i = 0; i < sourceIds.length; i++) {
      for (let j = i + 1; j < sourceIds.length; j++) {
        const source1Entities = entitiesBySource[sourceIds[i]];
        const source2Entities = entitiesBySource[sourceIds[j]];

        for (const entity1 of source1Entities) {
          for (const entity2 of source2Entities) {
            // Use graph path finding to detect relationships
            if (entity1.graphNode && entity2.graphNode) {
              const path = await graphDB.findShortestPath(entity1.graphNode.id, entity2.graphNode.id);
              
              if (path.length > 0 && path.length <= 4) { // Max 4 hops
                const semanticStrength = calculateSemanticStrength(entity1, entity2, path);
                const confidence = calculateRelationshipConfidence(entity1, entity2, path);
                
                if (confidence > 0.5) {
                  relationships.push({
                    id: `rel_${entity1.id}_${entity2.id}`,
                    sourceEntity: entity1,
                    targetEntity: entity2,
                    relationshipType: inferRelationshipType(entity1, entity2, path),
                    confidence,
                    graphPath: path,
                    semanticStrength
                  });
                }
              }
            }
          }
        }
      }
    }

    return relationships.sort((a, b) => b.confidence - a.confidence);
  }, [graphBuilder]);

  const createGraphFusedDataset = useCallback(async (
    entities: GraphEnhancedEntity[],
    relationships: GraphEnhancedRelationship[]
  ): Promise<GraphFusedDataset> => {
    // Use graph relationships to intelligently fuse data
    const fusedData: any[] = [];
    const processedEntities = new Set<string>();

    // Start with highest centrality entities
    const sortedEntities = entities.sort((a, b) => b.centralityScore - a.centralityScore);

    for (const entity of sortedEntities.slice(0, 100)) { // Limit for performance
      if (processedEntities.has(entity.id)) continue;

      // Find all related entities
      const relatedEntities = relationships
        .filter(rel => rel.sourceEntity.id === entity.id || rel.targetEntity.id === entity.id)
        .map(rel => rel.sourceEntity.id === entity.id ? rel.targetEntity : rel.sourceEntity);

      // Create fused record
      const fusedRecord: any = {
        primary_entity: entity.name,
        primary_entity_type: entity.type,
        primary_source: entity.sourceId,
        centrality_score: entity.centralityScore,
        related_entities: relatedEntities.map(e => e.name),
        relationship_count: relatedEntities.length
      };

      // Add source data for this entity
      const sourceData = latestUpdates[entity.sourceId];
      if (sourceData?.data) {
        const entityRows = sourceData.data.filter((row: any) =>
          Object.values(row).some(value => value === entity.name)
        );
        
        if (entityRows.length > 0) {
          Object.assign(fusedRecord, entityRows[0]);
        }
      }

      fusedData.push(fusedRecord);
      processedEntities.add(entity.id);
      relatedEntities.forEach(e => processedEntities.add(e.id));
    }

    const graphMetrics = {
      nodeCount: entities.length,
      relationshipCount: relationships.length,
      avgPathLength: relationships.reduce((sum, rel) => sum + rel.graphPath.length, 0) / relationships.length || 0,
      clusteringCoefficient: calculateClusteringCoefficient(entities, relationships)
    };

    return {
      id: `graph_fused_${Date.now()}`,
      name: 'Graph-Enhanced Fused Dataset',
      data: fusedData,
      qualityScore: calculateFusionQualityScore(entities, relationships, fusedData),
      fusionMethod: 'hybrid',
      graphMetrics
    };
  }, [latestUpdates]);

  // Utility functions
  const calculateConnections = (node: GraphNode, allNodes: GraphNode[]): string[] => {
    // Simplified - in real implementation, traverse actual graph relationships
    return allNodes
      .filter(n => n.id !== node.id && n.properties.dataset === node.properties.dataset)
      .slice(0, 5)
      .map(n => n.id);
  };

  const calculateCentralityScore = (node: GraphNode, allNodes: GraphNode[]): number => {
    // Simplified centrality calculation
    const connections = calculateConnections(node, allNodes).length;
    const maxConnections = Math.min(allNodes.length - 1, 10);
    return connections / maxConnections;
  };

  const calculateSemanticStrength = (
    entity1: GraphEnhancedEntity,
    entity2: GraphEnhancedEntity,
    path: GraphNode[]
  ): number => {
    // Calculate semantic similarity based on entity types and path
    let strength = 0.5;
    
    if (entity1.type === entity2.type) strength += 0.2;
    if (path.length <= 2) strength += 0.2;
    if (entity1.confidence > 0.8 && entity2.confidence > 0.8) strength += 0.1;
    
    return Math.min(1, strength);
  };

  const calculateRelationshipConfidence = (
    entity1: GraphEnhancedEntity,
    entity2: GraphEnhancedEntity,
    path: GraphNode[]
  ): number => {
    let confidence = (entity1.confidence + entity2.confidence) / 2;
    confidence *= Math.max(0.5, 1 - (path.length - 1) * 0.1); // Penalize longer paths
    return confidence;
  };

  const inferRelationshipType = (
    entity1: GraphEnhancedEntity,
    entity2: GraphEnhancedEntity,
    path: GraphNode[]
  ): string => {
    if (entity1.type === 'Customer' && entity2.type === 'Product') return 'PURCHASED';
    if (entity1.type === 'Location' && entity2.type === 'Customer') return 'LOCATED_IN';
    if (path.length === 2) return 'DIRECTLY_RELATED';
    return 'INDIRECTLY_RELATED';
  };

  const calculateGraphMetrics = (entities: GraphEnhancedEntity[], relationships: GraphEnhancedRelationship[]) => {
    return {
      totalNodes: entities.length,
      totalRelationships: relationships.length,
      averageConnectivity: entities.reduce((sum, e) => sum + e.connections.length, 0) / entities.length || 0,
      clusterCount: Math.ceil(entities.length / 10) // Simplified clustering
    };
  };

  const calculateClusteringCoefficient = (
    entities: GraphEnhancedEntity[],
    relationships: GraphEnhancedRelationship[]
  ): number => {
    // Simplified clustering coefficient calculation
    return relationships.length / (entities.length * (entities.length - 1) / 2) || 0;
  };

  const calculateFusionQualityScore = (
    entities: GraphEnhancedEntity[],
    relationships: GraphEnhancedRelationship[],
    fusedData: any[]
  ): number => {
    const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length || 0;
    const avgRelationshipConfidence = relationships.reduce((sum, r) => sum + r.confidence, 0) / relationships.length || 0;
    const dataCompleteness = fusedData.length / entities.length;
    
    return (avgEntityConfidence + avgRelationshipConfidence + Math.min(1, dataCompleteness)) / 3;
  };

  return {
    // State
    entities,
    relationships,
    fusedDatasets,
    isAnalyzing,
    graphMetrics,
    
    // Computed values
    hasGraphData: entities.length > 0,
    canFuseData: relationships.some(rel => rel.confidence > 0.6),
    
    // Actions
    extractGraphEntities,
    detectGraphRelationships,
    createGraphFusedDataset,
    
    // Graph utilities
    graphBuilder
  };
};
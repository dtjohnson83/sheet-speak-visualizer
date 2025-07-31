import { GraphEnhancedEntity, GraphEnhancedRelationship } from '@/hooks/useGraphEnhancedSemanticFusion';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface GraphChartData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    sourceCount: number;
    entityTypes: string[];
  };
}

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  sourceId: string;
  centrality: number;
  color?: string;
  size?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  type: string;
  color?: string;
  width?: number;
}

export interface ERDiagramData {
  entities: EREntity[];
  relationships: ERRelationship[];
}

export interface EREntity {
  id: string;
  name: string;
  type: string;
  attributes: string[];
  sourceId: string;
  position?: { x: number; y: number };
}

export interface ERRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  cardinality: string;
}

/**
 * Prepare data for network and 3D network visualizations
 */
export const prepareNetworkChartData = (
  relationships: GraphEnhancedRelationship[],
  entities: GraphEnhancedEntity[]
): GraphChartData => {
  // Create color mapping for different sources
  const sourceColors = new Map<string, string>();
  const uniqueSources = [...new Set(entities.map(e => e.sourceId))];
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];
  
  uniqueSources.forEach((sourceId, index) => {
    sourceColors.set(sourceId, colors[index % colors.length]);
  });

  // Create nodes from entities
  const nodes: GraphNode[] = entities.map(entity => ({
    id: entity.id,
    name: entity.name,
    type: entity.type,
    sourceId: entity.sourceId,
    centrality: entity.centralityScore,
    color: sourceColors.get(entity.sourceId),
    size: Math.max(5, entity.centralityScore * 20)
  }));

  // Create edges from relationships
  const edges: GraphEdge[] = relationships.map(rel => ({
    source: rel.sourceEntity.id,
    target: rel.targetEntity.id,
    strength: rel.confidence,
    type: rel.relationshipType,
    color: '#6B7280',
    width: Math.max(1, rel.confidence * 5)
  }));

  return {
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      sourceCount: uniqueSources.length,
      entityTypes: [...new Set(entities.map(e => e.type))]
    }
  };
};

/**
 * Prepare data for entity-relationship diagrams
 */
export const prepareERDiagramData = (
  relationships: GraphEnhancedRelationship[],
  entities: GraphEnhancedEntity[]
): ERDiagramData => {
  // Group entities by type for better positioning
  const entityTypes = [...new Set(entities.map(e => e.type))];
  const entitiesPerRow = Math.ceil(Math.sqrt(entities.length));
  
  const erEntities: EREntity[] = entities.map((entity, index) => {
    const row = Math.floor(index / entitiesPerRow);
    const col = index % entitiesPerRow;
    
    // Extract attributes from the entity's source data
    const attributes = entity.connections.slice(0, 5); // Limit attributes for clarity
    
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      attributes,
      sourceId: entity.sourceId,
      position: {
        x: col * 200 + 100,
        y: row * 150 + 100
      }
    };
  });

  const erRelationships: ERRelationship[] = relationships.map(rel => ({
    id: `rel_${rel.id}`,
    source: rel.sourceEntity.id,
    target: rel.targetEntity.id,
    type: rel.relationshipType,
    cardinality: inferCardinality(rel)
  }));

  return {
    entities: erEntities,
    relationships: erRelationships
  };
};

/**
 * Convert cross-dataset relationships to standard chart data format
 */
export const convertGraphToChartData = (
  chartType: 'network' | 'network3d' | 'entity-relationship',
  relationships: GraphEnhancedRelationship[],
  entities: GraphEnhancedEntity[]
): DataRow[] => {
  switch (chartType) {
    case 'network':
    case 'network3d':
      return relationships.map((rel, index) => ({
        id: index + 1,
        source: rel.sourceEntity.name,
        target: rel.targetEntity.name,
        source_type: rel.sourceEntity.type,
        target_type: rel.targetEntity.type,
        relationship_type: rel.relationshipType,
        confidence: rel.confidence,
        semantic_strength: rel.semanticStrength,
        source_dataset: rel.sourceEntity.sourceId,
        target_dataset: rel.targetEntity.sourceId
      }));

    case 'entity-relationship':
      return entities.map((entity, index) => ({
        id: index + 1,
        entity_name: entity.name,
        entity_type: entity.type,
        source_dataset: entity.sourceId,
        centrality_score: entity.centralityScore,
        confidence: entity.confidence,
        connection_count: entity.connections.length
      }));

    default:
      return [];
  }
};

/**
 * Generate appropriate columns for graph chart data
 */
export const getGraphChartColumns = (chartType: 'network' | 'network3d' | 'entity-relationship'): ColumnInfo[] => {
  switch (chartType) {
    case 'network':
    case 'network3d':
      return [
        { name: 'source', type: 'text', values: [] },
        { name: 'target', type: 'text', values: [] },
        { name: 'source_type', type: 'categorical', values: [] },
        { name: 'target_type', type: 'categorical', values: [] },
        { name: 'relationship_type', type: 'categorical', values: [] },
        { name: 'confidence', type: 'numeric', values: [] },
        { name: 'semantic_strength', type: 'numeric', values: [] },
        { name: 'source_dataset', type: 'categorical', values: [] },
        { name: 'target_dataset', type: 'categorical', values: [] }
      ];

    case 'entity-relationship':
      return [
        { name: 'entity_name', type: 'categorical', values: [] },
        { name: 'entity_type', type: 'categorical', values: [] },
        { name: 'source_dataset', type: 'categorical', values: [] },
        { name: 'centrality_score', type: 'numeric', values: [] },
        { name: 'confidence', type: 'numeric', values: [] },
        { name: 'connection_count', type: 'numeric', values: [] }
      ];

    default:
      return [];
  }
};

// Helper functions
function inferCardinality(relationship: GraphEnhancedRelationship): string {
  // Simple cardinality inference based on relationship type
  const type = relationship.relationshipType.toLowerCase();
  
  if (type.includes('one_to_many') || type.includes('has_many')) {
    return '1:N';
  }
  if (type.includes('many_to_many') || type.includes('belongs_to_many')) {
    return 'N:M';
  }
  if (type.includes('one_to_one') || type.includes('has_one')) {
    return '1:1';
  }
  
  // Default based on confidence
  return relationship.confidence > 0.8 ? '1:1' : '1:N';
}
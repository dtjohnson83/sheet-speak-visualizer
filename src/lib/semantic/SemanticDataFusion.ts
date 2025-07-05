import { DataRow, ColumnInfo } from '@/pages/Index';
import { RealtimeDataUpdate } from '@/types/realtime';
import { EnhancedDataContext } from '@/components/ai-context/EnhancedDataContextManager';

export interface SemanticEntity {
  name: string;
  type: 'customer' | 'product' | 'transaction' | 'time' | 'location' | 'metric';
  columns: string[];
  sourceId: string;
  confidence: number;
}

export interface SemanticRelationship {
  sourceEntity: SemanticEntity;
  targetEntity: SemanticEntity;
  relationshipType: 'one-to-many' | 'many-to-one' | 'many-to-many' | 'temporal' | 'hierarchical';
  joinColumns: { source: string; target: string }[];
  confidence: number;
}

export interface FusedDataset {
  id: string;
  name: string;
  data: DataRow[];
  columns: ColumnInfo[];
  sourceIds: string[];
  entities: SemanticEntity[];
  relationships: SemanticRelationship[];
  qualityScore: number;
}

export class SemanticDataFusion {
  private enhancedContext: EnhancedDataContext | null = null;

  setEnhancedContext(context: EnhancedDataContext) {
    this.enhancedContext = context;
  }

  /**
   * Discover entities across multiple real-time data sources
   */
  discoverEntities(updates: Record<string, RealtimeDataUpdate>): SemanticEntity[] {
    const entities: SemanticEntity[] = [];

    Object.entries(updates).forEach(([sourceId, update]) => {
      const sourceEntities = this.extractEntitiesFromSource(sourceId, update);
      entities.push(...sourceEntities);
    });

    return this.deduplicateEntities(entities);
  }

  private extractEntitiesFromSource(sourceId: string, update: RealtimeDataUpdate): SemanticEntity[] {
    const entities: SemanticEntity[] = [];
    const columns = update.columns || [];

    // Group columns by semantic type using enhanced context
    const customerColumns = columns.filter(col => 
      this.isCustomerRelated(col.name) || 
      (this.enhancedContext?.columnContexts.find(ctx => 
        ctx.name === col.name && ctx.businessMeaning.toLowerCase().includes('customer')
      ))
    );

    const productColumns = columns.filter(col => 
      this.isProductRelated(col.name) ||
      (this.enhancedContext?.columnContexts.find(ctx => 
        ctx.name === col.name && ctx.businessMeaning.toLowerCase().includes('product')
      ))
    );

    const timeColumns = columns.filter(col => 
      col.type === 'date' || this.isTimeRelated(col.name)
    );

    const metricColumns = columns.filter(col => 
      col.type === 'numeric' && (
        this.enhancedContext?.columnContexts.find(ctx => 
          ctx.name === col.name && ctx.isKPI
        ) || this.isMetricRelated(col.name)
      )
    );

    // Create entities
    if (customerColumns.length > 0) {
      entities.push({
        name: 'Customer',
        type: 'customer',
        columns: customerColumns.map(c => c.name),
        sourceId,
        confidence: this.calculateEntityConfidence(customerColumns, update.data)
      });
    }

    if (productColumns.length > 0) {
      entities.push({
        name: 'Product',
        type: 'product',
        columns: productColumns.map(c => c.name),
        sourceId,
        confidence: this.calculateEntityConfidence(productColumns, update.data)
      });
    }

    if (timeColumns.length > 0) {
      entities.push({
        name: 'Time',
        type: 'time',
        columns: timeColumns.map(c => c.name),
        sourceId,
        confidence: this.calculateEntityConfidence(timeColumns, update.data)
      });
    }

    if (metricColumns.length > 0) {
      entities.push({
        name: 'Metrics',
        type: 'metric',
        columns: metricColumns.map(c => c.name),
        sourceId,
        confidence: this.calculateEntityConfidence(metricColumns, update.data)
      });
    }

    return entities;
  }

  /**
   * Detect relationships between entities across data sources
   */
  detectRelationships(entities: SemanticEntity[], updates: Record<string, RealtimeDataUpdate>): SemanticRelationship[] {
    const relationships: SemanticRelationship[] = [];

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const relationship = this.analyzeEntityRelationship(entities[i], entities[j], updates);
        if (relationship && relationship.confidence > 0.3) {
          relationships.push(relationship);
        }
      }
    }

    return relationships.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeEntityRelationship(
    entity1: SemanticEntity, 
    entity2: SemanticEntity, 
    updates: Record<string, RealtimeDataUpdate>
  ): SemanticRelationship | null {
    // Skip if same source and type (would be self-relationship)
    if (entity1.sourceId === entity2.sourceId && entity1.type === entity2.type) {
      return null;
    }

    const update1 = updates[entity1.sourceId];
    const update2 = updates[entity2.sourceId];

    if (!update1 || !update2) return null;

    // Look for potential join columns
    const joinColumns = this.findJoinColumns(entity1, entity2, update1, update2);
    
    if (joinColumns.length === 0) return null;

    // Determine relationship type
    const relationshipType = this.determineRelationshipType(entity1, entity2, joinColumns, update1, update2);
    
    // Calculate confidence based on data overlap and semantic similarity
    const confidence = this.calculateRelationshipConfidence(entity1, entity2, joinColumns, update1, update2);

    return {
      sourceEntity: entity1,
      targetEntity: entity2,
      relationshipType,
      joinColumns,
      confidence
    };
  }

  private findJoinColumns(
    entity1: SemanticEntity, 
    entity2: SemanticEntity, 
    update1: RealtimeDataUpdate, 
    update2: RealtimeDataUpdate
  ): { source: string; target: string }[] {
    const joinColumns: { source: string; target: string }[] = [];

    // Look for exact column name matches
    entity1.columns.forEach(col1 => {
      entity2.columns.forEach(col2 => {
        if (this.areColumnsRelated(col1, col2)) {
          joinColumns.push({ source: col1, target: col2 });
        }
      });
    });

    // Look for semantic matches using enhanced context
    if (this.enhancedContext) {
      entity1.columns.forEach(col1 => {
        entity2.columns.forEach(col2 => {
          const ctx1 = this.enhancedContext!.columnContexts.find(ctx => ctx.name === col1);
          const ctx2 = this.enhancedContext!.columnContexts.find(ctx => ctx.name === col2);
          
          if (ctx1 && ctx2 && this.areContextsRelated(ctx1, ctx2)) {
            joinColumns.push({ source: col1, target: col2 });
          }
        });
      });
    }

    return joinColumns;
  }

  /**
   * Fuse multiple data sources into a unified dataset
   */
  fuseDataSources(
    updates: Record<string, RealtimeDataUpdate>, 
    entities: SemanticEntity[], 
    relationships: SemanticRelationship[]
  ): FusedDataset {
    // Start with the largest dataset as base
    const baseSources = Object.entries(updates).sort((a, b) => b[1].data.length - a[1].data.length);
    const [baseSourceId, baseUpdate] = baseSources[0];

    let fusedData = [...baseUpdate.data];
    let fusedColumns = [...(baseUpdate.columns || [])];
    const sourceIds = [baseSourceId];

    // Join additional sources based on relationships
    baseSources.slice(1).forEach(([sourceId, update]) => {
      const relevantRelationships = relationships.filter(rel => 
        (rel.sourceEntity.sourceId === baseSourceId && rel.targetEntity.sourceId === sourceId) ||
        (rel.sourceEntity.sourceId === sourceId && rel.targetEntity.sourceId === baseSourceId)
      );

      if (relevantRelationships.length > 0) {
        const joinResult = this.joinDatasets(fusedData, fusedColumns, update, relevantRelationships[0]);
        fusedData = joinResult.data;
        fusedColumns = joinResult.columns;
        sourceIds.push(sourceId);
      }
    });

    const qualityScore = this.calculateFusionQualityScore(fusedData, relationships);

    return {
      id: `fused_${Date.now()}`,
      name: `Fused Dataset (${sourceIds.length} sources)`,
      data: fusedData,
      columns: fusedColumns,
      sourceIds,
      entities,
      relationships,
      qualityScore
    };
  }

  private joinDatasets(
    leftData: DataRow[], 
    leftColumns: ColumnInfo[], 
    rightUpdate: RealtimeDataUpdate, 
    relationship: SemanticRelationship
  ): { data: DataRow[]; columns: ColumnInfo[] } {
    const rightData = rightUpdate.data;
    const rightColumns = rightUpdate.columns || [];
    const joinColumn = relationship.joinColumns[0];

    // Perform left join
    const joinedData = leftData.map(leftRow => {
      const matchingRightRows = rightData.filter(rightRow => 
        leftRow[joinColumn.source] === rightRow[joinColumn.target]
      );

      if (matchingRightRows.length > 0) {
        const rightRow = matchingRightRows[0]; // Take first match for now
        return { ...leftRow, ...rightRow };
      }
      
      return leftRow;
    });

    // Merge column definitions, avoiding duplicates
    const existingColumnNames = new Set(leftColumns.map(c => c.name));
    const newColumns = rightColumns.filter(col => !existingColumnNames.has(col.name));

    return {
      data: joinedData,
      columns: [...leftColumns, ...newColumns]
    };
  }

  // Helper methods
  private isCustomerRelated(columnName: string): boolean {
    const customerKeywords = ['customer', 'client', 'user', 'account', 'buyer'];
    return customerKeywords.some(keyword => 
      columnName.toLowerCase().includes(keyword)
    );
  }

  private isProductRelated(columnName: string): boolean {
    const productKeywords = ['product', 'item', 'sku', 'category', 'brand'];
    return productKeywords.some(keyword => 
      columnName.toLowerCase().includes(keyword)
    );
  }

  private isTimeRelated(columnName: string): boolean {
    const timeKeywords = ['date', 'time', 'timestamp', 'created', 'updated', 'modified'];
    return timeKeywords.some(keyword => 
      columnName.toLowerCase().includes(keyword)
    );
  }

  private isMetricRelated(columnName: string): boolean {
    const metricKeywords = ['amount', 'total', 'count', 'sum', 'avg', 'revenue', 'profit', 'cost'];
    return metricKeywords.some(keyword => 
      columnName.toLowerCase().includes(keyword)
    );
  }

  private areColumnsRelated(col1: string, col2: string): boolean {
    return col1.toLowerCase() === col2.toLowerCase() ||
           col1.toLowerCase().includes(col2.toLowerCase()) ||
           col2.toLowerCase().includes(col1.toLowerCase());
  }

  private areContextsRelated(ctx1: any, ctx2: any): boolean {
    return ctx1.businessMeaning === ctx2.businessMeaning ||
           (ctx1.isKPI && ctx2.isKPI) ||
           ctx1.dataType === ctx2.dataType;
  }

  private calculateEntityConfidence(columns: ColumnInfo[], data: DataRow[]): number {
    // Simple confidence calculation based on data completeness and column relevance
    const completeness = columns.reduce((sum, col) => {
      const filledValues = data.filter(row => row[col.name] != null && row[col.name] !== '').length;
      return sum + (filledValues / data.length);
    }, 0) / columns.length;

    return Math.min(completeness * 1.2, 1.0); // Boost slightly, cap at 1.0
  }

  private determineRelationshipType(
    entity1: SemanticEntity, 
    entity2: SemanticEntity, 
    joinColumns: { source: string; target: string }[], 
    update1: RealtimeDataUpdate, 
    update2: RealtimeDataUpdate
  ): SemanticRelationship['relationshipType'] {
    // Simple heuristics for relationship type
    if (entity1.type === 'time' || entity2.type === 'time') {
      return 'temporal';
    }
    
    if (entity1.type === 'customer' && entity2.type === 'transaction') {
      return 'one-to-many';
    }
    
    if (entity1.type === 'product' && entity2.type === 'transaction') {
      return 'one-to-many';
    }

    return 'many-to-many'; // Default
  }

  private calculateRelationshipConfidence(
    entity1: SemanticEntity, 
    entity2: SemanticEntity, 
    joinColumns: { source: string; target: string }[], 
    update1: RealtimeDataUpdate, 
    update2: RealtimeDataUpdate
  ): number {
    // Calculate based on data overlap
    const joinColumn = joinColumns[0];
    const values1 = new Set(update1.data.map(row => row[joinColumn.source]).filter(v => v != null));
    const values2 = new Set(update2.data.map(row => row[joinColumn.target]).filter(v => v != null));
    
    const intersection = new Set([...values1].filter(x => values2.has(x)));
    const union = new Set([...values1, ...values2]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Boost confidence for semantic matches
    const semanticBoost = entity1.confidence * entity2.confidence;
    
    return Math.min((jaccardSimilarity + semanticBoost) / 2, 1.0);
  }

  private calculateFusionQualityScore(data: DataRow[], relationships: SemanticRelationship[]): number {
    const avgRelationshipConfidence = relationships.reduce((sum, rel) => sum + rel.confidence, 0) / relationships.length;
    const dataCompleteness = this.calculateDataCompleteness(data);
    
    return (avgRelationshipConfidence + dataCompleteness) / 2;
  }

  private calculateDataCompleteness(data: DataRow[]): number {
    if (data.length === 0) return 0;
    
    const totalCells = data.length * Object.keys(data[0] || {}).length;
    const filledCells = data.reduce((sum, row) => {
      return sum + Object.values(row).filter(val => val != null && val !== '').length;
    }, 0);
    
    return filledCells / totalCells;
  }

  private deduplicateEntities(entities: SemanticEntity[]): SemanticEntity[] {
    const uniqueEntities: SemanticEntity[] = [];
    const seen = new Set<string>();

    entities.forEach(entity => {
      const key = `${entity.type}-${entity.sourceId}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEntities.push(entity);
      }
    });

    return uniqueEntities;
  }
}
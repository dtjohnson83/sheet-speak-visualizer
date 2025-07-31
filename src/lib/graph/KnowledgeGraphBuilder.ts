import { GraphDatabaseManager, GraphNode, GraphRelationship } from './GraphDatabaseManager';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { EnhancedDataContext } from '@/components/ai-context/EnhancedDataContextManager';

export interface EntityType {
  id: string;
  name: string;
  description: string;
  properties: string[];
}

export interface DataEntity {
  id: string;
  type: string;
  name: string;
  sourceDataset: string;
  sourceColumn?: string;
  properties: Record<string, any>;
  confidence: number;
}

export class KnowledgeGraphBuilder {
  private graphDB: GraphDatabaseManager;

  constructor() {
    this.graphDB = new GraphDatabaseManager();
  }

  async buildFromDataset(
    data: DataRow[],
    columns: ColumnInfo[],
    datasetId: string,
    enhancedContext?: EnhancedDataContext
  ): Promise<void> {
    console.log('🏗️ Building knowledge graph from dataset:', datasetId);

    // Create dataset node
    const datasetNode: GraphNode = {
      id: `dataset_${datasetId}`,
      labels: ['Dataset'],
      properties: {
        id: datasetId,
        name: datasetId,
        rowCount: data.length,
        columnCount: columns.length,
        createdAt: new Date().toISOString()
      }
    };
    await this.graphDB.addNode(datasetNode);

    // Create column nodes and relationships
    for (const column of columns) {
      const columnNode: GraphNode = {
        id: `column_${datasetId}_${column.name}`,
        labels: ['Column'],
        properties: {
          name: column.name,
          type: column.type,
          dataset: datasetId,
          uniqueValues: column.values.filter((v, i, arr) => arr.indexOf(v) === i).length,
          nullCount: column.values.filter(v => v === null || v === undefined || v === '').length
        }
      };
      await this.graphDB.addNode(columnNode);

      // Relationship from dataset to column
      const datasetColumnRel: GraphRelationship = {
        id: `rel_${datasetId}_${column.name}`,
        type: 'HAS_COLUMN',
        startNodeId: datasetNode.id,
        endNodeId: columnNode.id,
        properties: { order: columns.indexOf(column) }
      };
      await this.graphDB.addRelationship(datasetColumnRel);
    }

    // Extract entities from data
    await this.extractEntities(data, columns, datasetId, enhancedContext);

    // Detect relationships between entities
    await this.detectEntityRelationships(datasetId);

    console.log('✅ Knowledge graph built successfully');
  }

  private async extractEntities(
    data: DataRow[],
    columns: ColumnInfo[],
    datasetId: string,
    enhancedContext?: EnhancedDataContext
  ): Promise<void> {
    const entities: DataEntity[] = [];

    // Extract entities based on column types and business context
    for (const column of columns) {
      const columnType = this.inferEntityType(column, enhancedContext);
      
      if (columnType) {
        // Create entities for unique values in entity columns
        const uniqueValues = [...new Set(column.values.filter(v => v !== null && v !== undefined && v !== ''))];
        
        for (const value of uniqueValues.slice(0, 100)) { // Limit to prevent explosion
          const entity: DataEntity = {
            id: `entity_${datasetId}_${column.name}_${String(value).replace(/[^a-zA-Z0-9]/g, '_')}`,
            type: columnType,
            name: String(value),
            sourceDataset: datasetId,
            sourceColumn: column.name,
            properties: {
              value,
              column: column.name,
              dataset: datasetId,
              occurrences: column.values.filter(v => v === value).length
            },
            confidence: this.calculateEntityConfidence(column, value, enhancedContext)
          };
          entities.push(entity);
        }
      }
    }

    // Create nodes for high-confidence entities
    for (const entity of entities.filter(e => e.confidence > 0.6)) {
      const entityNode: GraphNode = {
        id: entity.id,
        labels: ['Entity', entity.type],
        properties: entity.properties
      };
      await this.graphDB.addNode(entityNode);

      // Link to source column
      const columnNodeId = `column_${datasetId}_${entity.sourceColumn}`;
      const entityColumnRel: GraphRelationship = {
        id: `rel_entity_${entity.id}_column`,
        type: 'EXTRACTED_FROM',
        startNodeId: entity.id,
        endNodeId: columnNodeId,
        properties: { confidence: entity.confidence }
      };
      await this.graphDB.addRelationship(entityColumnRel);
    }
  }

  private inferEntityType(column: ColumnInfo, enhancedContext?: EnhancedDataContext): string | null {
    const columnName = column.name.toLowerCase();
    
    // Use enhanced context if available
    if (enhancedContext) {
      const columnContext = enhancedContext.columnContexts.find(c => c.name === column.name);
      if (columnContext?.businessMeaning) {
        return this.mapBusinessMeaningToEntityType(columnContext.businessMeaning);
      }
    }

    // Basic entity type inference
    if (columnName.includes('id') || columnName.includes('key')) return 'Identifier';
    if (columnName.includes('name') || columnName.includes('title')) return 'Name';
    if (columnName.includes('category') || columnName.includes('type')) return 'Category';
    if (columnName.includes('location') || columnName.includes('city') || columnName.includes('country')) return 'Location';
    if (columnName.includes('date') || columnName.includes('time')) return 'Temporal';
    if (columnName.includes('amount') || columnName.includes('price') || columnName.includes('value')) return 'Measure';
    if (columnName.includes('email')) return 'Contact';
    if (columnName.includes('phone')) return 'Contact';

    // Check data patterns
    if (column.type === 'text') {
      const uniqueValues = [...new Set(column.values)];
      if (uniqueValues.length < column.values.length * 0.1) {
        return 'Category'; // Low cardinality suggests categories
      }
    }

    return null;
  }

  private mapBusinessMeaningToEntityType(businessMeaning: string): string {
    const meaning = businessMeaning.toLowerCase();
    if (meaning.includes('customer') || meaning.includes('client')) return 'Customer';
    if (meaning.includes('product')) return 'Product';
    if (meaning.includes('order') || meaning.includes('transaction')) return 'Transaction';
    if (meaning.includes('location')) return 'Location';
    if (meaning.includes('time') || meaning.includes('date')) return 'Temporal';
    if (meaning.includes('metric') || meaning.includes('kpi')) return 'Metric';
    return 'BusinessEntity';
  }

  private calculateEntityConfidence(column: ColumnInfo, value: any, enhancedContext?: EnhancedDataContext): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for columns with business context
    if (enhancedContext) {
      const columnContext = enhancedContext.columnContexts.find(c => c.name === column.name);
      if (columnContext?.businessMeaning) confidence += 0.2;
      if (columnContext?.isKPI) confidence += 0.1;
    }

    // Higher confidence for structured data
    if (typeof value === 'string' && value.length > 1) confidence += 0.1;
    if (typeof value === 'number') confidence += 0.1;

    // Lower confidence for very common values
    const occurrences = column.values.filter(v => v === value).length;
    const frequency = occurrences / column.values.length;
    if (frequency > 0.5) confidence -= 0.2; // Very common values are less interesting

    return Math.max(0, Math.min(1, confidence));
  }

  private async detectEntityRelationships(datasetId: string): Promise<void> {
    const entities = await this.graphDB.getNodesByLabel('Entity');
    
    // Simple co-occurrence based relationship detection
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];
        
        // Check if entities appear in the same rows
        const cooccurrence = this.calculateCooccurrence(entity1, entity2, datasetId);
        
        if (cooccurrence > 0.3) { // Threshold for relationship
          const relationshipId = `rel_${entity1.id}_${entity2.id}`;
          const relationship: GraphRelationship = {
            id: relationshipId,
            type: 'CO_OCCURS_WITH',
            startNodeId: entity1.id,
            endNodeId: entity2.id,
            properties: {
              strength: cooccurrence,
              type: 'statistical'
            }
          };
          await this.graphDB.addRelationship(relationship);
        }
      }
    }
  }

  private calculateCooccurrence(entity1: GraphNode, entity2: GraphNode, datasetId: string): number {
    // Simplified cooccurrence calculation
    // In a real implementation, this would analyze the actual data rows
    return Math.random() * 0.8; // Placeholder
  }

  async queryKnowledgeGraph(query: string): Promise<any> {
    // Convert natural language query to graph query
    const graphQuery = this.translateToGraphQuery(query);
    return await this.graphDB.queryGraph(graphQuery);
  }

  private translateToGraphQuery(naturalLanguageQuery: string): string {
    // Simple query translation - in production, use LangChain's query translation
    const query = naturalLanguageQuery.toLowerCase();
    
    if (query.includes('show') || query.includes('find')) {
      return 'MATCH (n) RETURN n LIMIT 10';
    }
    
    if (query.includes('relationship') || query.includes('connect')) {
      return 'MATCH (a)-[r]->(b) RETURN a, r, b LIMIT 10';
    }
    
    return 'MATCH (n) RETURN n LIMIT 5';
  }

  getGraphDB(): GraphDatabaseManager {
    return this.graphDB;
  }
}
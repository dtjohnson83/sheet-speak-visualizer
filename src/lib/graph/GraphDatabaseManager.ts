import { Driver, Session } from 'neo4j-driver';

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, any>;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export class GraphDatabaseManager {
  // In-memory graph storage for now (can be replaced with Neo4j later)
  private nodes: Map<string, GraphNode> = new Map();
  private relationships: Map<string, GraphRelationship> = new Map();
  private nodesByLabel: Map<string, Set<string>> = new Map();

  async addNode(node: GraphNode): Promise<void> {
    this.nodes.set(node.id, node);
    
    // Index by labels
    node.labels.forEach(label => {
      if (!this.nodesByLabel.has(label)) {
        this.nodesByLabel.set(label, new Set());
      }
      this.nodesByLabel.get(label)!.add(node.id);
    });

  }

  async addRelationship(relationship: GraphRelationship): Promise<void> {
    this.relationships.set(relationship.id, relationship);
  }

  async getNodesByLabel(label: string): Promise<GraphNode[]> {
    const nodeIds = this.nodesByLabel.get(label) || new Set();
    return Array.from(nodeIds)
      .map(id => this.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined);
  }

  async getConnectedNodes(nodeId: string, relationshipType?: string): Promise<GraphNode[]> {
    const connectedIds = new Set<string>();
    
    for (const rel of this.relationships.values()) {
      if (rel.startNodeId === nodeId || rel.endNodeId === nodeId) {
        if (!relationshipType || rel.type === relationshipType) {
          const connectedId = rel.startNodeId === nodeId ? rel.endNodeId : rel.startNodeId;
          connectedIds.add(connectedId);
        }
      }
    }

    return Array.from(connectedIds)
      .map(id => this.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined);
  }

  async findShortestPath(startNodeId: string, endNodeId: string): Promise<GraphNode[]> {
    // Simple BFS implementation
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: startNodeId, path: [startNodeId] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === endNodeId) {
        return path.map(id => this.nodes.get(id)).filter((node): node is GraphNode => node !== undefined);
      }

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const connected = await this.getConnectedNodes(nodeId);
      for (const connectedNode of connected) {
        if (!visited.has(connectedNode.id)) {
          queue.push({
            nodeId: connectedNode.id,
            path: [...path, connectedNode.id]
          });
        }
      }
    }

    return [];
  }

  async queryGraph(cypher: string, params?: Record<string, any>): Promise<GraphQueryResult> {
    // Simple pattern matching for basic queries
    // This is a simplified implementation - in production, use actual Cypher parser
    const nodes: GraphNode[] = [];
    const relationships: GraphRelationship[] = [];

    if (cypher.includes('MATCH (n)')) {
      nodes.push(...Array.from(this.nodes.values()));
    }

    if (cypher.includes('MATCH ()-[r]->()')) {
      relationships.push(...Array.from(this.relationships.values()));
    }

    return { nodes, relationships };
  }


  async clear(): Promise<void> {
    this.nodes.clear();
    this.relationships.clear();
    this.nodesByLabel.clear();
  }
}
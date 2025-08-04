import { Driver, Session } from 'neo4j-driver';
import { Matrix } from 'ml-matrix';

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
  embedding?: number[];
  mlFeatures?: Record<string, number>;
  centrality?: {
    degree: number;
    betweenness: number;
    closeness: number;
    pagerank: number;
  };
}

export interface GraphRelationship {
  id: string;
  type: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, any>;
  weight?: number;
  confidence?: number;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface CommunityDetectionResult {
  communities: string[][];
  modularity: number;
  nodeToCompany: Map<string, number>;
}

export interface AnomalyDetectionResult {
  anomalousNodes: string[];
  anomalousEdges: string[];
  scores: Record<string, number>;
}

export interface GraphMLMetrics {
  clustering: number;
  density: number;
  averagePathLength: number;
  diameter: number;
  assortativity: number;
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


  // === GRAPH ML METHODS ===

  async calculateCentralityMetrics(): Promise<void> {
    const nodes = Array.from(this.nodes.values());
    const relationships = Array.from(this.relationships.values());
    
    for (const node of nodes) {
      const centrality = this.calculateNodeCentrality(node.id, nodes, relationships);
      node.centrality = centrality;
      this.nodes.set(node.id, node);
    }
  }

  private calculateNodeCentrality(nodeId: string, nodes: GraphNode[], relationships: GraphRelationship[]) {
    // Degree centrality
    const degree = relationships.filter(r => 
      r.startNodeId === nodeId || r.endNodeId === nodeId
    ).length;

    // Simple betweenness centrality approximation
    let betweenness = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].id !== nodeId && nodes[j].id !== nodeId) {
          const pathsThrough = this.countPathsThrough(nodes[i].id, nodes[j].id, nodeId);
          betweenness += pathsThrough;
        }
      }
    }

    // Closeness centrality (simplified)
    const distances = nodes.map(n => this.shortestPathLength(nodeId, n.id)).filter(d => d > 0);
    const closeness = distances.length > 0 ? 1 / (distances.reduce((a, b) => a + b, 0) / distances.length) : 0;

    // PageRank (simplified)
    const pagerank = this.calculatePageRank(nodeId);

    return { degree, betweenness, closeness, pagerank };
  }

  private countPathsThrough(startId: string, endId: string, throughId: string): number {
    // Simplified implementation - in production use proper shortest path algorithms
    return 0;
  }

  private shortestPathLength(startId: string, endId: string): number {
    if (startId === endId) return 0;
    
    const visited = new Set<string>();
    const queue: { nodeId: string; distance: number }[] = [{ nodeId: startId, distance: 0 }];

    while (queue.length > 0) {
      const { nodeId, distance } = queue.shift()!;
      
      if (nodeId === endId) return distance;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const connected = Array.from(this.relationships.values())
        .filter(r => r.startNodeId === nodeId || r.endNodeId === nodeId)
        .map(r => r.startNodeId === nodeId ? r.endNodeId : r.startNodeId);

      for (const connectedId of connected) {
        if (!visited.has(connectedId)) {
          queue.push({ nodeId: connectedId, distance: distance + 1 });
        }
      }
    }

    return Infinity;
  }

  private calculatePageRank(nodeId: string): number {
    // Simplified PageRank calculation
    const damping = 0.85;
    const nodes = Array.from(this.nodes.keys());
    const incomingEdges = Array.from(this.relationships.values()).filter(r => r.endNodeId === nodeId);
    
    let pagerank = (1 - damping) / nodes.length;
    for (const edge of incomingEdges) {
      const sourceOutDegree = Array.from(this.relationships.values()).filter(r => r.startNodeId === edge.startNodeId).length;
      if (sourceOutDegree > 0) {
        pagerank += damping / sourceOutDegree;
      }
    }
    
    return pagerank;
  }

  async detectCommunities(): Promise<CommunityDetectionResult> {
    const nodes = Array.from(this.nodes.values());
    const relationships = Array.from(this.relationships.values());
    
    // Simple Louvain-inspired community detection
    const communities: string[][] = [];
    const nodeToCompany = new Map<string, number>();
    const visited = new Set<string>();

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        const community = this.expandCommunity(node.id, visited);
        communities.push(community);
        community.forEach((nodeId, index) => {
          nodeToCompany.set(nodeId, communities.length - 1);
        });
      }
    }

    const modularity = this.calculateModularity(communities, relationships);
    
    return { communities, modularity, nodeToCompany };
  }

  private expandCommunity(startNodeId: string, visited: Set<string>): string[] {
    const community: string[] = [];
    const queue: string[] = [startNodeId];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      
      visited.add(nodeId);
      community.push(nodeId);
      
      // Add strongly connected neighbors
      const neighbors = Array.from(this.relationships.values())
        .filter(r => (r.startNodeId === nodeId || r.endNodeId === nodeId) && (r.weight || 1) > 0.5)
        .map(r => r.startNodeId === nodeId ? r.endNodeId : r.startNodeId)
        .filter(id => !visited.has(id));
      
      queue.push(...neighbors.slice(0, 3)); // Limit expansion to avoid massive communities
    }
    
    return community;
  }

  private calculateModularity(communities: string[][], relationships: GraphRelationship[]): number {
    const totalEdges = relationships.length;
    if (totalEdges === 0) return 0;

    let modularity = 0;
    const communityMap = new Map<string, number>();
    
    communities.forEach((community, index) => {
      community.forEach(nodeId => communityMap.set(nodeId, index));
    });

    for (const rel of relationships) {
      const startCommunity = communityMap.get(rel.startNodeId);
      const endCommunity = communityMap.get(rel.endNodeId);
      
      if (startCommunity === endCommunity) {
        modularity += 1;
      }
    }

    return modularity / totalEdges;
  }

  async detectAnomalies(): Promise<AnomalyDetectionResult> {
    await this.calculateCentralityMetrics();
    
    const nodes = Array.from(this.nodes.values());
    const relationships = Array.from(this.relationships.values());
    
    const anomalousNodes: string[] = [];
    const anomalousEdges: string[] = [];
    const scores: Record<string, number> = {};

    // Detect anomalous nodes based on centrality
    const centralityScores = nodes.map(n => n.centrality?.degree || 0);
    const meanCentrality = centralityScores.reduce((a, b) => a + b, 0) / centralityScores.length;
    const stdCentrality = Math.sqrt(
      centralityScores.reduce((a, b) => a + Math.pow(b - meanCentrality, 2), 0) / centralityScores.length
    );

    for (const node of nodes) {
      const centrality = node.centrality?.degree || 0;
      const zScore = Math.abs((centrality - meanCentrality) / stdCentrality);
      scores[node.id] = zScore;
      
      if (zScore > 2.5) { // More than 2.5 standard deviations
        anomalousNodes.push(node.id);
      }
    }

    // Detect anomalous edges based on weight distribution
    const weights = relationships.map(r => r.weight || 1);
    const meanWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const stdWeight = Math.sqrt(
      weights.reduce((a, b) => a + Math.pow(b - meanWeight, 2), 0) / weights.length
    );

    for (const rel of relationships) {
      const weight = rel.weight || 1;
      const zScore = Math.abs((weight - meanWeight) / stdWeight);
      
      if (zScore > 2.5) {
        anomalousEdges.push(rel.id);
      }
    }

    return { anomalousNodes, anomalousEdges, scores };
  }

  async generateNodeEmbeddings(dimensions: number = 128): Promise<void> {
    const nodes = Array.from(this.nodes.values());
    const relationships = Array.from(this.relationships.values());
    
    // Create adjacency matrix
    const nodeIds = nodes.map(n => n.id);
    const nodeIndexMap = new Map(nodeIds.map((id, index) => [id, index]));
    
    const adjacencyMatrix = new Matrix(nodes.length, nodes.length);
    
    for (const rel of relationships) {
      const startIndex = nodeIndexMap.get(rel.startNodeId);
      const endIndex = nodeIndexMap.get(rel.endNodeId);
      
      if (startIndex !== undefined && endIndex !== undefined) {
        const weight = rel.weight || 1;
        adjacencyMatrix.set(startIndex, endIndex, weight);
        adjacencyMatrix.set(endIndex, startIndex, weight); // Undirected graph
      }
    }

    // Simple random walk-based embedding (simplified Node2Vec approach)
    for (let i = 0; i < nodes.length; i++) {
      const embedding = this.generateRandomWalkEmbedding(i, adjacencyMatrix, dimensions);
      nodes[i].embedding = embedding;
      this.nodes.set(nodes[i].id, nodes[i]);
    }
  }

  private generateRandomWalkEmbedding(nodeIndex: number, adjacencyMatrix: Matrix, dimensions: number): number[] {
    const embedding = new Array(dimensions).fill(0);
    const walkLength = 10;
    const numWalks = 5;
    
    for (let walk = 0; walk < numWalks; walk++) {
      let currentIndex = nodeIndex;
      
      for (let step = 0; step < walkLength; step++) {
        const neighbors = [];
        for (let j = 0; j < adjacencyMatrix.columns; j++) {
          if (adjacencyMatrix.get(currentIndex, j) > 0) {
            neighbors.push(j);
          }
        }
        
        if (neighbors.length === 0) break;
        
        currentIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Update embedding based on visited node
        for (let d = 0; d < dimensions; d++) {
          embedding[d] += Math.sin((currentIndex + d) * 0.1) / numWalks;
        }
      }
    }
    
    // Normalize embedding
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? embedding.map(val => val / norm) : embedding;
  }

  async calculateGraphMetrics(): Promise<GraphMLMetrics> {
    const nodes = Array.from(this.nodes.values());
    const relationships = Array.from(this.relationships.values());
    
    // Clustering coefficient
    let clustering = 0;
    for (const node of nodes) {
      clustering += this.calculateNodeClustering(node.id);
    }
    clustering /= nodes.length;

    // Density
    const maxPossibleEdges = (nodes.length * (nodes.length - 1)) / 2;
    const density = maxPossibleEdges > 0 ? relationships.length / maxPossibleEdges : 0;

    // Average path length
    let totalPathLength = 0;
    let pathCount = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const pathLength = this.shortestPathLength(nodes[i].id, nodes[j].id);
        if (pathLength !== Infinity) {
          totalPathLength += pathLength;
          pathCount++;
        }
      }
    }
    const averagePathLength = pathCount > 0 ? totalPathLength / pathCount : 0;

    // Diameter (longest shortest path)
    let diameter = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const pathLength = this.shortestPathLength(nodes[i].id, nodes[j].id);
        if (pathLength !== Infinity && pathLength > diameter) {
          diameter = pathLength;
        }
      }
    }

    // Assortativity (simplified)
    const assortativity = this.calculateAssortativity();

    return { clustering, density, averagePathLength, diameter, assortativity };
  }

  private calculateNodeClustering(nodeId: string): number {
    const neighbors = Array.from(this.relationships.values())
      .filter(r => r.startNodeId === nodeId || r.endNodeId === nodeId)
      .map(r => r.startNodeId === nodeId ? r.endNodeId : r.startNodeId);
    
    if (neighbors.length < 2) return 0;
    
    let triangles = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const hasEdge = Array.from(this.relationships.values()).some(r => 
          (r.startNodeId === neighbors[i] && r.endNodeId === neighbors[j]) ||
          (r.startNodeId === neighbors[j] && r.endNodeId === neighbors[i])
        );
        if (hasEdge) triangles++;
      }
    }
    
    const possibleTriangles = (neighbors.length * (neighbors.length - 1)) / 2;
    return possibleTriangles > 0 ? triangles / possibleTriangles : 0;
  }

  private calculateAssortativity(): number {
    // Simplified assortativity calculation based on degree
    const relationships = Array.from(this.relationships.values());
    if (relationships.length === 0) return 0;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    for (const rel of relationships) {
      const startDegree = Array.from(this.relationships.values()).filter(r => 
        r.startNodeId === rel.startNodeId || r.endNodeId === rel.startNodeId
      ).length;
      
      const endDegree = Array.from(this.relationships.values()).filter(r => 
        r.startNodeId === rel.endNodeId || r.endNodeId === rel.endNodeId
      ).length;
      
      numerator += startDegree * endDegree;
      denominator1 += startDegree + endDegree;
      denominator2 += startDegree * startDegree + endDegree * endDegree;
    }
    
    const m = relationships.length;
    if (m === 0) return 0;
    
    numerator /= m;
    denominator1 /= (2 * m);
    denominator2 /= (2 * m);
    
    return denominator2 > denominator1 * denominator1 ? 
      (numerator - denominator1 * denominator1) / (denominator2 - denominator1 * denominator1) : 0;
  }

  async clear(): Promise<void> {
    this.nodes.clear();
    this.relationships.clear();
    this.nodesByLabel.clear();
  }
}
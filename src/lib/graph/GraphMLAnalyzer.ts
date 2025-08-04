import { GraphDatabaseManager, GraphNode, GraphRelationship, CommunityDetectionResult, AnomalyDetectionResult, GraphMLMetrics } from './GraphDatabaseManager';
import { KnowledgeGraphBuilder } from './KnowledgeGraphBuilder';
import { DataRow, ColumnInfo } from '@/pages/Index';
import * as tf from '@tensorflow/tfjs';

export interface GraphMLInsight {
  id: string;
  type: 'anomaly' | 'community' | 'prediction' | 'pattern' | 'embedding';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  nodeIds?: string[];
  relationshipIds?: string[];
  metrics?: Record<string, number>;
  recommendations?: string[];
  timestamp: Date;
}

export interface NodeClassificationResult {
  nodeId: string;
  predictedClass: string;
  confidence: number;
  features: number[];
}

export interface LinkPredictionResult {
  sourceNodeId: string;
  targetNodeId: string;
  probability: number;
  features: number[];
}

export interface GraphEmbeddingResult {
  graphEmbedding: number[];
  nodeEmbeddings: Map<string, number[]>;
  similarity: number;
}

export class GraphMLAnalyzer {
  private graphDB: GraphDatabaseManager;
  private knowledgeBuilder: KnowledgeGraphBuilder;
  private tfModel?: tf.LayersModel;

  constructor() {
    this.graphDB = new GraphDatabaseManager();
    this.knowledgeBuilder = new KnowledgeGraphBuilder();
  }

  // === CORE ML ANALYSIS ===

  async analyzeDatasetWithML(
    data: DataRow[],
    columns: ColumnInfo[],
    datasetId: string
  ): Promise<GraphMLInsight[]> {
    const insights: GraphMLInsight[] = [];

    try {
      // Build knowledge graph first
      await this.knowledgeBuilder.buildFromDataset(data, columns, datasetId);
      this.graphDB = this.knowledgeBuilder.getGraphDB();

      // Generate embeddings
      await this.graphDB.generateNodeEmbeddings();
      insights.push(...await this.generateEmbeddingInsights());

      // Calculate centrality metrics
      await this.graphDB.calculateCentralityMetrics();
      insights.push(...await this.generateCentralityInsights());

      // Detect communities
      const communities = await this.graphDB.detectCommunities();
      insights.push(...await this.generateCommunityInsights(communities));

      // Detect anomalies
      const anomalies = await this.graphDB.detectAnomalies();
      insights.push(...await this.generateAnomalyInsights(anomalies));

      // Calculate graph metrics
      const metrics = await this.graphDB.calculateGraphMetrics();
      insights.push(...await this.generateMetricInsights(metrics));

      // Perform node classification
      insights.push(...await this.performNodeClassification());

      // Predict missing links
      insights.push(...await this.predictMissingLinks());

    } catch (error) {
      console.error('Error in GraphML analysis:', error);
      insights.push({
        id: `error-${Date.now()}`,
        type: 'anomaly',
        title: 'Analysis Error',
        description: `Error during GraphML analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 1.0,
        severity: 'high',
        timestamp: new Date()
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  // === EMBEDDING ANALYSIS ===

  private async generateEmbeddingInsights(): Promise<GraphMLInsight[]> {
    const insights: GraphMLInsight[] = [];
    const nodes = Array.from((await this.graphDB.queryGraph('MATCH (n) RETURN n')).nodes);
    
    const embeddedNodes = nodes.filter(n => n.embedding && n.embedding.length > 0);
    
    if (embeddedNodes.length > 1) {
      // Find similar nodes based on embedding distance
      const similarities = this.calculateEmbeddingSimilarities(embeddedNodes);
      
      insights.push({
        id: `embedding-similarity-${Date.now()}`,
        type: 'embedding',
        title: 'Node Similarity Analysis',
        description: `Identified ${similarities.length} highly similar entity pairs based on graph embeddings`,
        confidence: 0.85,
        severity: 'medium',
        nodeIds: similarities.flatMap(s => [s.node1, s.node2]),
        metrics: {
          averageSimilarity: similarities.reduce((sum, s) => sum + s.similarity, 0) / similarities.length,
          totalPairs: similarities.length
        },
        recommendations: [
          'Review similar entities for potential data deduplication',
          'Consider grouping similar entities for analysis',
          'Investigate why certain entities have high similarity'
        ],
        timestamp: new Date()
      });
    }

    return insights;
  }

  private calculateEmbeddingSimilarities(nodes: GraphNode[]): Array<{node1: string, node2: string, similarity: number}> {
    const similarities: Array<{node1: string, node2: string, similarity: number}> = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sim = this.cosineSimilarity(nodes[i].embedding!, nodes[j].embedding!);
        if (sim > 0.8) { // High similarity threshold
          similarities.push({
            node1: nodes[i].id,
            node2: nodes[j].id,
            similarity: sim
          });
        }
      }
    }
    
    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // === CENTRALITY INSIGHTS ===

  private async generateCentralityInsights(): Promise<GraphMLInsight[]> {
    const insights: GraphMLInsight[] = [];
    const nodes = Array.from((await this.graphDB.queryGraph('MATCH (n) RETURN n')).nodes);
    
    const centralNodes = nodes
      .filter(n => n.centrality)
      .sort((a, b) => (b.centrality!.pagerank) - (a.centrality!.pagerank))
      .slice(0, 5);

    if (centralNodes.length > 0) {
      insights.push({
        id: `centrality-${Date.now()}`,
        type: 'pattern',
        title: 'Key Entities Identified',
        description: `Found ${centralNodes.length} highly central entities that may be critical to your data relationships`,
        confidence: 0.9,
        severity: 'high',
        nodeIds: centralNodes.map(n => n.id),
        metrics: {
          averagePageRank: centralNodes.reduce((sum, n) => sum + (n.centrality!.pagerank || 0), 0) / centralNodes.length,
          topPageRank: centralNodes[0].centrality!.pagerank || 0
        },
        recommendations: [
          'Focus analysis on these central entities',
          'Consider these entities as key business drivers',
          'Monitor changes in these critical nodes'
        ],
        timestamp: new Date()
      });
    }

    return insights;
  }

  // === COMMUNITY INSIGHTS ===

  private async generateCommunityInsights(communities: CommunityDetectionResult): Promise<GraphMLInsight[]> {
    const insights: GraphMLInsight[] = [];
    
    if (communities.communities.length > 1) {
      insights.push({
        id: `community-${Date.now()}`,
        type: 'community',
        title: 'Data Communities Detected',
        description: `Discovered ${communities.communities.length} distinct clusters in your data with modularity score of ${communities.modularity.toFixed(3)}`,
        confidence: communities.modularity > 0.3 ? 0.9 : 0.6,
        severity: communities.modularity > 0.5 ? 'high' : 'medium',
        metrics: {
          numCommunities: communities.communities.length,
          modularity: communities.modularity,
          largestCommunity: Math.max(...communities.communities.map(c => c.length)),
          averageCommunitySize: communities.communities.reduce((sum, c) => sum + c.length, 0) / communities.communities.length
        },
        recommendations: [
          'Analyze each community separately for targeted insights',
          'Consider community structure in your data modeling',
          'Investigate cross-community relationships'
        ],
        timestamp: new Date()
      });
    }

    return insights;
  }

  // === ANOMALY INSIGHTS ===

  private async generateAnomalyInsights(anomalies: AnomalyDetectionResult): Promise<GraphMLInsight[]> {
    const insights: GraphMLInsight[] = [];
    
    if (anomalies.anomalousNodes.length > 0 || anomalies.anomalousEdges.length > 0) {
      insights.push({
        id: `anomaly-${Date.now()}`,
        type: 'anomaly',
        title: 'Anomalies Detected',
        description: `Found ${anomalies.anomalousNodes.length} anomalous entities and ${anomalies.anomalousEdges.length} unusual relationships`,
        confidence: 0.8,
        severity: 'high',
        nodeIds: anomalies.anomalousNodes,
        relationshipIds: anomalies.anomalousEdges,
        metrics: {
          anomalousNodes: anomalies.anomalousNodes.length,
          anomalousEdges: anomalies.anomalousEdges.length,
          maxAnomalyScore: Math.max(...Object.values(anomalies.scores))
        },
        recommendations: [
          'Investigate anomalous entities for data quality issues',
          'Consider outliers for special business cases',
          'Review unusual patterns for insights or errors'
        ],
        timestamp: new Date()
      });
    }

    return insights;
  }

  // === METRIC INSIGHTS ===

  private async generateMetricInsights(metrics: GraphMLMetrics): Promise<GraphMLInsight[]> {
    const insights: GraphMLInsight[] = [];
    
    // Analyze clustering coefficient
    if (metrics.clustering > 0.6) {
      insights.push({
        id: `clustering-${Date.now()}`,
        type: 'pattern',
        title: 'High Clustering Detected',
        description: `Your data shows high clustering (${(metrics.clustering * 100).toFixed(1)}%), indicating strong local connectivity`,
        confidence: 0.85,
        severity: 'medium',
        metrics: {
          clustering: metrics.clustering,
          density: metrics.density,
          averagePathLength: metrics.averagePathLength
        },
        recommendations: [
          'Leverage local clusters for targeted analysis',
          'Consider community-based approaches',
          'Investigate cluster boundaries for insights'
        ],
        timestamp: new Date()
      });
    }

    // Analyze graph density
    if (metrics.density < 0.1) {
      insights.push({
        id: `sparsity-${Date.now()}`,
        type: 'pattern',
        title: 'Sparse Graph Structure',
        description: `Your data graph is sparse (${(metrics.density * 100).toFixed(2)}% density), suggesting specialized relationships`,
        confidence: 0.8,
        severity: 'low',
        metrics: {
          density: metrics.density,
          diameter: metrics.diameter
        },
        recommendations: [
          'Focus on connected components for analysis',
          'Consider adding derived relationships',
          'Look for hub nodes connecting sparse regions'
        ],
        timestamp: new Date()
      });
    }

    return insights;
  }

  // === NODE CLASSIFICATION ===

  private async performNodeClassification(): Promise<GraphMLInsight[]> {
    const insights: GraphMLInsight[] = [];
    const nodes = Array.from((await this.graphDB.queryGraph('MATCH (n) RETURN n')).nodes);
    
    try {
      const classifications = await this.classifyNodes(nodes);
      
      if (classifications.length > 0) {
        const highConfidenceClassifications = classifications.filter(c => c.confidence > 0.8);
        
        insights.push({
          id: `classification-${Date.now()}`,
          type: 'prediction',
          title: 'Entity Classification Results',
          description: `Classified ${classifications.length} entities with ${highConfidenceClassifications.length} high-confidence predictions`,
          confidence: 0.85,
          severity: 'medium',
          nodeIds: highConfidenceClassifications.map(c => c.nodeId),
          metrics: {
            totalClassified: classifications.length,
            highConfidence: highConfidenceClassifications.length,
            averageConfidence: classifications.reduce((sum, c) => sum + c.confidence, 0) / classifications.length
          },
          recommendations: [
            'Review high-confidence classifications for insights',
            'Use classifications for data organization',
            'Validate predictions with domain knowledge'
          ],
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.warn('Node classification failed:', error);
    }

    return insights;
  }

  private async classifyNodes(nodes: GraphNode[]): Promise<NodeClassificationResult[]> {
    const classifications: NodeClassificationResult[] = [];
    
    for (const node of nodes) {
      if (node.embedding && node.centrality) {
        // Simple rule-based classification based on centrality and labels
        let predictedClass = 'entity';
        let confidence = 0.6;
        
        const pagerank = node.centrality.pagerank || 0;
        const degree = node.centrality.degree || 0;
        
        if (pagerank > 0.1 && degree > 5) {
          predictedClass = 'hub';
          confidence = 0.9;
        } else if (node.labels.includes('Person')) {
          predictedClass = 'person';
          confidence = 0.8;
        } else if (node.labels.includes('Organization')) {
          predictedClass = 'organization';
          confidence = 0.8;
        } else if (degree === 1) {
          predictedClass = 'leaf';
          confidence = 0.7;
        }
        
        classifications.push({
          nodeId: node.id,
          predictedClass,
          confidence,
          features: node.embedding
        });
      }
    }
    
    return classifications;
  }

  // === LINK PREDICTION ===

  private async predictMissingLinks(): Promise<GraphMLInsight[]> {
    const insights: GraphMLInsight[] = [];
    const nodes = Array.from((await this.graphDB.queryGraph('MATCH (n) RETURN n')).nodes);
    
    try {
      const predictions = await this.predictLinks(nodes);
      
      if (predictions.length > 0) {
        const highProbabilityLinks = predictions.filter(p => p.probability > 0.7);
        
        insights.push({
          id: `link-prediction-${Date.now()}`,
          type: 'prediction',
          title: 'Missing Relationship Predictions',
          description: `Predicted ${predictions.length} potential relationships with ${highProbabilityLinks.length} high-probability connections`,
          confidence: 0.75,
          severity: 'medium',
          nodeIds: highProbabilityLinks.flatMap(p => [p.sourceNodeId, p.targetNodeId]),
          metrics: {
            totalPredictions: predictions.length,
            highProbability: highProbabilityLinks.length,
            averageProbability: predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length
          },
          recommendations: [
            'Investigate high-probability missing links',
            'Consider if predicted relationships make business sense',
            'Use predictions to enrich your data model'
          ],
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.warn('Link prediction failed:', error);
    }

    return insights;
  }

  private async predictLinks(nodes: GraphNode[]): Promise<LinkPredictionResult[]> {
    const predictions: LinkPredictionResult[] = [];
    const relationships = Array.from((await this.graphDB.queryGraph('MATCH ()-[r]->() RETURN r')).relationships);
    
    // Create set of existing relationships for quick lookup
    const existingLinks = new Set(
      relationships.map(r => `${r.startNodeId}-${r.endNodeId}`)
    );
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Skip if relationship already exists
        if (existingLinks.has(`${node1.id}-${node2.id}`) || 
            existingLinks.has(`${node2.id}-${node1.id}`)) {
          continue;
        }
        
        // Calculate probability based on common neighbors and embedding similarity
        const probability = this.calculateLinkProbability(node1, node2, nodes, relationships);
        
        if (probability > 0.5) {
          predictions.push({
            sourceNodeId: node1.id,
            targetNodeId: node2.id,
            probability,
            features: node1.embedding && node2.embedding ? 
              [...node1.embedding, ...node2.embedding] : []
          });
        }
      }
    }
    
    return predictions.sort((a, b) => b.probability - a.probability).slice(0, 20);
  }

  private calculateLinkProbability(
    node1: GraphNode, 
    node2: GraphNode, 
    allNodes: GraphNode[], 
    relationships: GraphRelationship[]
  ): number {
    let probability = 0;
    
    // Common neighbors score
    const node1Neighbors = relationships
      .filter(r => r.startNodeId === node1.id || r.endNodeId === node1.id)
      .map(r => r.startNodeId === node1.id ? r.endNodeId : r.startNodeId);
    
    const node2Neighbors = relationships
      .filter(r => r.startNodeId === node2.id || r.endNodeId === node2.id)
      .map(r => r.startNodeId === node2.id ? r.endNodeId : r.startNodeId);
    
    const commonNeighbors = node1Neighbors.filter(n => node2Neighbors.includes(n));
    probability += commonNeighbors.length * 0.2;
    
    // Embedding similarity score
    if (node1.embedding && node2.embedding) {
      const similarity = this.cosineSimilarity(node1.embedding, node2.embedding);
      probability += similarity * 0.5;
    }
    
    // Label similarity score
    const commonLabels = node1.labels.filter(l => node2.labels.includes(l));
    probability += commonLabels.length * 0.1;
    
    return Math.min(probability, 1.0);
  }

  // === UTILITY METHODS ===

  getGraphDB(): GraphDatabaseManager {
    return this.graphDB;
  }

  async clearGraph(): Promise<void> {
    await this.graphDB.clear();
  }
}
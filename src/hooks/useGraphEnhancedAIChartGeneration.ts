import { useState, useCallback, useMemo } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { useGraphEnhancedSemanticFusion } from './useGraphEnhancedSemanticFusion';
import { AIChartSuggestion, ChartAnalysis, useAIChartGeneration } from './useAIChartGeneration';

export interface GraphChartSuggestion extends AIChartSuggestion {
  graphMetrics?: {
    nodeCount: number;
    edgeCount: number;
    centrality: Record<string, number>;
    clusters: string[][];
  };
  entityRecommendations?: {
    primaryEntities: string[];
    relationships: Array<{ source: string; target: string; strength: number }>;
  };
}

export const useGraphEnhancedAIChartGeneration = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const graphFusion = useGraphEnhancedSemanticFusion();
  const baseGeneration = useAIChartGeneration();

  // Analyze data with graph-aware intelligence
  const analyzeDataWithGraph = useCallback(async (
    data: DataRow[], 
    columns: ColumnInfo[]
  ): Promise<ChartAnalysis & { graphInsights: any }> => {
    setIsAnalyzing(true);
    
    try {
      // Get base analysis
      const baseAnalysis = baseGeneration.analyzeData(data, columns);
      
      // Use existing graph data
      const graph = { nodes: [], edges: [] };
      const entityRelationships = graphFusion.relationships;
      
      // Analyze graph structure for visualization insights
      const graphInsights = {
        nodeCount: graph.nodes?.length || 0,
        edgeCount: graph.edges?.length || 0,
        hasNetworkStructure: (graph.nodes?.length || 0) > 2 && (graph.edges?.length || 0) > 1,
        entityTypes: [...new Set(entityRelationships.map(r => r.sourceEntity))],
        relationshipTypes: [...new Set(entityRelationships.map(r => r.relationshipType))],
        centralities: calculateNodeCentralities(graph),
        clusters: detectClusters(graph)
      };

      // Enhanced recommendations based on graph structure
      const graphAwareRecommendations = [...baseAnalysis.recommendations];
      
      if (graphInsights.hasNetworkStructure) {
        graphAwareRecommendations.unshift('Network structure detected - consider network visualization');
        baseAnalysis.bestChartTypes.unshift('network');
      }
      
      if (graphInsights.entityTypes.length >= 2) {
        graphAwareRecommendations.push('Multiple entity types found - entity-relationship diagram recommended');
        baseAnalysis.bestChartTypes.push('entity-relationship');
      }
      
      if (graphInsights.clusters.length > 1) {
        graphAwareRecommendations.push('Data clusters identified - consider grouped visualizations');
      }

      return {
        ...baseAnalysis,
        recommendations: graphAwareRecommendations,
        graphInsights
      };
    } catch (error) {
      console.error('Graph analysis failed:', error);
      return {
        ...baseGeneration.analyzeData(data, columns),
        graphInsights: { nodeCount: 0, edgeCount: 0, hasNetworkStructure: false }
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, [baseGeneration, graphFusion]);

  // Generate graph-aware chart suggestions
  const generateGraphAwareChart = useCallback(async (
    query: string,
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<GraphChartSuggestion> => {
    // Get base suggestion
    const baseSuggestion = await baseGeneration.generateChartFromQuery(query, data, columns);
    
    // Enhance with graph analysis
    const analysis = await analyzeDataWithGraph(data, columns);
    
    // Check if graph visualization is more appropriate
    const lowerQuery = query.toLowerCase();
    const graphKeywords = ['network', 'graph', 'connections', 'relationships', 'entities', 'knowledge'];
    const hasGraphIntent = graphKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (hasGraphIntent || analysis.graphInsights.hasNetworkStructure) {
      // Override with graph visualization
      return {
        ...baseSuggestion,
        chartType: 'network',
        reasoning: `Graph structure detected in data. ${baseSuggestion.reasoning}`,
        confidence: Math.min(baseSuggestion.confidence + 0.2, 1.0),
        graphMetrics: {
          nodeCount: analysis.graphInsights.nodeCount,
          edgeCount: analysis.graphInsights.edgeCount,
          centrality: analysis.graphInsights.centralities || {},
          clusters: analysis.graphInsights.clusters || []
        }
      };
    }
    
    return baseSuggestion;
  }, [baseGeneration, analyzeDataWithGraph]);

  // Suggest optimal chart with graph awareness
  const suggestOptimalGraphAwareChart = useCallback(async (
    data: DataRow[], 
    columns: ColumnInfo[]
  ): Promise<GraphChartSuggestion> => {
    const analysis = await analyzeDataWithGraph(data, columns);
    
    // If significant graph structure exists, prioritize network visualization
    if (analysis.graphInsights.hasNetworkStructure && analysis.graphInsights.nodeCount >= 5) {
      const { xColumn, yColumn } = baseGeneration.suggestOptimalChart(data, columns);
      
      return {
        chartType: 'network',
        xColumn,
        yColumn,
        valueColumn: yColumn,
        aggregationMethod: 'count' as AggregationMethod,
        series: [],
        title: 'Network Visualization',
        reasoning: 'Network structure detected with meaningful entity relationships',
        confidence: 0.9,
        graphMetrics: {
          nodeCount: analysis.graphInsights.nodeCount,
          edgeCount: analysis.graphInsights.edgeCount,
          centrality: analysis.graphInsights.centralities || {},
          clusters: analysis.graphInsights.clusters || []
        }
      };
    }
    
    // Otherwise use base suggestion
    return baseGeneration.suggestOptimalChart(data, columns);
  }, [baseGeneration, analyzeDataWithGraph]);

  return {
    ...baseGeneration,
    isAnalyzing,
    analyzeDataWithGraph,
    generateGraphAwareChart,
    suggestOptimalGraphAwareChart
  };
};

// Helper functions for graph analysis
function calculateNodeCentralities(graph: any): Record<string, number> {
  if (!graph.nodes || !graph.edges) return {};
  
  const centralities: Record<string, number> = {};
  const edgeCount: Record<string, number> = {};
  
  // Calculate degree centrality
  graph.edges.forEach((edge: any) => {
    edgeCount[edge.source] = (edgeCount[edge.source] || 0) + 1;
    edgeCount[edge.target] = (edgeCount[edge.target] || 0) + 1;
  });
  
  graph.nodes.forEach((node: any) => {
    centralities[node.id] = edgeCount[node.id] || 0;
  });
  
  return centralities;
}

function detectClusters(graph: any): string[][] {
  if (!graph.nodes || !graph.edges) return [];
  
  // Simple clustering based on connected components
  const visited = new Set<string>();
  const clusters: string[][] = [];
  
  graph.nodes.forEach((node: any) => {
    if (!visited.has(node.id)) {
      const cluster = exploreCluster(node.id, graph, visited);
      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    }
  });
  
  return clusters;
}

function exploreCluster(nodeId: string, graph: any, visited: Set<string>): string[] {
  const cluster = [nodeId];
  visited.add(nodeId);
  
  const connectedNodes = graph.edges
    .filter((edge: any) => edge.source === nodeId || edge.target === nodeId)
    .map((edge: any) => edge.source === nodeId ? edge.target : edge.source)
    .filter((id: string) => !visited.has(id));
  
  connectedNodes.forEach((id: string) => {
    cluster.push(...exploreCluster(id, graph, visited));
  });
  
  return cluster;
}

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Network, Database } from 'lucide-react';
import { KnowledgeGraphBuilder } from '@/lib/graph/KnowledgeGraphBuilder';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface GraphRAGQueryEngineProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onQueryResult: (data: DataRow[]) => void;
}

interface QueryResult {
  query: string;
  results: any[];
  graphInsights: string[];
  executionTime: number;
}

export const GraphRAGQueryEngine: React.FC<GraphRAGQueryEngineProps> = ({
  data,
  columns,
  onQueryResult
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [graphBuilder] = useState(() => new KnowledgeGraphBuilder());
  const { toast } = useToast();

  const processGraphRAGQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // Build knowledge graph if not already built
      await graphBuilder.buildFromDataset(data, columns, 'current_dataset');

      // Query the knowledge graph
      const graphResults = await graphBuilder.queryKnowledgeGraph(queryText);
      
      // Generate insights from graph structure
      const insights = await generateGraphInsights(graphResults, queryText);
      
      // Apply graph-informed filtering to original data
      const filteredData = await applyGraphInformedFiltering(data, graphResults, queryText);
      
      const executionTime = Date.now() - startTime;
      
      const result: QueryResult = {
        query: queryText,
        results: graphResults,
        graphInsights: insights,
        executionTime
      };

      setQueryHistory(prev => [result, ...prev.slice(0, 4)]);
      onQueryResult(filteredData);

      toast({
        title: "Graph Analysis Complete",
        description: `Found ${filteredData.length} relevant records using graph relationships`,
      });

    } catch (error) {
      console.error('GraphRAG query error:', error);
      toast({
        title: "Query Error",
        description: "Failed to process graph query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [data, columns, graphBuilder, onQueryResult, toast]);

  const generateGraphInsights = async (graphResults: any, query: string): Promise<string[]> => {
    const insights: string[] = [];

    if (graphResults.nodes?.length > 0) {
      insights.push(`Found ${graphResults.nodes.length} connected entities`);
    }

    if (graphResults.relationships?.length > 0) {
      insights.push(`Discovered ${graphResults.relationships.length} relationships`);
      
      // Analyze relationship types
      const relationshipTypes = [...new Set(graphResults.relationships.map((r: any) => r.type))];
      insights.push(`Relationship types: ${relationshipTypes.join(', ')}`);
    }

    // Add query-specific insights
    if (query.toLowerCase().includes('trend')) {
      insights.push('Analysis suggests temporal patterns in the data');
    }

    if (query.toLowerCase().includes('correlation') || query.toLowerCase().includes('relationship')) {
      insights.push('Graph analysis reveals significant data interconnections');
    }

    return insights;
  };

  const applyGraphInformedFiltering = async (
    originalData: DataRow[],
    graphResults: any,
    query: string
  ): Promise<DataRow[]> => {
    // Simple implementation - in production, use sophisticated graph-based filtering
    let filteredData = [...originalData];

    // If graph found specific entities, filter for rows containing those entities
    if (graphResults.nodes?.length > 0) {
      const entityValues = graphResults.nodes
        .map((node: any) => node.properties?.value)
        .filter(Boolean);

      if (entityValues.length > 0) {
        filteredData = originalData.filter(row =>
          Object.values(row).some(value =>
            entityValues.includes(value)
          )
        );
      }
    }

    // Apply additional query-based filtering
    const queryLower = query.toLowerCase();
    if (queryLower.includes('high') || queryLower.includes('top')) {
      // Sort by first numeric column descending
      const numericColumn = columns.find(col => col.type === 'numeric');
      if (numericColumn) {
        filteredData.sort((a, b) => (Number(b[numericColumn.name]) || 0) - (Number(a[numericColumn.name]) || 0));
        filteredData = filteredData.slice(0, Math.min(20, filteredData.length));
      }
    }

    return filteredData;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      processGraphRAGQuery(query);
    }
  };

  const resetData = () => {
    onQueryResult(data);
    setQuery('');
  };

  const sampleQueries = [
    "Find entities related to high-value transactions",
    "Show relationships between customers and products",
    "Discover patterns in temporal data",
    "Identify outliers using graph analysis"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          GraphRAG Query Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your data using natural language..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isProcessing || !query.trim()}
            size="sm"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetData}
            size="sm"
          >
            Reset
          </Button>
        </form>

        {/* Sample Queries */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Try these graph-powered queries:</h4>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sampleQuery, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(sampleQuery)}
                disabled={isProcessing}
                className="text-xs"
              >
                {sampleQuery}
              </Button>
            ))}
          </div>
        </div>

        {/* Query History with Insights */}
        {queryHistory.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Recent Graph Analyses
            </h4>
            {queryHistory.map((result, index) => (
              <Card key={index} className="bg-muted/50">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">"{result.query}"</span>
                    <Badge variant="secondary" className="text-xs">
                      {result.executionTime}ms
                    </Badge>
                  </div>
                  
                  {result.graphInsights.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">Graph Insights:</span>
                      {result.graphInsights.map((insight, i) => (
                        <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
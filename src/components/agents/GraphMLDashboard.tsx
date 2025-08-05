import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Network, TrendingUp, AlertTriangle, Users, Link, Zap, UserCheck } from 'lucide-react';
import { GraphMLAnalyzer, GraphMLInsight } from '@/lib/graph/GraphMLAnalyzer';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { toast } from 'sonner';

interface GraphMLDashboardProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
}

export const GraphMLDashboard: React.FC<GraphMLDashboardProps> = ({
  data,
  columns,
  fileName = 'dataset'
}) => {
  const [analyzer] = useState(() => new GraphMLAnalyzer());
  const [insights, setInsights] = useState<GraphMLInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedInsight, setSelectedInsight] = useState<GraphMLInsight | null>(null);

  const runGraphMLAnalysis = async () => {
    if (data.length === 0) {
      toast.error('No data available for analysis');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const datasetId = `dataset-${Date.now()}`;
      const newInsights = await analyzer.analyzeDatasetWithML(data, columns, datasetId);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setInsights(newInsights);
      toast.success(`GraphML analysis complete! Found ${newInsights.length} insights.`);
    } catch (error) {
      console.error('GraphML analysis failed:', error);
      toast.error('GraphML analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      case 'pattern': return <Network className="h-4 w-4" />;
      case 'embedding': return <Brain className="h-4 w-4" />;
      case 'stakeholder': return <UserCheck className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) acc[insight.type] = [];
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, GraphMLInsight[]>);

  if (data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data for GraphML Analysis</h3>
          <p className="text-muted-foreground text-center">
            Load a dataset to unlock advanced graph machine learning insights
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get analysis details for transparency
  const getDataAnalysisDetails = () => {
    const numericColumns = columns.filter(col => col.type === 'numeric');
    const textColumns = columns.filter(col => col.type === 'text');
    const entityColumns = textColumns.slice(0, 3); // Primary entity identification columns
    const valueColumns = numericColumns.slice(0, 5); // Primary value columns for relationships
    
    return {
      totalRows: data.length,
      totalColumns: columns.length,
      numericColumns: numericColumns.length,
      textColumns: textColumns.length,
      primaryEntityColumns: entityColumns.map(col => col.name),
      primaryValueColumns: valueColumns.map(col => col.name),
      analysisScope: `${entityColumns.length} entity types, ${valueColumns.length} value dimensions`
    };
  };

  const analysisDetails = getDataAnalysisDetails();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle>Graph Machine Learning Dashboard</CardTitle>
            </div>
            <Button 
              onClick={runGraphMLAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 w-full lg:w-auto"
            >
              <Network className="h-4 w-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Run GraphML Analysis'}</span>
            </Button>
          </div>
          
          {/* Data Analysis Overview */}
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-semibold mb-3 flex items-center">
              <Network className="h-4 w-4 mr-2" />
              Analysis Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dataset Size:</span>
                <p className="font-medium">{analysisDetails.totalRows} rows × {analysisDetails.totalColumns} columns</p>
              </div>
              <div>
                <span className="text-muted-foreground">Entity Fields:</span>
                <p className="font-medium">{analysisDetails.primaryEntityColumns.join(', ') || 'Auto-detected'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Value Fields:</span>
                <p className="font-medium">{analysisDetails.primaryValueColumns.join(', ') || 'All numeric'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Graph Scope:</span>
                <p className="font-medium">{analysisDetails.analysisScope}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p><strong>Analysis Process:</strong> Creates knowledge graph from entity relationships → Calculates node embeddings & centrality → Detects communities & anomalies → Generates ML predictions</p>
            </div>
          </div>
        </CardHeader>
        {isAnalyzing && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Building knowledge graph and analyzing patterns...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-2">
                Processing: {progress < 30 ? 'Entity extraction' : progress < 60 ? 'Relationship mapping' : progress < 80 ? 'ML model training' : 'Generating insights'}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {insights.length > 0 && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium">Anomalies</p>
                      <p className="text-2xl font-bold">{groupedInsights.anomaly?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Communities</p>
                      <p className="text-2xl font-bold">{groupedInsights.community?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Predictions</p>
                      <p className="text-2xl font-bold">{groupedInsights.prediction?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Network className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Patterns</p>
                      <p className="text-2xl font-bold">{groupedInsights.pattern?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Stakeholders</p>
                      <p className="text-2xl font-bold">{groupedInsights.stakeholder?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setSelectedInsight(insight)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 flex-1">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {insight.description.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={getSeverityColor(insight.severity) as any}>
                            {insight.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(insight.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {selectedInsight && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(selectedInsight.type)}
                      <CardTitle>{selectedInsight.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{selectedInsight.description}</p>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant={getSeverityColor(selectedInsight.severity) as any}>
                        {selectedInsight.severity}
                      </Badge>
                      <span className="text-sm">
                        Confidence: {Math.round(selectedInsight.confidence * 100)}%
                      </span>
                    </div>

                    {selectedInsight.metrics && (
                      <div>
                        <h4 className="font-medium mb-2">Metrics</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedInsight.metrics).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="ml-1 font-medium">
                                {typeof value === 'number' ? value.toFixed(3) : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedInsight.recommendations && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="text-sm space-y-1">
                          {selectedInsight.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {Object.entries(groupedInsights).map(([type, typeInsights]) => {
            const tabValue = type === 'anomaly' ? 'anomalies' : 
                           type === 'community' ? 'communities' : 
                           type === 'prediction' ? 'predictions' : 
                           type === 'pattern' ? 'patterns' : 
                           type === 'embedding' ? 'embeddings' : 
                           type === 'stakeholder' ? 'stakeholders' : type;
            
            return (
              <TabsContent key={type} value={tabValue}>
                <div className="grid gap-4">
                  {typeInsights.map((insight) => (
                    <Card key={insight.id}>
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          {getInsightIcon(insight.type)}
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <Badge variant={getSeverityColor(insight.severity) as any}>
                            {insight.type === 'stakeholder' ? `${insight.severity.toUpperCase()} PRIORITY` : insight.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p>{insight.description}</p>
                        
                        {insight.metrics && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(insight.metrics).map(([key, value]) => (
                              <div key={key} className="text-center p-3 bg-accent/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">{key}</p>
                                <p className="text-lg font-semibold">
                                  {typeof value === 'number' ? value.toFixed(3) : value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {insight.recommendations && (
                          <div>
                            <h4 className="font-medium mb-2">
                              {insight.type === 'stakeholder' ? 'Action Items' : 'Recommendations'}
                            </h4>
                            <div className="grid gap-2">
                              {insight.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start space-x-2 p-2 bg-accent/30 rounded">
                                  <Link className="h-4 w-4 mt-0.5 text-primary" />
                                  <span className="text-sm">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
};
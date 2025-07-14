import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useSemanticDataFusion } from '@/hooks/useSemanticDataFusion';
import { Brain, GitMerge, Zap, CheckCircle2, XCircle, Lightbulb, Database, Network } from 'lucide-react';

export const SmartDataIntegration = ({ onDataLoaded }: { onDataLoaded?: (data: any, columns: any, name: string) => void }) => {
  const {
    entities,
    relationships,
    fusedDatasets,
    currentOntology,
    isAnalyzing,
    suggestions,
    acceptRelationship,
    rejectRelationship,
    createCustomFusion,
    getEntitySummary,
    getRecommendedJoins,
    hasMultipleSources,
    canFuseData
  } = useSemanticDataFusion();

  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const summary = getEntitySummary();
  const recommendedJoins = getRecommendedJoins();

  const handleEntityToggle = (entityId: string) => {
    setSelectedEntities(prev => 
      prev.includes(entityId) 
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    );
  };

  const handleCreateFusion = () => {
    if (selectedEntities.length >= 2) {
      const fusedDataset = createCustomFusion(selectedEntities);
      if (fusedDataset && onDataLoaded) {
        onDataLoaded(fusedDataset.data, fusedDataset.columns, fusedDataset.name);
      }
      setSelectedEntities([]);
    }
  };

  const handleUseFusedDataset = (dataset: any) => {
    if (onDataLoaded) {
      onDataLoaded(dataset.data, dataset.columns, dataset.name);
    }
  };

  if (!hasMultipleSources) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Smart Data Integration</h3>
          <p className="text-muted-foreground mb-4">
            Connect multiple data sources (real-time or uploaded) to enable AI-powered semantic data fusion
          </p>
          <p className="text-sm text-muted-foreground">
            Set up at least 2 data sources in the Data Sources tab to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-semibold">Smart Data Integration</h2>
          {isAnalyzing && (
            <Badge variant="secondary" className="animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Analyzing...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{summary.totalEntities} Entities</Badge>
          <Badge variant="outline">{summary.totalRelationships} Relationships</Badge>
          {summary.averageQualityScore > 0 && (
            <Badge variant="default">Quality: {(summary.averageQualityScore * 100).toFixed(0)}%</Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="fusion">Data Fusion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Discovered Entities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalEntities}</div>
                {Object.entries(summary.entitiesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalRelationships}</div>
                <div className="text-sm text-muted-foreground">
                  {summary.highConfidenceRelationships} high confidence
                </div>
                <Progress 
                  value={summary.totalRelationships > 0 ? (summary.highConfidenceRelationships / summary.totalRelationships) * 100 : 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitMerge className="h-4 w-4" />
                  Fused Datasets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.fusedDatasets}</div>
                {summary.averageQualityScore > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Avg Quality: {(summary.averageQualityScore * 100).toFixed(0)}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {suggestions.length > 0 && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">AI Suggestions:</div>
                <ul className="list-disc list-inside space-y-1">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {recommendedJoins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommended Data Joins</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendedJoins.map((join, index) => (
                  <div key={join.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{join.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Join on: {join.joinColumns.map(col => `${col.source} = ${col.target}`).join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {(join.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          const entityIds = [`${join.sourceEntity.type}_${join.sourceEntity.sourceId}`, `${join.targetEntity.type}_${join.targetEntity.sourceId}`];
                          setSelectedEntities(entityIds);
                          setActiveTab('fusion');
                        }}
                      >
                        Use Join
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <div className="grid gap-4">
            {entities.map((entity, index) => (
              <Card key={`${entity.type}_${entity.sourceId}_${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">{entity.type}</Badge>
                      <span className="font-medium">{entity.name}</span>
                      <Badge variant="secondary">Source: {entity.sourceId}</Badge>
                    </div>
                    <Badge variant={entity.confidence > 0.7 ? 'default' : 'secondary'}>
                      {(entity.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Columns: {entity.columns.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <div className="grid gap-4">
            {relationships.map((relationship, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {relationship.sourceEntity.name} → {relationship.targetEntity.name}
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {relationship.relationshipType.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={relationship.confidence > 0.7 ? 'default' : 'secondary'}>
                        {(relationship.confidence * 100).toFixed(0)}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acceptRelationship(`${relationship.sourceEntity.sourceId}_${relationship.targetEntity.sourceId}`)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectRelationship(`${relationship.sourceEntity.sourceId}_${relationship.targetEntity.sourceId}`)}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Join on: {relationship.joinColumns.map(col => `${col.source} = ${col.target}`).join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fusion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Data Fusion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-3">
                Select entities to fuse together (minimum 2 required):
              </div>
              
              <div className="grid gap-2">
                {entities.map((entity, index) => {
                  const entityId = `${entity.type}_${entity.sourceId}`;
                  const isSelected = selectedEntities.includes(entityId);
                  
                  return (
                    <div
                      key={`${entity.type}_${entity.sourceId}_${index}`}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleEntityToggle(entityId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">{entity.type}</Badge>
                          <span className="font-medium">{entity.name}</span>
                        </div>
                        <Badge variant="secondary">
                          {(entity.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={handleCreateFusion}
                disabled={selectedEntities.length < 2 || !canFuseData}
                className="w-full"
              >
                <GitMerge className="h-4 w-4 mr-2" />
                Create Fused Dataset ({selectedEntities.length} selected)
              </Button>
            </CardContent>
          </Card>

          {fusedDatasets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Fused Datasets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fusedDatasets.map((dataset, index) => (
                  <div key={dataset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{dataset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {dataset.data.length} rows • {dataset.columns.length} columns • 
                        {dataset.sourceIds.length} sources
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        Quality: {(dataset.qualityScore * 100).toFixed(0)}%
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleUseFusedDataset(dataset)}
                      >
                        Use Dataset
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

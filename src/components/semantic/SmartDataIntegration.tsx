
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Link, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Database,
  GitMerge,
  TrendingUp
} from 'lucide-react';
import { DatasetInfo } from '@/contexts/AppStateContext';
import { RelationshipDiscoveryEngine, RelationshipCandidate } from '@/lib/dataModel/relationshipDiscovery';

interface SmartDataIntegrationProps {
  datasets: DatasetInfo[];
  activeDatasetId: string;
}

export const SmartDataIntegration: React.FC<SmartDataIntegrationProps> = ({
  datasets,
  activeDatasetId
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [discoveredRelationships, setDiscoveredRelationships] = useState<RelationshipCandidate[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const activeDataset = datasets.find(d => d.id === activeDatasetId);

  const discoverRelationships = async () => {
    if (datasets.length < 2) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setDiscoveredRelationships([]);
    setAnalysisComplete(false);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare datasets for analysis
      const analysisDatasets = datasets.map(dataset => ({
        id: dataset.id,
        name: dataset.name,
        data: dataset.data,
        columns: dataset.columns.map(col => ({
          ...col,
          semanticType: col.type as any,
          constraints: [],
          qualityScore: 0.8
        }))
      }));

      // Discover relationships
      const relationships = RelationshipDiscoveryEngine.discoverRelationships(analysisDatasets);

      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setDiscoveredRelationships(relationships);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Failed to discover relationships:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const highConfidenceRelationships = useMemo(() => 
    discoveredRelationships.filter(rel => rel.confidence >= 70), 
    [discoveredRelationships]
  );

  const mediumConfidenceRelationships = useMemo(() => 
    discoveredRelationships.filter(rel => rel.confidence >= 40 && rel.confidence < 70), 
    [discoveredRelationships]
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-success';
    if (confidence >= 60) return 'bg-warning';
    return 'bg-muted';
  };

  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence >= 80) return 'default';
    if (confidence >= 60) return 'secondary';
    return 'outline';
  };

  if (datasets.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Data Integration
          </CardTitle>
          <CardDescription>
            Automatically discover relationships between your datasets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need at least 2 datasets to discover relationships. Load more datasets to enable this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Data Integration
          </CardTitle>
          <CardDescription>
            Automatically discover relationships between your {datasets.length} datasets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{datasets.length}</p>
                <p className="text-sm text-muted-foreground">Datasets Loaded</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link className="h-8 w-8 text-info" />
              <div>
                <p className="font-medium">{discoveredRelationships.length}</p>
                <p className="text-sm text-muted-foreground">Relationships Found</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium">{highConfidenceRelationships.length}</p>
                <p className="text-sm text-muted-foreground">High Confidence</p>
              </div>
            </div>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Discovering relationships...</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
            </div>
          )}

          <Button
            onClick={discoverRelationships}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Relationships...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Discover Relationships
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Relationship Discovery Results
            </CardTitle>
            <CardDescription>
              Found {discoveredRelationships.length} potential relationships between your datasets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {discoveredRelationships.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No strong relationships were detected between your datasets. This could mean your data is independent or requires manual analysis.
                </AlertDescription>
              </Alert>
            ) : (
              <Tabs defaultValue="high" className="w-full">
                <TabsList>
                  <TabsTrigger value="high">
                    High Confidence ({highConfidenceRelationships.length})
                  </TabsTrigger>
                  <TabsTrigger value="medium">
                    Medium Confidence ({mediumConfidenceRelationships.length})
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    All Results ({discoveredRelationships.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="high" className="space-y-4">
                  {highConfidenceRelationships.length === 0 ? (
                    <p className="text-muted-foreground">No high-confidence relationships found.</p>
                  ) : (
                    highConfidenceRelationships.map((relationship, index) => (
                      <RelationshipCard key={index} relationship={relationship} datasets={datasets} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="medium" className="space-y-4">
                  {mediumConfidenceRelationships.length === 0 ? (
                    <p className="text-muted-foreground">No medium-confidence relationships found.</p>
                  ) : (
                    mediumConfidenceRelationships.map((relationship, index) => (
                      <RelationshipCard key={index} relationship={relationship} datasets={datasets} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  {discoveredRelationships.map((relationship, index) => (
                    <RelationshipCard key={index} relationship={relationship} datasets={datasets} />
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface RelationshipCardProps {
  relationship: RelationshipCandidate;
  datasets: DatasetInfo[];
}

const RelationshipCard: React.FC<RelationshipCardProps> = ({ relationship, datasets }) => {
  const sourceDataset = datasets.find(d => d.id === relationship.targetDatasetId);
  const targetDataset = datasets.find(d => d.id === relationship.targetDatasetId);

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {relationship.sourceColumn} → {relationship.targetColumn}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={getConfidenceBadgeVariant(relationship.confidence)}>
                {relationship.confidence.toFixed(0)}% confidence
              </Badge>
              <Badge variant="outline">
                {relationship.suggestedType.replace('-', ' ')}
              </Badge>
              <Badge variant="secondary">
                {relationship.evidenceType.replace('_', ' ')}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Evidence:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {relationship.evidence.map((evidence, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-xs">•</span>
                    <span>{evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ml-4">
            <div className={`w-2 h-16 rounded-full ${getConfidenceColor(relationship.confidence)}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Database, 
  GitMerge, 
  Brain, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { DatasetInfo } from '@/contexts/AppStateContext';

interface SmartDataIntegrationProps {
  datasets: DatasetInfo[];
  activeDatasetId: string;
}

interface DataRelationship {
  id: string;
  sourceDataset: string;
  targetDataset: string;
  relationshipType: 'foreign_key' | 'semantic' | 'temporal' | 'categorical';
  sourceColumn: string;
  targetColumn: string;
  confidence: number;
  description: string;
  strength: 'weak' | 'moderate' | 'strong';
}

const getConfidenceBadgeVariant = (confidence: number) => {
  if (confidence >= 0.8) return 'default';
  if (confidence >= 0.6) return 'secondary';
  return 'outline';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

export const SmartDataIntegration = ({ datasets, activeDatasetId }: SmartDataIntegrationProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [relationships, setRelationships] = useState<DataRelationship[]>([]);
  const [selectedRelationship, setSelectedRelationship] = useState<DataRelationship | null>(null);

  const analyzeRelationships = useCallback(async () => {
    if (datasets.length < 2) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 15;
      });
    }, 300);

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock relationships
    const mockRelationships: DataRelationship[] = [];
    
    for (let i = 0; i < datasets.length - 1; i++) {
      for (let j = i + 1; j < datasets.length; j++) {
        const source = datasets[i];
        const target = datasets[j];
        
        // Find potential column matches
        const sourceColumns = source.columns.map(col => col.name.toLowerCase());
        const targetColumns = target.columns.map(col => col.name.toLowerCase());
        
        sourceColumns.forEach(sourceCol => {
          targetColumns.forEach(targetCol => {
            const similarity = calculateColumnSimilarity(sourceCol, targetCol);
            
            if (similarity > 0.6) {
              mockRelationships.push({
                id: `${source.id}-${target.id}-${sourceCol}-${targetCol}`,
                sourceDataset: source.name,
                targetDataset: target.name,
                relationshipType: determineRelationshipType(sourceCol, targetCol),
                sourceColumn: sourceCol,
                targetColumn: targetCol,
                confidence: similarity,
                description: generateRelationshipDescription(sourceCol, targetCol, similarity),
                strength: similarity > 0.8 ? 'strong' : similarity > 0.6 ? 'moderate' : 'weak'
              });
            }
          });
        });
      }
    }

    clearInterval(progressInterval);
    setAnalysisProgress(100);
    setRelationships(mockRelationships);
    setIsAnalyzing(false);
  }, [datasets]);

  const calculateColumnSimilarity = (col1: string, col2: string): number => {
    // Simple similarity calculation
    if (col1 === col2) return 1.0;
    
    const commonSubstrings = ['id', 'name', 'date', 'time', 'amount', 'price', 'quantity'];
    const col1Lower = col1.toLowerCase();
    const col2Lower = col2.toLowerCase();
    
    for (const substring of commonSubstrings) {
      if (col1Lower.includes(substring) && col2Lower.includes(substring)) {
        return 0.8;
      }
    }
    
    // Calculate Levenshtein distance-based similarity
    const distance = levenshteinDistance(col1Lower, col2Lower);
    const maxLength = Math.max(col1.length, col2.length);
    return Math.max(0, 1 - distance / maxLength);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const determineRelationshipType = (col1: string, col2: string): DataRelationship['relationshipType'] => {
    const idPattern = /id$/i;
    const datePattern = /(date|time)/i;
    
    if (idPattern.test(col1) || idPattern.test(col2)) {
      return 'foreign_key';
    }
    
    if (datePattern.test(col1) && datePattern.test(col2)) {
      return 'temporal';
    }
    
    return 'semantic';
  };

  const generateRelationshipDescription = (col1: string, col2: string, confidence: number): string => {
    const confidenceText = confidence > 0.8 ? 'strong' : confidence > 0.6 ? 'moderate' : 'weak';
    return `${confidenceText} relationship detected between "${col1}" and "${col2}" based on naming patterns and data characteristics.`;
  };

  const getRelationshipIcon = (type: DataRelationship['relationshipType']) => {
    switch (type) {
      case 'foreign_key': return <Database className="h-4 w-4" />;
      case 'semantic': return <Brain className="h-4 w-4" />;
      case 'temporal': return <TrendingUp className="h-4 w-4" />;
      case 'categorical': return <GitMerge className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Data Integration
          </CardTitle>
          <CardDescription>
            AI-powered relationship discovery between your datasets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {datasets.length < 2 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need at least 2 datasets to discover relationships. Load more datasets to enable this feature.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {datasets.length} datasets available for analysis
                </div>
                <Button 
                  onClick={analyzeRelationships}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Discover Relationships
                    </>
                  )}
                </Button>
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing relationships...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              )}

              {relationships.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Discovered Relationships</h3>
                    <Badge variant="secondary">
                      {relationships.length} relationships found
                    </Badge>
                  </div>

                  <div className="grid gap-3">
                    {relationships.map((relationship) => (
                      <Card 
                        key={relationship.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedRelationship?.id === relationship.id ? 'border-primary' : ''
                        }`}
                        onClick={() => setSelectedRelationship(relationship)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getRelationshipIcon(relationship.relationshipType)}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{relationship.sourceDataset}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="font-medium">{relationship.targetDataset}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {relationship.sourceColumn} ↔ {relationship.targetColumn}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {relationship.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={getConfidenceBadgeVariant(relationship.confidence)}>
                                {Math.round(relationship.confidence * 100)}% confidence
                              </Badge>
                              <Badge variant="outline" className={getConfidenceColor(relationship.confidence)}>
                                {relationship.strength}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!isAnalyzing && relationships.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Click "Discover Relationships" to start analyzing connections between your datasets.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

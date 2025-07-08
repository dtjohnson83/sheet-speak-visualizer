// Enhanced Data Model Dashboard - UI for enhanced data modeling features
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Database, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Link as LinkIcon,
  BarChart3,
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import { CompatibleDataset, DataQualityProfile, DatasetRelationship } from '@/types/dataModel';

interface EnhancedDataModelDashboardProps {
  dataset: CompatibleDataset | null;
  qualityProfile: DataQualityProfile | null;
  relationships: DatasetRelationship[];
  isAnalyzing: boolean;
  analysisProgress: number;
  onDiscoverRelationships: () => Promise<any>;
}

export const EnhancedDataModelDashboard = ({
  dataset,
  qualityProfile,
  relationships,
  isAnalyzing,
  analysisProgress,
  onDiscoverRelationships
}: EnhancedDataModelDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!dataset) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Enhanced Data Model
          </CardTitle>
          <CardDescription>
            Load a dataset to see enhanced data modeling features
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStorageTypeIcon = (type: string) => {
    switch (type) {
      case 'columnar': return <BarChart3 className="h-4 w-4" />;
      case 'hybrid': return <Zap className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {isAnalyzing && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>Analyzing Dataset</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm">
                Processing enhanced data modeling features... {analysisProgress}%
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {dataset.name}
          </CardTitle>
          <CardDescription>
            Enhanced dataset with {dataset.data.length.toLocaleString()} rows 
            and {dataset.columns.length} columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quality Score */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Data Quality</span>
              </div>
              {qualityProfile ? (
                <div className={`text-2xl font-bold ${getQualityScoreColor(qualityProfile.overallScore)}`}>
                  {(qualityProfile.overallScore * 100).toFixed(0)}%
                </div>
              ) : (
                <div className="text-2xl font-bold text-gray-400">-</div>
              )}
            </div>

            {/* Storage Optimization */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStorageTypeIcon(dataset.enhanced?.storageOptimization?.type || 'jsonb')}
                <span className="text-sm font-medium">Storage Type</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {dataset.enhanced?.storageOptimization?.type || 'jsonb'}
              </Badge>
            </div>

            {/* Access Pattern */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Access Pattern</span>
              </div>
              <Badge 
                variant={
                  dataset.enhanced?.caching?.pattern === 'hot' ? 'default' :
                  dataset.enhanced?.caching?.pattern === 'warm' ? 'secondary' : 'outline'
                }
              >
                {dataset.enhanced?.caching?.pattern || 'warm'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Schema Version */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Schema Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                  <span className="text-sm font-medium">
                    {dataset.enhanced?.schema?.version || 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Modified</span>
                  <span className="text-sm font-medium">
                    {dataset.enhanced?.schema?.modified 
                      ? new Date(dataset.enhanced.schema.modified).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Checksum</span>
                  <span className="text-sm font-medium font-mono">
                    {dataset.enhanced?.schema?.checksum?.slice(0, 8) || 'N/A'}...
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Rows</span>
                  <span className="text-sm font-medium">
                    {dataset.data.length.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Columns</span>
                  <span className="text-sm font-medium">
                    {dataset.columns.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Relationships</span>
                  <span className="text-sm font-medium">
                    {relationships.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          {qualityProfile ? (
            <>
              {/* Quality Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Completeness</div>
                      <div className={`text-2xl font-bold ${getQualityScoreColor(qualityProfile.completeness)}`}>
                        {(qualityProfile.completeness * 100).toFixed(0)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Validity</div>
                      <div className={`text-2xl font-bold ${getQualityScoreColor(qualityProfile.validity)}`}>
                        {(qualityProfile.validity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
                      <div className={`text-2xl font-bold ${getQualityScoreColor(qualityProfile.consistency)}`}>
                        {(qualityProfile.consistency * 100).toFixed(0)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                      <div className={`text-2xl font-bold ${getQualityScoreColor(qualityProfile.accuracy)}`}>
                        {(qualityProfile.accuracy * 100).toFixed(0)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quality Issues */}
              {qualityProfile.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quality Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {qualityProfile.issues.slice(0, 5).map((issue, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <AlertCircle className={`h-4 w-4 mt-0.5 ${
                            issue.severity === 'critical' ? 'text-red-500' :
                            issue.severity === 'high' ? 'text-orange-500' :
                            issue.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{issue.description}</span>
                              <Badge variant="outline" className="text-xs">
                                {issue.severity}
                              </Badge>
                            </div>
                            {issue.suggestedFix && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Suggestion: {issue.suggestedFix}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {qualityProfile.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {qualityProfile.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Quality Profile Available</AlertTitle>
              <AlertDescription>
                Quality assessment is not available for this dataset.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          {dataset.enhanced?.schema ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enhanced Column Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataset.enhanced.schema.columns.map((column, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{column.displayName || column.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{column.type}</Badge>
                          {column.semanticType && (
                            <Badge variant="secondary">{column.semanticType}</Badge>
                          )}
                        </div>
                      </div>
                      
                      {column.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {column.description}
                        </p>
                      )}

                      {column.statistics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Unique:</span> {column.statistics.uniqueCount}
                          </div>
                          <div>
                            <span className="text-gray-500">Null:</span> {column.statistics.nullCount}
                          </div>
                          {column.statistics.min !== undefined && (
                            <div>
                              <span className="text-gray-500">Min:</span> {column.statistics.min}
                            </div>
                          )}
                          {column.statistics.max !== undefined && (
                            <div>
                              <span className="text-gray-500">Max:</span> {column.statistics.max}
                            </div>
                          )}
                        </div>
                      )}

                      {column.qualityScore !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Quality Score:</span>
                          <span className={`text-sm font-medium ${getQualityScoreColor(column.qualityScore / 100)}`}>
                            {column.qualityScore.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Enhanced Schema Available</AlertTitle>
              <AlertDescription>
                Enhanced schema information is not available for this dataset.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Dataset Relationships</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover and manage relationships between datasets
              </p>
            </div>
            <Button onClick={onDiscoverRelationships}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Discover Relationships
            </Button>
          </div>

          {relationships.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {relationships.map((relationship, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <LinkIcon className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm">
                          {relationship.sourceColumn} → {relationship.targetColumn}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {relationship.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Confidence: {(relationship.confidence).toFixed(0)}%
                          </span>
                          {relationship.discovered && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-discovered
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <LinkIcon className="h-4 w-4" />
              <AlertTitle>No Relationships Discovered</AlertTitle>
              <AlertDescription>
                Click "Discover Relationships" to automatically find connections between your datasets.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
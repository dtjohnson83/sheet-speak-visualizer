import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3, 
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Brain,
  Zap,
  LineChart
} from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { BusinessPrediction, BusinessScenario } from '@/hooks/usePredictiveAnalytics';
import { useEnhancedPredictiveAnalytics } from '@/hooks/useEnhancedPredictiveAnalytics';
import { BusinessForecastChart } from './BusinessForecastChart';
import { ScenarioComparison } from './ScenarioComparison';
import { PredictiveInsights } from './PredictiveInsights';
import { DataSuitabilityGuide } from './DataSuitabilityGuide';
import { useToast } from '@/hooks/use-toast';

interface PredictiveAnalyticsDashboardProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

export const PredictiveAnalyticsDashboard = ({ data, columns }: PredictiveAnalyticsDashboardProps) => {
  const [predictions, setPredictions] = useState<BusinessPrediction[]>([]);
  const [scenarios, setScenarios] = useState<BusinessScenario[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [forecastResults, setForecastResults] = useState<Map<string, any>>(new Map());
  const [businessHealth, setBusinessHealth] = useState<any>(null);
  
  const { isAnalyzing, analysisProgress, runEnhancedPredictiveAnalysis } = useEnhancedPredictiveAnalytics();
  const { toast } = useToast();

  const handleRunEnhancedAnalysis = async () => {
    console.log('Enhanced predictions button clicked!');
    console.log('Data available:', { dataRows: data.length, columns: columns.length });
    
    try {
      const result = await runEnhancedPredictiveAnalysis(data, columns);
      console.log('Enhanced analysis result:', result);
      
      setPredictions(result.predictions);
      setScenarios(result.scenarios);
      setInsights(result.insights);
      setRecommendations(result.recommendations);
      setForecastResults(result.forecastResults);
      setBusinessHealth(result.businessHealth);
      
      toast({
        title: "Enhanced Predictive Analysis Complete",
        description: `Generated ${result.predictions.length} predictions with advanced forecasting methods.`,
      });
    } catch (error) {
      console.error('Enhanced analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete enhanced predictive analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="h-5 w-5" />;
      case 'customer': return <Users className="h-5 w-5" />;
      case 'market': return <BarChart3 className="h-5 w-5" />;
      case 'sales': return <TrendingUp className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'increasing' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      trend === 'decreasing' ? 
      <TrendingDown className="h-4 w-4 text-red-500" /> : 
      <Activity className="h-4 w-4 text-yellow-500" />;
  };

  const formatPredictionValue = (prediction: BusinessPrediction) => {
    switch (prediction.unit) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(prediction.prediction);
      case 'percentage':
        return `${prediction.prediction.toFixed(1)}%`;
      case 'units':
        return new Intl.NumberFormat('en-US').format(Math.round(prediction.prediction));
      default:
        return prediction.prediction.toFixed(2);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getModelAccuracyBadge = (prediction: BusinessPrediction) => {
    const r2Score = prediction.metadata?.r2Score || prediction.confidence;
    if (r2Score > 0.8) return <Badge variant="default" className="bg-green-600">High Accuracy</Badge>;
    if (r2Score > 0.6) return <Badge variant="secondary">Good Accuracy</Badge>;
    if (r2Score > 0.4) return <Badge variant="outline">Fair Accuracy</Badge>;
    return <Badge variant="destructive">Low Accuracy</Badge>;
  };

  const getForecastMethodBadge = (method: string) => {
    const methodLabels = {
      'linear': 'Linear Regression',
      'exponential': 'Exponential Smoothing',
      'seasonal': 'Seasonal Decomposition',
      'arima-simple': 'ARIMA Model'
    };
    
    return (
      <Badge variant="outline" className="text-xs">
        <Brain className="h-3 w-3 mr-1" />
        {methodLabels[method as keyof typeof methodLabels] || method}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Enhanced Predictive Analytics
              </CardTitle>
              <CardDescription>
                Advanced AI-powered forecasting with ARIMA, exponential smoothing, and seasonal decomposition
              </CardDescription>
            </div>
            
            <Button
              onClick={handleRunEnhancedAnalysis}
              disabled={isAnalyzing || data.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Enhanced Predictions
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {isAnalyzing && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enhanced Analysis Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Running advanced statistical models and seasonal decomposition...
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {predictions.length > 0 && (
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="predictions">Enhanced Predictions</TabsTrigger>
            <TabsTrigger value="forecasts">Statistical Models</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predictions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {predictions.map((prediction) => (
                <Card key={prediction.id} className="relative overflow-hidden border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPredictionIcon(prediction.type)}
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {prediction.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {prediction.timeframe}
                          </CardDescription>
                        </div>
                      </div>
                      {getTrendIcon(prediction.trend)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {formatPredictionValue(prediction)}
                        </span>
                        {getModelAccuracyBadge(prediction)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {prediction.description}
                      </p>
                      
                      {/* Enhanced metadata display */}
                      <div className="space-y-2">
                        {prediction.metadata?.forecastMethod && (
                          <div className="flex justify-between items-center">
                            {getForecastMethodBadge(prediction.metadata.forecastMethod)}
                            {prediction.metadata.r2Score && (
                              <span className="text-xs text-muted-foreground">
                                R² = {(prediction.metadata.r2Score * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}
                        
                        {prediction.metadata?.mape && (
                          <div className="text-xs text-muted-foreground">
                            MAPE: {prediction.metadata.mape.toFixed(1)}% | 
                            Seasonality: {(prediction.metadata.seasonality * 100).toFixed(1)}%
                          </div>
                        )}
                        
                        {prediction.metadata?.confidenceInterval && (
                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            Confidence Interval: {prediction.metadata.confidenceInterval.lower.toFixed(0)} - {prediction.metadata.confidenceInterval.upper.toFixed(0)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Impact: {prediction.impact}</span>
                        <span>{prediction.type}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="forecasts" className="space-y-4">
            <BusinessForecastChart 
              predictions={predictions}
              data={data}
              columns={columns}
              forecastResults={forecastResults}
            />
          </TabsContent>
          
          <TabsContent value="scenarios" className="space-y-4">
            <ScenarioComparison scenarios={scenarios} />
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <PredictiveInsights 
              insights={insights}
              predictions={predictions}
            />
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4" />
                        {rec.title}
                      </CardTitle>
                      <CardDescription>{rec.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Implementation</h4>
                          <p className="text-sm text-muted-foreground">{rec.implementation}</p>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Expected Impact: <strong>{(rec.expectedImpact * 100).toFixed(0)}%</strong></span>
                          <span>Timeframe: <strong>{rec.timeframe}</strong></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recommendations available. Run enhanced analysis to generate actionable insights.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {predictions.length === 0 && !isAnalyzing && data.length > 0 && (
        <DataSuitabilityGuide data={data} columns={columns} />
      )}
    </div>
  );
};

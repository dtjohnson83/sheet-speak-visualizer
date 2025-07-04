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
  Activity
} from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { usePredictiveAnalytics, BusinessPrediction, BusinessScenario } from '@/hooks/usePredictiveAnalytics';
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
  
  const { isAnalyzing, analysisProgress, runPredictiveAnalysis } = usePredictiveAnalytics();
  const { toast } = useToast();

  const handleRunAnalysis = async () => {
    console.log('Generate predictions button clicked!');
    console.log('Data available:', { dataRows: data.length, columns: columns.length });
    
    try {
      const result = await runPredictiveAnalysis(data, columns);
      console.log('Analysis result:', result);
      
      setPredictions(result.predictions);
      setScenarios(result.scenarios);
      setInsights(result.insights);
      
      toast({
        title: "Predictive Analysis Complete",
        description: `Generated ${result.predictions.length} predictions and ${result.scenarios.length} scenarios.`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete predictive analysis. Please try again.",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Business Intelligence Predictive Analytics
              </CardTitle>
              <CardDescription>
                AI-powered forecasting and business intelligence insights
              </CardDescription>
            </div>
            
            <Button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || data.length === 0}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {isAnalyzing && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analysis Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {predictions.length > 0 && (
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predictions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {predictions.map((prediction) => (
                <Card key={prediction.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-1 h-full ${getImpactColor(prediction.impact)}`} />
                  
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
                        <Badge variant="secondary" className="text-xs">
                          {(prediction.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {prediction.description}
                      </p>
                      
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
        </Tabs>
      )}

      {predictions.length === 0 && !isAnalyzing && data.length > 0 && (
        <DataSuitabilityGuide data={data} columns={columns} />
      )}
    </div>
  );
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Target,
  ArrowRight,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import { BusinessPrediction } from '@/hooks/usePredictiveAnalytics';

interface PredictiveInsightsProps {
  insights: Array<{
    id: string;
    title: string;
    description: string;
    actionable: boolean;
    priority: 'high' | 'medium' | 'low';
  }>;
  predictions: BusinessPrediction[];
}

export const PredictiveInsights = ({ insights, predictions }: PredictiveInsightsProps) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // Generate strategic recommendations based on predictions
  const generateStrategicRecommendations = () => {
    const recommendations = [];
    
    const revenuePredictions = predictions.filter(p => p.type === 'revenue');
    const customerPredictions = predictions.filter(p => p.type === 'customer');
    const marketPredictions = predictions.filter(p => p.type === 'market');
    
    if (revenuePredictions.some(p => p.trend === 'increasing')) {
      recommendations.push({
        title: 'Scale Revenue Growth',
        description: 'Revenue trends are positive. Consider increasing marketing spend and expanding to new markets.',
        icon: <DollarSign className="h-5 w-5 text-green-600" />,
        actions: ['Increase marketing budget', 'Expand product lines', 'Enter new markets']
      });
    }
    
    if (customerPredictions.some(p => p.trend === 'increasing')) {
      recommendations.push({
        title: 'Customer Success Focus',
        description: 'Growing customer base presents opportunities for retention and upselling programs.',
        icon: <Users className="h-5 w-5 text-blue-600" />,
        actions: ['Implement customer success program', 'Develop upselling strategies', 'Improve onboarding']
      });
    }
    
    if (marketPredictions.some(p => p.confidence > 0.8)) {
      recommendations.push({
        title: 'Market Position Optimization',
        description: 'High-confidence market predictions suggest strategic positioning opportunities.',
        icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
        actions: ['Analyze competitor positioning', 'Adjust pricing strategy', 'Optimize product-market fit']
      });
    }
    
    return recommendations;
  };

  const strategicRecommendations = generateStrategicRecommendations();

  return (
    <div className="space-y-6">
      {/* AI-Generated Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
        </div>
        
        {insights.length > 0 ? (
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${getPriorityColor(insight.priority)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(insight.priority)}
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'secondary' : 'outline'}>
                        {insight.priority} priority
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="outline">Actionable</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  {insight.actionable && (
                    <div className="mt-3">
                      <Button size="sm" variant="outline">
                        Take Action
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              No specific insights generated yet. Run the analysis with more data to get detailed recommendations.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Strategic Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Strategic Recommendations</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {strategicRecommendations.map((rec, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {rec.icon}
                  <CardTitle className="text-sm font-medium">{rec.title}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {rec.description}
                </p>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium">Recommended Actions:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {rec.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Prediction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Summary</CardTitle>
          <CardDescription>
            Overview of all predictions and their confidence levels
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{prediction.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {prediction.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {prediction.description}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {prediction.unit === 'currency' 
                      ? `$${(prediction.prediction / 1000).toFixed(0)}K`
                      : prediction.unit === 'percentage'
                      ? `${prediction.prediction.toFixed(1)}%`
                      : prediction.prediction.toFixed(0)
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(prediction.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Recommended actions based on predictive analysis
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                1
              </div>
              <div>
                <h4 className="text-sm font-medium">Monitor Key Metrics</h4>
                <p className="text-xs text-muted-foreground">
                  Track the metrics with highest prediction confidence to validate forecasts
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                2
              </div>
              <div>
                <h4 className="text-sm font-medium">Implement High-Priority Actions</h4>
                <p className="text-xs text-muted-foreground">
                  Focus on actionable insights with high priority ratings
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                3
              </div>
              <div>
                <h4 className="text-sm font-medium">Regular Analysis Updates</h4>
                <p className="text-xs text-muted-foreground">
                  Re-run analysis monthly to refine predictions with new data
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
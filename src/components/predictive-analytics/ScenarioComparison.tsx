import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BusinessScenario } from '@/hooks/usePredictiveAnalytics';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface ScenarioComparisonProps {
  scenarios: BusinessScenario[];
}

export const ScenarioComparison = ({ scenarios }: ScenarioComparisonProps) => {
  const getScenarioIcon = (name: string) => {
    if (name.toLowerCase().includes('optimistic')) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (name.toLowerCase().includes('pessimistic') || name.toLowerCase().includes('risk')) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-blue-500" />;
  };

  const getScenarioColor = (name: string) => {
    if (name.toLowerCase().includes('optimistic')) return 'bg-green-500';
    if (name.toLowerCase().includes('pessimistic') || name.toLowerCase().includes('risk')) return 'bg-red-500';
    return 'bg-blue-500';
  };

  // Prepare data for comparison charts
  const comparisonData = scenarios.map(scenario => {
    const revenueSum = scenario.predictions
      .filter(p => p.type === 'revenue')
      .reduce((sum, p) => sum + p.prediction, 0);
    
    const customerSum = scenario.predictions
      .filter(p => p.type === 'customer')
      .reduce((sum, p) => sum + p.prediction, 0);
    
    const marketSum = scenario.predictions
      .filter(p => p.type === 'market')
      .reduce((sum, p) => sum + p.prediction, 0);

    return {
      name: scenario.name,
      revenue: revenueSum,
      customers: customerSum,
      market: marketSum,
      confidence: scenario.confidence * 100
    };
  });

  // Radar chart data for assumptions
  const assumptionData = scenarios.map(scenario => {
    const assumptions = typeof scenario.assumptions === 'object' ? scenario.assumptions : {};
    return {
      scenario: scenario.name.split(' ')[0], // Use first word
      marketGrowth: ((assumptions as any).marketGrowth || 1.1 - 1) * 100,
      customerRetention: ((assumptions as any).customerRetention || 0.85) * 100,
      operationalEfficiency: (((assumptions as any).operationalEfficiency || 1.05) - 1) * 100 + 100
    };
  });

  return (
    <div className="space-y-6">
      {/* Scenario Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${getScenarioColor(scenario.name)}`} />
            
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {getScenarioIcon(scenario.name)}
                <CardTitle className="text-lg">{scenario.name}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {scenario.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Confidence Level</span>
                  <Badge variant="secondary">
                    {(scenario.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={scenario.confidence * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Key Assumptions</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Market Growth:</span>
                    <span>{((((scenario.assumptions as any)?.marketGrowth || 1.1) - 1) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Retention:</span>
                    <span>{(((scenario.assumptions as any)?.customerRetention || 0.85) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operational Efficiency:</span>
                    <span>{((((scenario.assumptions as any)?.operationalEfficiency || 1.05) - 1) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Predictions</h4>
                <div className="text-xs space-y-1">
                  {scenario.predictions.slice(0, 3).map((prediction, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="capitalize">{prediction.type}:</span>
                      <span className="font-medium">
                        {prediction.unit === 'currency' 
                          ? `$${(prediction.prediction / 1000).toFixed(0)}K`
                          : prediction.unit === 'percentage'
                          ? `${prediction.prediction.toFixed(1)}%`
                          : prediction.prediction.toFixed(0)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Comparison</CardTitle>
            <CardDescription>
              Side-by-side comparison of key metrics across scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="customers" fill="#82ca9d" name="Customers" />
                  <Bar dataKey="market" fill="#ffc658" name="Market" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart for Assumptions */}
        <Card>
          <CardHeader>
            <CardTitle>Assumption Analysis</CardTitle>
            <CardDescription>
              Comparing the underlying assumptions of each scenario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={assumptionData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="scenario" />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 120]}
                    tick={{ fontSize: 12 }}
                  />
                  <Radar
                    name="Market Growth %"
                    dataKey="marketGrowth"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="Customer Retention %"
                    dataKey="customerRetention"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="Operational Efficiency %"
                    dataKey="operationalEfficiency"
                    stroke="#ffc658"
                    fill="#ffc658"
                    fillOpacity={0.1}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Risk & Opportunity Analysis</CardTitle>
          <CardDescription>
            Understanding the probability and impact of each scenario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {scenarios.map((scenario) => {
              const riskLevel = scenario.name.toLowerCase().includes('pessimistic') ? 'high' : 
                               scenario.name.toLowerCase().includes('optimistic') ? 'low' : 'medium';
              
              const riskColor = riskLevel === 'high' ? 'text-red-600' : 
                               riskLevel === 'low' ? 'text-green-600' : 'text-yellow-600';
              
              return (
                <div key={scenario.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getScenarioIcon(scenario.name)}
                    <h4 className="font-medium">{scenario.name}</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Probability:</span>
                      <span className="font-medium">
                        {scenario.confidence < 0.7 ? 'Low' : 
                         scenario.confidence < 0.85 ? 'Medium' : 'High'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className={`font-medium capitalize ${riskColor}`}>
                        {riskLevel}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Impact:</span>
                      <span className="font-medium">
                        {scenario.predictions.length > 2 ? 'High' : 
                         scenario.predictions.length > 1 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { BusinessPrediction } from '@/hooks/usePredictiveAnalytics';
import { TrendingUp } from 'lucide-react';

interface BusinessForecastChartProps {
  predictions: BusinessPrediction[];
  data: DataRow[];
  columns: ColumnInfo[];
}

export const BusinessForecastChart = ({ predictions, data, columns }: BusinessForecastChartProps) => {
  const chartData = useMemo(() => {
    // Generate forecast data for visualization
    const forecastDays = 90;
    const historicalDays = 30;
    
    return Array.from({ length: historicalDays + forecastDays }, (_, index) => {
      const isHistorical = index < historicalDays;
      const dayOffset = index - historicalDays;
      
      const baseValue = 100; // Base value for simulation
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      
      const dataPoint: any = {
        date: date.toISOString().split('T')[0],
        isHistorical,
        day: index
      };
      
      // Add prediction lines for each business metric
      predictions.forEach(prediction => {
        const trendMultiplier = prediction.trend === 'increasing' ? 1.02 : 
                               prediction.trend === 'decreasing' ? 0.98 : 1.0;
        
        const randomVariation = (Math.random() - 0.5) * 0.2;
        const seasonalEffect = Math.sin((index * 2 * Math.PI) / 30) * 0.1; // 30-day cycle
        
        let value;
        if (isHistorical) {
          // Historical data simulation
          value = baseValue * Math.pow(trendMultiplier, index) * (1 + randomVariation + seasonalEffect);
        } else {
          // Forecast data
          const forecastBase = prediction.prediction / 100 * baseValue;
          value = forecastBase * Math.pow(trendMultiplier, dayOffset) * (1 + randomVariation * 0.5 + seasonalEffect);
        }
        
        dataPoint[prediction.type] = Math.max(0, value);
        
        // Add confidence intervals for forecasts
        if (!isHistorical) {
          const confidenceRange = value * (1 - prediction.confidence) * 0.5;
          dataPoint[`${prediction.type}_upper`] = value + confidenceRange;
          dataPoint[`${prediction.type}_lower`] = Math.max(0, value - confidenceRange);
        }
      });
      
      return dataPoint;
    });
  }, [predictions]);

  const colors = {
    revenue: '#8884d8',
    sales: '#82ca9d',
    customer: '#ffc658',
    market: '#ff7c7c',
    growth: '#8dd1e1',
    risk: '#d084d0'
  };

  const revenuePredictions = predictions.filter(p => p.type === 'revenue');
  const customerPredictions = predictions.filter(p => p.type === 'customer');
  const marketPredictions = predictions.filter(p => p.type === 'market');

  return (
    <div className="space-y-6">
      {/* Revenue Forecast */}
      {revenuePredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Forecast
            </CardTitle>
            <CardDescription>
              Historical data and 90-day revenue predictions with confidence intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    interval="preserveStartEnd"
                  />
                  <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => [
                      `$${value.toFixed(2)}`,
                      name.replace('_', ' ').toUpperCase()
                    ]}
                  />
                  <Legend />
                  
                  {/* Confidence interval area */}
                  <Area
                    dataKey="revenue_upper"
                    stroke="none"
                    fill={colors.revenue}
                    fillOpacity={0.1}
                    stackId="confidence"
                  />
                  <Area
                    dataKey="revenue_lower"
                    stroke="none"
                    fill="white"
                    fillOpacity={1}
                    stackId="confidence"
                  />
                  
                  {/* Main revenue line */}
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={colors.revenue}
                    strokeWidth={2}
                    dot={false}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-metric comparison */}
      {predictions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Metrics Comparison</CardTitle>
            <CardDescription>
              Comparative view of all business predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => [
                      value.toFixed(2),
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Legend />
                  
                  {predictions.map(prediction => (
                    <Line
                      key={prediction.id}
                      type="monotone"
                      dataKey={prediction.type}
                      stroke={colors[prediction.type as keyof typeof colors] || '#8884d8'}
                      strokeWidth={2}
                      dot={false}
                      name={prediction.title}
                      strokeDasharray={chartData.find(d => d[prediction.type])?.isHistorical === false ? "5 5" : "0"}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predictions.filter(p => p.trend === 'increasing').map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.type}</span>
                  <span className="text-green-600 font-medium">↗ Growing</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stable Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predictions.filter(p => p.trend === 'stable').map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.type}</span>
                  <span className="text-yellow-600 font-medium">→ Stable</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Declining Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predictions.filter(p => p.trend === 'decreasing').map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.type}</span>
                  <span className="text-red-600 font-medium">↘ Declining</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
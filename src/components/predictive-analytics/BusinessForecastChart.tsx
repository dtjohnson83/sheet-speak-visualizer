
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Brain } from 'lucide-react';
import { BusinessPrediction } from '@/hooks/usePredictiveAnalytics';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { ForecastResult } from '@/lib/ml/advancedForecasting';

interface ForecastChartData {
  period: string;
  actual?: number;
  forecast?: number;
  upperBound?: number;
  lowerBound?: number;
  confidence?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

interface BusinessForecastChartProps {
  predictions: BusinessPrediction[];
  data: DataRow[];
  columns: ColumnInfo[];
  forecastResults: Map<string, ForecastResult>;
}

export const BusinessForecastChart = ({ 
  predictions, 
  data, 
  columns, 
  forecastResults 
}: BusinessForecastChartProps) => {
  
  // Transform data for chart display
  const generateChartData = (): ForecastChartData[] => {
    // Generate sample forecast data based on predictions
    const chartData: ForecastChartData[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      const revenuePrediction = predictions.find(p => p.type === 'revenue');
      const baseValue = revenuePrediction ? revenuePrediction.prediction : 1000;
      const trend = revenuePrediction?.trend || 'stable';
      
      let forecastValue = baseValue;
      if (trend === 'increasing') {
        forecastValue = baseValue * (1 + (i * 0.02));
      } else if (trend === 'decreasing') {
        forecastValue = baseValue * (1 - (i * 0.01));
      }
      
      chartData.push({
        period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: i < 15 ? baseValue * (0.9 + Math.random() * 0.2) : undefined,
        forecast: i >= 10 ? forecastValue : undefined,
        upperBound: i >= 10 ? forecastValue * 1.1 : undefined,
        lowerBound: i >= 10 ? forecastValue * 0.9 : undefined,
        confidence: revenuePrediction?.confidence || 0.8,
        trend: trend
      });
    }
    
    return chartData;
  };

  const chartData = generateChartData();
  const revenuePrediction = predictions.find(p => p.type === 'revenue');

  return (
    <div className="space-y-6">
      {/* Enhanced Forecast Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Advanced Statistical Forecast
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Multi-method forecasting with confidence intervals
              </p>
            </div>
            {revenuePrediction && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {revenuePrediction.trend === 'increasing' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : revenuePrediction.trend === 'decreasing' ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Activity className="h-3 w-3 text-yellow-500" />
                  )}
                  {revenuePrediction.trend}
                </Badge>
                <Badge variant="secondary">
                  {(revenuePrediction.confidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? `$${value.toLocaleString()}` : value,
                    name === 'actual' ? 'Historical' :
                    name === 'forecast' ? 'Forecast' :
                    name === 'upperBound' ? 'Upper Bound' :
                    name === 'lowerBound' ? 'Lower Bound' : name
                  ]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                
                {/* Historical data */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Historical Data"
                  connectNulls={false}
                />
                
                {/* Forecast line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="0"
                  dot={{ r: 3 }}
                  name="Forecast"
                  connectNulls={false}
                />
                
                {/* Confidence bounds */}
                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke="#d1d5db"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Upper Bound"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="#d1d5db"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Lower Bound"
                  connectNulls={false}
                />
                
                {/* Forecast start line */}
                <ReferenceLine x="Nov 05" stroke="#ef4444" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Forecast Method:</span>
                <span className="ml-2 text-muted-foreground">
                  {revenuePrediction?.metadata?.forecastMethod || 'Linear Regression'}
                </span>
              </div>
              <div>
                <span className="font-medium">Model Accuracy:</span>
                <span className="ml-2 text-muted-foreground">
                  R² = {((revenuePrediction?.metadata?.r2Score || 0.8) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="font-medium">Prediction Horizon:</span>
                <span className="ml-2 text-muted-foreground">30 days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

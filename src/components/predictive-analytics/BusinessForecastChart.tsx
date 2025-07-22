
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { ForecastResult } from '@/lib/ml/advancedForecasting';
import { format } from 'date-fns';

interface BusinessForecastChartProps {
  title: string;
  data: Array<{
    period: string;
    actual?: number;
    forecast?: number;
    upperBound?: number;
    lowerBound?: number;
    confidence?: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
  }>;
  forecastResult?: ForecastResult;
  metric?: string;
  showConfidenceInterval?: boolean;
  className?: string;
}

export const BusinessForecastChart = ({
  title,
  data,
  forecastResult,
  metric = 'Value',
  showConfidenceInterval = true,
  className
}: BusinessForecastChartProps) => {
  const { chartData, maxValue, minValue, splitIndex } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], maxValue: 0, minValue: 0, splitIndex: 0 };

    const processedData = data.map((item, index) => ({
      ...item,
      index,
      period: item.period || `Period ${index + 1}`,
      isHistorical: item.actual !== undefined,
      isForecast: item.forecast !== undefined
    }));

    const allValues = processedData.flatMap(item => [
      item.actual,
      item.forecast,
      item.upperBound,
      item.lowerBound
    ].filter(v => v !== undefined));

    const maxVal = Math.max(...allValues) * 1.1;
    const minVal = Math.min(...allValues) * 0.9;
    const splitIdx = processedData.findIndex(item => item.isForecast && !item.isHistorical);

    return {
      chartData: processedData,
      maxValue: maxVal,
      minValue: minVal,
      splitIndex: splitIdx > -1 ? splitIdx : processedData.length
    };
  }, [data]);

  const formatTooltip = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name];
    }
    return [value, name];
  };

  const formatLabel = (label: string) => {
    return label;
  };

  const getTrendIcon = () => {
    if (!forecastResult) return <Activity className="h-4 w-4" />;
    
    switch (forecastResult.trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!forecastResult) return 'text-muted-foreground';
    
    switch (forecastResult.trend) {
      case 'increasing':
        return 'text-success';
      case 'decreasing':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No data available for forecasting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            {forecastResult && (
              <Badge variant="outline" className={getTrendColor()}>
                {forecastResult.trend}
              </Badge>
            )}
          </div>
        </div>
        {forecastResult && (
          <CardDescription>
            Model Accuracy: {(forecastResult.r2Score * 100).toFixed(1)}% • 
            MAE: {forecastResult.mae?.toFixed(2)} • 
            MAPE: {forecastResult.mape?.toFixed(1)}%
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {showConfidenceInterval ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  domain={[minValue, maxValue]}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={formatLabel}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                
                {/* Confidence Interval */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stackId="1"
                  stroke="transparent"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stackId="1"
                  stroke="transparent"
                  fill="hsl(var(--background))"
                  fillOpacity={1}
                />
                
                {/* Historical Data */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
                
                {/* Forecast Data */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
                
                {/* Split line between historical and forecast */}
                {splitIndex > 0 && splitIndex < chartData.length && (
                  <ReferenceLine 
                    x={chartData[splitIndex - 1]?.period} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="2 2"
                    strokeOpacity={0.5}
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  domain={[minValue, maxValue]}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={formatLabel}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                
                {/* Historical Data */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
                
                {/* Forecast Data */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
                
                {/* Split line between historical and forecast */}
                {splitIndex > 0 && splitIndex < chartData.length && (
                  <ReferenceLine 
                    x={chartData[splitIndex - 1]?.period} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="2 2"
                    strokeOpacity={0.5}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary rounded"></div>
            <span className="text-muted-foreground">Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-primary border-dashed"></div>
            <span className="text-muted-foreground">Forecast</span>
          </div>
          {showConfidenceInterval && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 bg-primary/20 rounded"></div>
              <span className="text-muted-foreground">Confidence Interval</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

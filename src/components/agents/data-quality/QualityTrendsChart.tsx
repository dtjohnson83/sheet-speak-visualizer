import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DataQualityScore } from './types';

interface QualityTrend {
  date: string;
  overall: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
  timeliness: number;
  issues: number;
}

interface QualityTrendsChartProps {
  trends: QualityTrend[];
  selectedMetric?: keyof DataQualityScore;
  onMetricSelect?: (metric: keyof DataQualityScore) => void;
}

const METRIC_COLORS = {
  overall: '#8884d8',
  completeness: '#82ca9d',
  consistency: '#ffc658',
  accuracy: '#ff7c7c',
  uniqueness: '#8dd1e1',
  timeliness: '#d084d0'
};

const METRIC_LABELS = {
  overall: 'Overall Score',
  completeness: 'Completeness',
  consistency: 'Consistency',
  accuracy: 'Accuracy',
  uniqueness: 'Uniqueness',
  timeliness: 'Timeliness'
};

export const QualityTrendsChart = ({ 
  trends, 
  selectedMetric = 'overall',
  onMetricSelect 
}: QualityTrendsChartProps) => {
  const getTrendDirection = (data: QualityTrend[]) => {
    if (data.length < 2) return 'stable';
    const first = data[0][selectedMetric];
    const last = data[data.length - 1][selectedMetric];
    const change = last - first;
    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  };

  const getTrendIcon = () => {
    const direction = getTrendDirection(trends);
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCurrentValue = () => {
    if (trends.length === 0) return 0;
    return trends[trends.length - 1][selectedMetric].toFixed(1);
  };

  const getChangePercentage = () => {
    if (trends.length < 2) return 0;
    const first = trends[0][selectedMetric];
    const last = trends[trends.length - 1][selectedMetric];
    return ((last - first) / first * 100).toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Metric Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Quality Trends
            {getTrendIcon()}
          </CardTitle>
          <CardDescription>
            Track quality metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(METRIC_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onMetricSelect?.(key as keyof DataQualityScore)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  selectedMetric === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted-foreground/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Current Value & Change */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold">
                {getCurrentValue()}%
              </div>
              <div className="text-sm text-muted-foreground">
                Current {METRIC_LABELS[selectedMetric]}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${
                getTrendDirection(trends) === 'up' ? 'text-green-600' :
                getTrendDirection(trends) === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {getChangePercentage()}%
              </span>
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, METRIC_LABELS[selectedMetric]]}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={METRIC_COLORS[selectedMetric]}
                  fill={METRIC_COLORS[selectedMetric]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Multi-metric Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Metrics Overview</CardTitle>
          <CardDescription>
            Compare all quality metrics side by side
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                {Object.entries(METRIC_COLORS).map(([metric, color]) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={METRIC_LABELS[metric as keyof DataQualityScore]}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
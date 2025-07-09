
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  FileSpreadsheet,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';

interface ReportMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: 'performance' | 'usage' | 'quality';
}

interface ReportRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: 'optimization' | 'automation' | 'quality';
}

export const ReportInsights = () => {
  const metrics: ReportMetric[] = [
    {
      id: '1',
      name: 'Average Generation Time',
      value: 45,
      change: -12,
      trend: 'down',
      category: 'performance'
    },
    {
      id: '2',
      name: 'Reports Generated',
      value: 156,
      change: 23,
      trend: 'up',
      category: 'usage'
    },
    {
      id: '3',
      name: 'Success Rate',
      value: 98.5,
      change: 2.1,
      trend: 'up',
      category: 'quality'
    },
    {
      id: '4',
      name: 'Active Recipients',
      value: 47,
      change: 8,
      trend: 'up',
      category: 'usage'
    }
  ];

  const recommendations: ReportRecommendation[] = [
    {
      id: '1',
      title: 'Optimize Daily Operations Dashboard',
      description: 'This report takes 120s to generate. Consider reducing data complexity or splitting into focused reports.',
      impact: 'high',
      effort: 'medium',
      category: 'optimization'
    },
    {
      id: '2',
      title: 'Automate Sales Territory Mapping',
      description: 'Sales team manually updates territory assignments. This could be automated based on postal codes.',
      impact: 'medium',
      effort: 'low',
      category: 'automation'
    },
    {
      id: '3',
      title: 'Add Data Validation Checks',
      description: 'Some reports show inconsistent date formats. Add validation to ensure data quality.',
      impact: 'high',
      effort: 'medium',
      category: 'quality'
    },
    {
      id: '4',
      title: 'Create Executive Summary Template',
      description: 'Executive team requests high-level dashboards. Create a template for C-suite reporting.',
      impact: 'medium',
      effort: 'high',
      category: 'automation'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'usage': return <Users className="h-4 w-4" />;
      case 'quality': return <CheckCircle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'medium': return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400';
      case 'low': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
      case 'medium': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'low': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const getRecommendationIcon = (category: string) => {
    switch (category) {
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'automation': return <Zap className="h-4 w-4" />;
      case 'quality': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Report Insights & Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Performance metrics and optimization recommendations for your automated reports
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(metric.category)}
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold">
                        {metric.name.includes('Rate') ? `${metric.value}%` : 
                         metric.name.includes('Time') ? `${metric.value}s` : metric.value}
                      </p>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Report Generation Times</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Weekly Sales Report</span>
                    <span>45s</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly Financial</span>
                    <span>120s</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Inventory Dashboard</span>
                    <span>30s</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Usage Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Most Popular Template</span>
                  <Badge variant="secondary">Weekly Sales Report</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peak Generation Time</span>
                  <Badge variant="outline">9:00 AM</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Recipients per Report</span>
                  <Badge variant="outline">3.2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Source Health</span>
                  <Badge className="bg-green-500/15 text-green-600">Excellent</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Optimization Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-blue-500/15">
                      {getRecommendationIcon(rec.category)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getImpactColor(rec.impact)}>
                          Impact: {rec.impact}
                        </Badge>
                        <Badge className={getEffortColor(rec.effort)}>
                          Effort: {rec.effort}
                        </Badge>
                        <Badge variant="outline">
                          {rec.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

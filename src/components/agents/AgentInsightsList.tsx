import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, BarChart, Users, Trash2 } from 'lucide-react';
import { AgentInsight } from '@/types/agents';
import { useAIAgents } from '@/hooks/useAIAgents';
import { formatDistanceToNow } from 'date-fns';

interface AgentInsightsListProps {
  insights: AgentInsight[];
}

export const AgentInsightsList = ({ insights }: AgentInsightsListProps) => {
  const { markInsightRead, deleteInsight, isDeletingInsight } = useAIAgents();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'correlation': return <BarChart className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'summary': return <Users className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'text-blue-600';
      case 'anomaly': return 'text-red-600';
      case 'correlation': return 'text-green-600';
      case 'recommendation': return 'text-purple-600';
      case 'summary': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-destructive';
    if (priority >= 6) return 'bg-warning';
    return 'bg-info';
  };

  const handleMarkAsRead = (insightId: string) => {
    markInsightRead(insightId);
  };

  const handleDeleteInsight = (insightId: string) => {
    if (confirm('Are you sure you want to delete this insight? This action cannot be undone.')) {
      deleteInsight(insightId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Recent Insights
        </CardTitle>
        <CardDescription>
          AI-generated insights from your data analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No insights yet</p>
              <p className="text-sm text-muted-foreground">
                Your agents will generate insights as they analyze your data
              </p>
            </div>
          ) : (
            insights.map((insight) => (
              <div 
                key={insight.id} 
                className={`p-4 border rounded-lg transition-colors ${
                  !insight.is_read ? 'bg-accent/50 border-primary/20' : 'hover:bg-accent/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={getInsightColor(insight.insight_type)}>
                      {getInsightIcon(insight.insight_type)}
                    </div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={getPriorityColor(insight.priority)}
                    >
                      Priority {insight.priority}
                    </Badge>
                    {!insight.is_read && (
                      <Badge variant="default" className="bg-primary">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.insight_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {(insight.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!insight.is_read && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAsRead(insight.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteInsight(insight.id)}
                      disabled={isDeletingInsight}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
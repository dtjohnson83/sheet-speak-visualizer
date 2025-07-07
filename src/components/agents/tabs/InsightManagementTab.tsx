import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, BarChart, Users, Trash2, TrashIcon, MoreVertical } from 'lucide-react';
import { AgentInsight } from '@/types/agents';
import { formatDistanceToNow } from 'date-fns';

interface InsightManagementTabProps {
  insights: AgentInsight[];
  onMarkInsightRead: (insightId: string) => void;
  onDeleteInsight: (insightId: string) => void;
  onClearAllInsights: (type?: 'read' | 'all') => void;
  isDeletingInsight: boolean;
  isClearingAllInsights: boolean;
}

export const InsightManagementTab = ({ 
  insights, 
  onMarkInsightRead, 
  onDeleteInsight, 
  onClearAllInsights,
  isDeletingInsight,
  isClearingAllInsights
}: InsightManagementTabProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4 text-info" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'correlation': return <BarChart className="h-4 w-4 text-success" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-warning" />;
      case 'summary': return <Users className="h-4 w-4 text-primary" />;
      default: return <Brain className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-destructive';
    if (priority >= 6) return 'bg-warning';
    return 'bg-info';
  };

  const readInsights = insights.filter(insight => insight.is_read).length;
  const unreadInsights = insights.filter(insight => !insight.is_read).length;
  const highPriorityInsights = insights.filter(insight => insight.priority >= 7).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Insights ({insights.length})
            </CardTitle>
            <CardDescription>
              AI-generated insights from your data analysis
            </CardDescription>
          </div>
          {insights.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Clear Insights
                  <MoreVertical className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Clear Read Insights ({readInsights})
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Read Insights</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {readInsights} read insights. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onClearAllInsights('read')}
                        disabled={isClearingAllInsights}
                      >
                        Clear Read
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                      Clear All Insights
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Insights</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {insights.length} insights. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onClearAllInsights('all')}
                        disabled={isClearingAllInsights}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{unreadInsights}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{readInsights}</div>
            <div className="text-sm text-muted-foreground">Read</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{highPriorityInsights}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-12">
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
                    {getInsightIcon(insight.insight_type)}
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
                        onClick={() => onMarkInsightRead(insight.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isDeletingInsight}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Insight</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this insight. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDeleteInsight(insight.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
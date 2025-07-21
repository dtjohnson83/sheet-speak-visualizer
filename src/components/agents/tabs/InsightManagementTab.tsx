
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, BarChart, Users, Trash2, TrashIcon, MoreVertical, Eye, Sparkles } from 'lucide-react';
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
      case 'trend': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'correlation': return <BarChart className="h-4 w-4 text-blue-500" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'summary': return <Users className="h-4 w-4 text-green-500" />;
      default: return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 6) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const readInsights = insights.filter(insight => insight.is_read).length;
  const unreadInsights = insights.filter(insight => !insight.is_read).length;
  const highPriorityInsights = insights.filter(insight => insight.priority >= 7).length;

  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Unread</p>
                <p className="text-2xl font-bold text-purple-900">{unreadInsights}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-gray-900">{readInsights}</p>
              </div>
              <Eye className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">High Priority</p>
                <p className="text-2xl font-bold text-red-900">{highPriorityInsights}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Insights
              </CardTitle>
              <CardDescription className="text-purple-700">
                Discover patterns and trends in your data
              </CardDescription>
            </div>
            {insights.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
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
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-lg font-medium text-purple-900 mb-2">No insights yet</p>
                <p className="text-sm text-purple-600">
                  Your agents will generate insights as they analyze your data
                </p>
              </div>
            ) : (
              insights.map((insight) => (
                <div 
                  key={insight.id} 
                  className={`p-4 border rounded-lg transition-colors ${
                    !insight.is_read 
                      ? 'bg-purple-50 border-purple-200 shadow-sm' 
                      : 'bg-white border-purple-100 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {getInsightIcon(insight.insight_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-purple-900">{insight.title}</h4>
                          <Badge className={getPriorityColor(insight.priority)}>
                            Priority {insight.priority}
                          </Badge>
                          {!insight.is_read && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              New
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs border-purple-200">
                          {insight.insight_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <p className="text-sm text-purple-700 mb-3 bg-purple-50 p-3 rounded border border-purple-200">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 px-2 py-1 rounded text-xs font-medium text-purple-700">
                        Confidence: {(insight.confidence_score * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!insight.is_read && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onMarkInsightRead(insight.id)}
                          className="border-purple-200 hover:bg-purple-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={isDeletingInsight}
                            className="text-destructive hover:text-destructive border-red-200"
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
    </div>
  );
};

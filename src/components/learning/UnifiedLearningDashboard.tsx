import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, BarChart, MessageSquare, TrendingUp, Users, Zap } from 'lucide-react';
import { useUnifiedFeedback } from '@/hooks/useUnifiedFeedback';
import { useChartFeedback } from '@/hooks/useChartFeedback';
import { useInsightFeedback } from '@/hooks/useInsightFeedback';
import { ChartLearningEngine } from '@/services/chartLearningEngine';
import { LearningEngine } from '@/services/learningEngine';
import { toast } from 'sonner';

export const UnifiedLearningDashboard: React.FC = () => {
  const [isRunningLearning, setIsRunningLearning] = useState(false);
  const [chartRules, setChartRules] = useState<any[]>([]);
  const [classificationRules, setClassificationRules] = useState<any[]>([]);
  const [learningStats, setLearningStats] = useState({
    totalFeedback: 0,
    processedFeedback: 0,
    activeRules: 0,
    averageConfidence: 0,
  });

  const { feedbackHistory } = useUnifiedFeedback();
  const { chartFeedback } = useChartFeedback();
  const { insightFeedback } = useInsightFeedback();

  const chartLearningEngine = new ChartLearningEngine();

  useEffect(() => {
    loadLearningData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [feedbackHistory, chartFeedback, insightFeedback, chartRules, classificationRules]);

  const loadLearningData = async () => {
    try {
      const [chartRulesData, classificationRulesData] = await Promise.all([
        chartLearningEngine.getActiveChartRules(),
        LearningEngine.getActiveRules(),
      ]);

      setChartRules(chartRulesData);
      setClassificationRules(classificationRulesData);
    } catch (error) {
      console.error('Error loading learning data:', error);
    }
  };

  const calculateStats = () => {
    const allFeedback = [
      ...(feedbackHistory || []),
      ...(chartFeedback || []),
      ...(insightFeedback || []),
    ];

    const totalFeedback = allFeedback.length;
    const processedFeedback = allFeedback.filter(f => f.is_processed).length;
    const activeRules = chartRules.length + classificationRules.length;
    
    const avgConfidence = activeRules > 0 
      ? ([...chartRules, ...classificationRules].reduce((sum, rule) => 
          sum + (rule.confidence_score || 0), 0) / activeRules)
      : 0;

    setLearningStats({
      totalFeedback,
      processedFeedback,
      activeRules,
      averageConfidence: avgConfidence,
    });
  };

  const runUnifiedLearning = async () => {
    setIsRunningLearning(true);
    
    try {
      toast.info('Starting unified learning process...');
      
      // Run learning for all feedback types
      await Promise.all([
        chartLearningEngine.createRulesFromChartFeedback(),
        LearningEngine.createRulesFromFeedback(),
      ]);

      // Reload learning data
      await loadLearningData();
      
      toast.success('Unified learning completed successfully!');
    } catch (error) {
      console.error('Error running unified learning:', error);
      toast.error('Failed to complete learning process');
    } finally {
      setIsRunningLearning(false);
    }
  };

  const processingProgress = learningStats.totalFeedback > 0 
    ? (learningStats.processedFeedback / learningStats.totalFeedback) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.totalFeedback}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.activeRules}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingProgress.toFixed(1)}%</div>
            <Progress value={processingProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(learningStats.averageConfidence * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Controls</CardTitle>
          <CardDescription>
            Manage the unified learning system that improves AI recommendations based on user feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runUnifiedLearning}
              disabled={isRunningLearning}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              {isRunningLearning ? 'Running Learning...' : 'Run Unified Learning'}
            </Button>
            
            {isRunningLearning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Processing feedback and generating rules...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="chart-learning" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart-learning" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Chart Learning
          </TabsTrigger>
          <TabsTrigger value="classification" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Classification
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart-learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart Learning Rules</CardTitle>
              <CardDescription>
                Rules learned from user feedback on chart recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartRules.length === 0 ? (
                <p className="text-muted-foreground">No chart learning rules generated yet.</p>
              ) : (
                <div className="space-y-4">
                  {chartRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">{rule.rule_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{rule.rule_type}</Badge>
                            <Badge variant="outline">
                              Usage: {rule.usage_count}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {(rule.confidence_score * 100).toFixed(1)}% | 
                            Success Rate: {(rule.success_rate * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classification Rules</CardTitle>
              <CardDescription>
                Rules learned from user corrections on data type classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classificationRules.length === 0 ? (
                <p className="text-muted-foreground">No classification rules generated yet.</p>
              ) : (
                <div className="space-y-4">
                  {classificationRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">{rule.rule_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{rule.rule_type}</Badge>
                            <Badge variant="outline">
                              Usage: {rule.usage_count}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Pattern: {rule.pattern} → {rule.target_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {(rule.confidence_score * 100).toFixed(1)}% | 
                            Success Rate: {(rule.success_rate * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insight Feedback Summary</CardTitle>
              <CardDescription>
                Analysis of user feedback on AI-generated insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!insightFeedback || insightFeedback.length === 0 ? (
                <p className="text-muted-foreground">No insight feedback collected yet.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {insightFeedback.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Feedback</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {insightFeedback.filter(f => (f.user_rating || 0) >= 4).length}
                      </div>
                      <p className="text-sm text-muted-foreground">Positive Ratings</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {new Set(insightFeedback.map(f => f.insight_type)).size}
                      </div>
                      <p className="text-sm text-muted-foreground">Insight Types</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
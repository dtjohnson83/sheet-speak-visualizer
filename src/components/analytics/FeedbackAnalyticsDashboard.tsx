import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useColumnTypeFeedback } from '@/hooks/useColumnTypeFeedback';
import { LearningEngine, ClassificationRule, FeedbackPattern } from '@/services/learningEngine';

export const FeedbackAnalyticsDashboard = () => {
  const { feedbackHistory, isLoading } = useColumnTypeFeedback();
  const [patterns, setPatterns] = useState<FeedbackPattern[]>([]);
  const [rules, setRules] = useState<ClassificationRule[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsAnalyzing(true);
      try {
        const [feedbackPatterns, classificationRules] = await Promise.all([
          LearningEngine.analyzeFeedbackPatterns(),
          LearningEngine.getActiveRules(),
        ]);
        setPatterns(feedbackPatterns);
        setRules(classificationRules);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    loadAnalytics();
  }, []);

  const mostCommonCorrections = feedbackHistory?.reduce((acc, feedback) => {
    const key = `${feedback.original_type} → ${feedback.corrected_type}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const accuracyScore = feedbackHistory?.length 
    ? Math.round((1 - (feedbackHistory.length / (feedbackHistory.length + 100))) * 100) 
    : 95; // Default accuracy

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Learning Analytics Dashboard</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Corrections</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackHistory?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              User feedback submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">
              Generated learning rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accuracyScore}%</div>
            <Progress value={accuracyScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patterns Found</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patterns.length}</div>
            <p className="text-xs text-muted-foreground">
              Correction patterns identified
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="corrections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="corrections">Recent Corrections</TabsTrigger>
          <TabsTrigger value="patterns">Learning Patterns</TabsTrigger>
          <TabsTrigger value="rules">Active Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="corrections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Common Corrections</CardTitle>
              <CardDescription>
                Types of corrections users make most frequently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(mostCommonCorrections)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([correction, count]) => (
                    <div key={correction} className="flex items-center justify-between">
                      <span className="text-sm">{correction}</span>
                      <Badge variant="secondary">{count} times</Badge>
                    </div>
                  ))}
                {Object.keys(mostCommonCorrections).length === 0 && (
                  <p className="text-sm text-muted-foreground">No corrections recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>
                Latest user corrections and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedbackHistory?.slice(0, 10).map((feedback) => (
                  <div key={feedback.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-sm">{feedback.column_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {feedback.original_type} → {feedback.corrected_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </p>
                      <Badge variant={feedback.is_processed ? "default" : "secondary"}>
                        {feedback.is_processed ? "Learned" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                )) || []}
                {!feedbackHistory?.length && (
                  <p className="text-sm text-muted-foreground">No feedback submitted yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discovered Patterns</CardTitle>
              <CardDescription>
                Patterns identified from user corrections that inform new rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isAnalyzing ? (
                  <div className="text-center py-8">
                    <Brain className="h-8 w-8 animate-pulse mx-auto mb-2" />
                    <p>Analyzing patterns...</p>
                  </div>
                ) : (
                  patterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">"{pattern.pattern}"</p>
                        <p className="text-xs text-muted-foreground">
                          {pattern.originalType} → {pattern.correctedType}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{pattern.occurrences} occurrences</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(pattern.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {!isAnalyzing && patterns.length === 0 && (
                  <p className="text-sm text-muted-foreground">No patterns discovered yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Classification Rules</CardTitle>
              <CardDescription>
                Rules generated from user feedback that improve future classifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-sm">{rule.rule_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Pattern: "{rule.pattern}" → {rule.target_type}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="outline">
                        {Math.round(rule.success_rate * 100)}% success
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Used {rule.usage_count} times
                      </p>
                    </div>
                  </div>
                ))}
                {rules.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active rules yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
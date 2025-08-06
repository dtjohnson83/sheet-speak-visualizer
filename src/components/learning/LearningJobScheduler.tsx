import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, PauseCircle, RefreshCw, Brain, Clock } from 'lucide-react';
import { LearningEngine } from '@/services/learningEngine';
import { toast } from 'sonner';

export const LearningJobScheduler = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [autoLearnEnabled, setAutoLearnEnabled] = useState(true);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    rulesCreated: 0,
    feedbackProcessed: 0,
    patternsFound: 0,
  });

  useEffect(() => {
    // Load scheduler status from localStorage
    const savedState = localStorage.getItem('learning-scheduler-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      setAutoLearnEnabled(state.autoLearnEnabled);
      if (state.lastRunTime) {
        setLastRunTime(new Date(state.lastRunTime));
      }
    }

    // Set up auto-learning interval if enabled
    if (autoLearnEnabled) {
      const interval = setInterval(() => {
        runLearningJob();
      }, 5 * 60 * 1000); // Run every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoLearnEnabled]);

  const saveSchedulerState = () => {
    const state = {
      autoLearnEnabled,
      lastRunTime: lastRunTime?.toISOString(),
    };
    localStorage.setItem('learning-scheduler-state', JSON.stringify(state));
  };

  const runLearningJob = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    
    try {
      // Step 1: Analyze feedback patterns
      setProgress(25);
      const patterns = await LearningEngine.analyzeFeedbackPatterns();
      
      // Step 2: Create new rules from patterns
      setProgress(50);
      await LearningEngine.createRulesFromFeedback();
      
      // Step 3: Get updated statistics
      setProgress(75);
      const rules = await LearningEngine.getActiveRules();
      
      setProgress(100);
      setStats({
        rulesCreated: rules.length,
        feedbackProcessed: 0, // This would be calculated based on processed feedback
        patternsFound: patterns.length,
      });

      setLastRunTime(new Date());
      saveSchedulerState();
      
      toast.success(`Learning job completed: ${patterns.length} patterns analyzed, ${rules.length} rules active`);
    } catch (error) {
      console.error('Learning job failed:', error);
      toast.error('Learning job failed - check console for details');
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const handleAutoLearnToggle = (enabled: boolean) => {
    setAutoLearnEnabled(enabled);
    if (enabled) {
      toast.info('Auto-learning enabled - will run every 5 minutes');
    } else {
      toast.info('Auto-learning disabled');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Learning Job Scheduler</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scheduler Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduler Controls
            </CardTitle>
            <CardDescription>
              Manage automatic learning from user feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Learning</p>
                <p className="text-sm text-muted-foreground">
                  Automatically process feedback every 5 minutes
                </p>
              </div>
              <Switch
                checked={autoLearnEnabled}
                onCheckedChange={handleAutoLearnToggle}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={runLearningJob}
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Now
                  </>
                )}
              </Button>
              
              {isRunning && (
                <Button
                  variant="outline"
                  onClick={() => setIsRunning(false)}
                >
                  <PauseCircle className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {lastRunTime && (
              <div className="text-sm text-muted-foreground">
                Last run: {lastRunTime.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Statistics</CardTitle>
            <CardDescription>
              Results from the latest learning job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Rules</span>
                <Badge variant="secondary">{stats.rulesCreated}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Patterns Found</span>
                <Badge variant="secondary">{stats.patternsFound}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Feedback Processed</span>
                <Badge variant="secondary">{stats.feedbackProcessed}</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  autoLearnEnabled && !isRunning ? 'bg-green-500' : 
                  isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-muted-foreground">
                  {autoLearnEnabled && !isRunning ? 'Active' : 
                   isRunning ? 'Processing' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Learning Activity</CardTitle>
          <CardDescription>
            Latest improvements to the classification system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.rulesCreated > 0 ? (
              <div className="flex items-center gap-3 p-3 border rounded">
                <Brain className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    New classification rules generated
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.rulesCreated} new rules from user feedback patterns
                  </p>
                </div>
                <Badge variant="outline">Success</Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No recent learning activity. Submit column type corrections to generate learning data.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Pause,
  AlertCircle,
  Circle,
  CheckCircle
} from 'lucide-react';
import { TaskType } from '@/types/agents';

export const AgentTestingPanel = () => {
  const [selectedTask, setSelectedTask] = useState<TaskType>('analyze_data');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const availableTasks: Array<{ type: TaskType; label: string; description: string }> = [
    { type: 'analyze_data', label: 'Analyze Data', description: 'Perform comprehensive data analysis' },
    { type: 'generate_insights', label: 'Generate Insights', description: 'Generate actionable insights from data' },
    { type: 'detect_anomalies', label: 'Detect Anomalies', description: 'Find unusual patterns in the data' },
    { type: 'analyze_trends', label: 'Analyze Trends', description: 'Identify trends and patterns over time' },
    { type: 'find_correlations', label: 'Find Correlations', description: 'Discover correlations between variables' },
    { type: 'create_visualization', label: 'Create Visualization', description: 'Generate appropriate visualizations' }
  ];

  const simulateTask = (taskType: TaskType): any => {
    switch (taskType) {
      case 'analyze_data':
        return {
          success: true,
          message: 'Data analysis completed successfully',
          data: {
            summary: 'Dataset contains 1000 rows and 10 columns',
            insights: ['Average age is 35', 'Most common location is New York']
          },
          timestamp: new Date().toISOString()
        };
      case 'generate_insights':
        return {
          success: true,
          message: 'Insights generated',
          data: ['Customers aged 25-35 prefer product A', 'Sales increased by 10% last month'],
          timestamp: new Date().toISOString()
        };
      case 'detect_anomalies':
        return {
          success: true,
          message: 'Anomalies detected',
          data: ['Sales drop in California on 2024-01-15', 'Unexpected increase in website traffic from Russia'],
          timestamp: new Date().toISOString()
        };
      case 'analyze_trends':
        return {
          success: true,
          message: 'Trends analyzed',
          data: ['Sales are increasing in Europe', 'Website traffic is decreasing on weekends'],
          timestamp: new Date().toISOString()
        };
      case 'find_correlations':
        return {
          success: true,
          message: 'Correlations found',
          data: ['Age is positively correlated with income', 'Location is correlated with product preference'],
          timestamp: new Date().toISOString()
        };
      case 'create_visualization':
        return {
          success: true,
          message: 'Visualization created',
          data: {
            chartType: 'Bar Chart',
            chartData: { labels: ['A', 'B', 'C'], values: [10, 20, 30] }
          },
          timestamp: new Date().toISOString()
        };
      default:
        return {
          success: false,
          error: 'Unknown task type',
          data: null,
          timestamp: new Date().toISOString()
        };
    }
  };

  const runTest = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const taskResult = simulateTask(selectedTask);
      setResult(taskResult);
    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        error: 'Test execution failed',
        data: null,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-success" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-muted-foreground" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Testing Panel</CardTitle>
        <CardDescription>Simulate agent tasks for testing purposes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="task-select">Select Task</Label>
          <Select onValueChange={(value) => setSelectedTask(value as TaskType)}>
            <SelectTrigger id="task-select">
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {availableTasks.map((task) => (
                <SelectItem key={task.type} value={task.type}>
                  {task.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={runTest} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Test'}
        </Button>

        {result && (
          <div className="mt-4">
            {result.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

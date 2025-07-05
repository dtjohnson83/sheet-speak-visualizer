import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  BarChart, 
  Layout, 
  Sparkles,
  Target,
  X
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  actionText?: string;
  targetTab?: string;
}

interface GettingStartedChecklistProps {
  hasData: boolean;
  hasCharts: boolean;
  hasDashboard: boolean;
  hasUsedAI: boolean;
  onActionClick?: (targetTab: string) => void;
  onDismiss?: () => void;
}

export const GettingStartedChecklist: React.FC<GettingStartedChecklistProps> = ({
  hasData,
  hasCharts,
  hasDashboard,
  hasUsedAI,
  onActionClick,
  onDismiss
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Check if checklist was dismissed in localStorage
  useEffect(() => {
    const isDismissed = localStorage.getItem('getting-started-dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'upload-data',
      title: 'Upload Your First Dataset',
      description: 'Connect a data source or upload a CSV/Excel file to get started',
      icon: Upload,
      completed: hasData,
      actionText: 'Upload Data',
      targetTab: 'data-sources'
    },
    {
      id: 'create-chart',
      title: 'Create Your First Visualization',
      description: 'Turn your data into a beautiful chart or graph',
      icon: BarChart,
      completed: hasCharts,
      actionText: 'Create Chart',
      targetTab: 'charts'
    },
    {
      id: 'build-dashboard',
      title: 'Build a Dashboard',
      description: 'Save charts as tiles and create an interactive dashboard',
      icon: Layout,
      completed: hasDashboard,
      actionText: 'View Dashboard',
      targetTab: 'dashboard'
    },
    {
      id: 'try-ai',
      title: 'Try AI Features',
      description: 'Ask questions about your data or get AI-generated insights',
      icon: Sparkles,
      completed: hasUsedAI,
      actionText: 'Try AI Chat',
      targetTab: 'ai-chat'
    }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('getting-started-dismissed', 'true');
    onDismiss?.();
  };

  const handleActionClick = (targetTab: string) => {
    onActionClick?.(targetTab);
  };

  // Don't render if dismissed or completed
  if (dismissed || isComplete) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Getting Started</CardTitle>
                  <CardDescription>
                    Complete these steps to unlock the full power of Chartuvo
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3">
                  {completedCount}/{totalCount}
                </Badge>
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}>
                  <X className="h-4 w-4" />
                </Button>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2 mt-3" />
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    item.completed 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                      : 'bg-background border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <item.icon className={`h-5 w-5 ${
                      item.completed ? 'text-green-600' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${
                        item.completed ? 'text-green-700 dark:text-green-300' : 'text-foreground'
                      }`}>
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {!item.completed && item.actionText && item.targetTab && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActionClick(item.targetTab!)}
                      className="shrink-0"
                    >
                      {item.actionText}
                    </Button>
                  )}
                  
                  {item.completed && (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                      Complete
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            {progress > 0 && progress < 100 && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-center text-muted-foreground">
                  You're {Math.round(progress)}% of the way there! 
                  {completedCount === 1 && " Great start! "}
                  {completedCount === 2 && " You're making progress! "}
                  {completedCount === 3 && " Almost done! "}
                  Keep going to unlock all features.
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X, Upload, BarChart, Layout, Sparkles } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  target?: string;
  content: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Chartuvo',
    description: 'Your intelligent data visualization platform',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Welcome to Chartuvo!</h3>
          <p className="text-muted-foreground mb-6">
            Let's take a quick tour to help you get started with creating amazing data visualizations.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium">Upload Data</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <BarChart className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium">Create Charts</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Layout className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium">Build Dashboards</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-amber-600" />
            <p className="text-sm font-medium">AI Insights</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'upload',
    title: 'Get Your Data',
    description: 'Start with demo data or upload your own files',
    icon: Upload,
    target: 'data-sources-tab',
    content: (
      <div className="space-y-4">
        <Upload className="h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-xl font-bold">Get Your Data Ready</h3>
        <p className="text-muted-foreground">
          Click on the "Data Sources" tab to upload your first dataset. We support:
        </p>
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            🚀 New to data analysis?
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Try our <strong>Demo Data</strong> tab for instant exploration with sample business datasets!
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Sample datasets (Sales, E-commerce, Finance, Marketing)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            CSV and Excel files (.xlsx, .xls)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Google Sheets integration
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Database connections & REST APIs
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'charts',
    title: 'Create Visualizations',
    description: 'Turn your data into beautiful charts and graphs',
    icon: BarChart,
    target: 'charts-tab',
    content: (
      <div className="space-y-4">
        <BarChart className="h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-xl font-bold">Create Your First Chart</h3>
        <p className="text-muted-foreground">
          Once you have data loaded, navigate to the "Charts" tab to create visualizations.
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Badge variant="secondary">Bar Charts</Badge>
          <Badge variant="secondary">Line Charts</Badge>
          <Badge variant="secondary">Pie Charts</Badge>
          <Badge variant="secondary">Scatter Plots</Badge>
          <Badge variant="secondary">Heatmaps</Badge>
          <Badge variant="secondary">Treemaps</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Our AI will suggest the best chart types based on your data!
        </p>
      </div>
    )
  },
  {
    id: 'dashboard',
    title: 'Build Dashboards',
    description: 'Combine multiple charts into interactive dashboards',
    icon: Layout,
    target: 'dashboard-tab',
    content: (
      <div className="space-y-4">
        <Layout className="h-12 w-12 text-purple-600 mb-4" />
        <h3 className="text-xl font-bold">Build Interactive Dashboards</h3>
        <p className="text-muted-foreground">
          Save your charts as tiles and arrange them in the Dashboard tab.
        </p>
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Pro Tip:</p>
          <p className="text-sm text-muted-foreground">
            Click "Save as Tile" when creating charts to add them to your dashboard!
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'ai',
    title: 'AI-Powered Insights',
    description: 'Let AI analyze your data and provide intelligent recommendations',
    icon: Sparkles,
    target: 'ai-chat-tab',
    content: (
      <div className="space-y-4">
        <Sparkles className="h-12 w-12 text-amber-600 mb-4" />
        <h3 className="text-xl font-bold">AI-Powered Analysis</h3>
        <p className="text-muted-foreground">
          Explore the AI features to get intelligent insights about your data:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            AI Chat - Ask questions about your data
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            AI Reports - Get automated summaries
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            Data Quality - Automated quality checks
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            Predictive Analytics - Forecast trends
          </li>
        </ul>
      </div>
    )
  }
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleNext = () => {
    const step = tutorialSteps[currentStep];
    setCompletedSteps(prev => new Set(prev).add(step.id));
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const step = tutorialSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <step.icon className="h-5 w-5" />
              {step.title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardContent className="p-6">
              {step.content}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tutorial
              </Button>
              <Button onClick={handleNext}>
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep !== tutorialSteps.length - 1 && (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
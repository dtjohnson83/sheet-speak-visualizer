import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface WorkflowProgressIndicatorProps {
  hasData: boolean;
  hasCharts: boolean;
  hasAIContext: boolean;
}

export const WorkflowProgressIndicator = ({
  hasData,
  hasCharts,
  hasAIContext
}: WorkflowProgressIndicatorProps) => (
  <Card className="p-4 bg-muted/30">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${hasData ? 'bg-green-500 dark:bg-green-400' : 'bg-muted-foreground/30'}`} />
        <span className="text-sm font-medium">Data Connected</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${hasCharts ? 'bg-green-500 dark:bg-green-400' : 'bg-muted-foreground/30'}`} />
        <span className="text-sm font-medium">Charts Created</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${hasAIContext ? 'bg-green-500 dark:bg-green-400' : 'bg-muted-foreground/30'}`} />
        <span className="text-sm font-medium">AI Ready</span>
      </div>
    </div>
  </Card>
);
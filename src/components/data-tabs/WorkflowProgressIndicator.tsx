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
  <Card className="p-6 bg-muted/20 border border-muted/30">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-4 w-4 rounded-full transition-all duration-300 ${
          hasData ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-muted-foreground/20'
        }`} />
        <span className="text-sm font-semibold text-foreground">Data Connected</span>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
      <div className="flex items-center gap-3">
        <div className={`h-4 w-4 rounded-full transition-all duration-300 ${
          hasCharts ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-muted-foreground/20'
        }`} />
        <span className="text-sm font-semibold text-foreground">Charts Created</span>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
      <div className="flex items-center gap-3">
        <div className={`h-4 w-4 rounded-full transition-all duration-300 ${
          hasAIContext ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-muted-foreground/20'
        }`} />
        <span className="text-sm font-semibold text-foreground">AI Ready</span>
      </div>
    </div>
  </Card>
);
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useChecklistState } from './hooks/useChecklistState';
import { ChecklistHeader } from './components/ChecklistHeader';
import { ChecklistItem } from './components/ChecklistItem';
import { ChecklistProgress } from './components/ChecklistProgress';
import { getChecklistItems } from './config/checklistItems';

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
  const {
    isExpanded,
    setIsExpanded,
    dismissed,
    completedCount,
    totalCount,
    progress,
    isComplete,
    handleDismiss
  } = useChecklistState(hasData, hasCharts, hasDashboard, hasUsedAI);

  // Don't render if dismissed or completed
  if (dismissed || isComplete) {
    return null;
  }

  const checklistItems = getChecklistItems().map(item => ({
    ...item,
    completed: item.id === 'upload-data' ? hasData :
               item.id === 'create-chart' ? hasCharts :
               item.id === 'build-dashboard' ? hasDashboard :
               item.id === 'try-ai' ? hasUsedAI : false
  }));

  const handleActionClick = (targetTab: string) => {
    onActionClick?.(targetTab);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <ChecklistHeader
            isExpanded={isExpanded}
            completedCount={completedCount}
            totalCount={totalCount}
            progress={progress}
            onToggle={() => setIsExpanded(!isExpanded)}
            onDismiss={() => handleDismiss(onDismiss)}
          />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  onActionClick={handleActionClick}
                />
              ))}
            </div>
            
            <ChecklistProgress progress={progress} completedCount={completedCount} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
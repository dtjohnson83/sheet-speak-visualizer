import { useState, useEffect } from 'react';

export const useChecklistState = (
  hasData: boolean,
  hasCharts: boolean,
  hasDashboard: boolean,
  hasUsedAI: boolean
) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Check if checklist was dismissed in localStorage
  useEffect(() => {
    const isDismissed = localStorage.getItem('getting-started-dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  // Calculate progress
  const checklistItems = [
    { id: 'upload-data', completed: hasData },
    { id: 'create-chart', completed: hasCharts },
    { id: 'build-dashboard', completed: hasDashboard },
    { id: 'try-ai', completed: hasUsedAI }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  const handleDismiss = (onDismiss?: () => void) => {
    setDismissed(true);
    localStorage.setItem('getting-started-dismissed', 'true');
    onDismiss?.();
  };

  return {
    isExpanded,
    setIsExpanded,
    dismissed,
    completedCount,
    totalCount,
    progress,
    isComplete,
    handleDismiss
  };
};
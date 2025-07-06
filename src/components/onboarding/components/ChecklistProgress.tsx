import React from 'react';

interface ChecklistProgressProps {
  progress: number;
  completedCount: number;
}

export const ChecklistProgress: React.FC<ChecklistProgressProps> = ({ progress, completedCount }) => {
  if (progress <= 0 || progress >= 100) return null;

  const getProgressMessage = () => {
    if (completedCount === 1) return " Great start! ";
    if (completedCount === 2) return " You're making progress! ";
    if (completedCount === 3) return " Almost done! ";
    return "";
  };

  return (
    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
      <p className="text-sm text-center text-muted-foreground">
        You're {Math.round(progress)}% of the way there!
        {getProgressMessage()}
        Keep going to unlock all features.
      </p>
    </div>
  );
};
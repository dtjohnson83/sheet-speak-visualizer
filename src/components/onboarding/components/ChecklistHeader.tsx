import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, X, ChevronUp, ChevronDown } from 'lucide-react';

interface ChecklistHeaderProps {
  isExpanded: boolean;
  completedCount: number;
  totalCount: number;
  progress: number;
  onToggle: () => void;
  onDismiss: () => void;
}

export const ChecklistHeader: React.FC<ChecklistHeaderProps> = ({
  isExpanded,
  completedCount,
  totalCount,
  progress,
  onToggle,
  onDismiss
}) => {
  return (
    <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={onToggle}>
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
            onDismiss();
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
  );
};
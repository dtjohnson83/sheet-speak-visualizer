import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';

interface ChecklistItemData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  actionText?: string;
  targetTab?: string;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  onActionClick: (targetTab: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onActionClick }) => {
  return (
    <div
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
          onClick={() => onActionClick(item.targetTab!)}
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
  );
};
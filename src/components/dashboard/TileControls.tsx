
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Move } from 'lucide-react';

interface TileControlsProps {
  title: string;
  onRemove: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const TileControls = ({ title, onRemove, onMouseDown }: TileControlsProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium truncate">{title}</h4>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={onMouseDown}
          className="h-6 w-6 p-0 cursor-move"
        >
          <Move className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

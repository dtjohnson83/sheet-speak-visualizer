
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Move, Edit2, Check } from 'lucide-react';

interface TileControlsProps {
  title: string;
  onRemove: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onTitleChange?: (title: string) => void;
}

export const TileControls = ({ title, onRemove, onMouseDown, onTitleChange }: TileControlsProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempTitle(title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (onTitleChange) {
      onTitleChange(tempTitle.trim() || title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setTempTitle('');
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex items-center justify-between mb-3">
      {isEditingTitle ? (
        <div className="flex items-center gap-1 flex-1 mr-2">
          <Input
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-sm font-medium h-6 px-2"
            placeholder="Enter title"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveTitle}
            className="h-6 w-6 p-0"
          >
            <Check className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1 flex-1">
          <h4 className="tile-title text-sm font-medium truncate">{title}</h4>
          {onTitleChange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30 relative">
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={onMouseDown}
          className="h-6 w-6 p-0 cursor-move hover:bg-accent/50"
          title="Move tile"
        >
          <Move className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
          title="Remove tile"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

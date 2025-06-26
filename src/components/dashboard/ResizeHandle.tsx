
import React from 'react';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle = ({ onMouseDown }: ResizeHandleProps) => {
  return (
    <div
      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
      onMouseDown={onMouseDown}
    >
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 rotate-45"></div>
    </div>
  );
};

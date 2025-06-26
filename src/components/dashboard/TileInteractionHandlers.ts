
import { useState, useRef, useEffect } from 'react';

export interface TilePosition {
  x: number;
  y: number;
}

export interface TileSize {
  width: number;
  height: number;
}

export interface UseTileInteractionsProps {
  tileId: string;
  position: TilePosition;
  size: TileSize;
  onUpdate?: (id: string, updates: { position?: TilePosition; size?: TileSize }) => void;
}

export const useTileInteractions = ({ tileId, position, size, onUpdate }: UseTileInteractionsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const tileRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onUpdate || isResizing) return;
    
    setIsDragging(true);
    const rect = tileRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!onUpdate) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isResizing && onUpdate) {
      const parentRect = tileRef.current?.parentElement?.getBoundingClientRect();
      if (parentRect) {
        const newX = Math.max(0, e.clientX - parentRect.left - dragOffset.x);
        const newY = Math.max(0, e.clientY - parentRect.top - dragOffset.y);
        
        onUpdate(tileId, { position: { x: newX, y: newY } });
      }
    } else if (isResizing && onUpdate) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(200, resizeStart.width + deltaX);
      const newHeight = Math.max(150, resizeStart.height + deltaY);
      
      onUpdate(tileId, { size: { width: newWidth, height: newHeight } });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, onUpdate, tileId, resizeStart]);

  return {
    tileRef,
    isDragging,
    isResizing,
    handleMouseDown,
    handleResizeMouseDown
  };
};

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableChartContainerProps {
  children: React.ReactNode;
  dataLength?: number;
  minWidth?: number;
  className?: string;
}

export const ScrollableChartContainer: React.FC<ScrollableChartContainerProps> = ({
  children,
  dataLength = 0,
  minWidth = 800,
  className = ''
}) => {
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate optimal width based on data points
  const calculateOptimalWidth = () => {
    if (dataLength <= 6) return '100%';
    
    // For charts with many data points, give each point at least 80px for better readability
    const calculatedWidth = Math.max(minWidth, dataLength * 80);
    return `${calculatedWidth}px`;
  };

  const optimalWidth = calculateOptimalWidth();
  const needsScroll = optimalWidth !== '100%';

  // Check scroll position to show/hide indicators
  const checkScrollPosition = () => {
    if (!scrollRef.current || !needsScroll) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftIndicator(scrollLeft > 0);
    setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, [needsScroll, optimalWidth]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={scrollRef}
        className={`
          ${needsScroll ? 'overflow-x-auto overflow-y-hidden' : ''}
          scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent
          scroll-smooth
        `}
        style={{
          scrollbarGutter: 'stable'
        }}
      >
        <div 
          style={{ 
            width: optimalWidth,
            minWidth: needsScroll ? minWidth : 'auto'
          }}
          className="transition-all duration-300"
        >
          {children}
        </div>
      </div>

      {/* Scroll Indicators */}
      {needsScroll && showLeftIndicator && (
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border rounded-full p-1 shadow-md hover:bg-background transition-colors"
          title="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      
      {needsScroll && showRightIndicator && (
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border rounded-full p-1 shadow-md hover:bg-background transition-colors"
          title="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Scroll Hint */}
      {needsScroll && !showLeftIndicator && !showRightIndicator && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border">
          Scroll horizontally to view more data
        </div>
      )}
    </div>
  );
};
import React from 'react';

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
  // Calculate optimal width based on data points
  const calculateOptimalWidth = () => {
    if (dataLength <= 10) return '100%';
    
    // For charts with many data points, give each point at least 60px
    const calculatedWidth = Math.max(minWidth, dataLength * 60);
    return `${calculatedWidth}px`;
  };

  const optimalWidth = calculateOptimalWidth();
  const needsScroll = optimalWidth !== '100%';

  return (
    <div 
      className={`
        ${needsScroll ? 'overflow-x-auto overflow-y-hidden' : ''}
        scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent
        ${className}
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
  );
};
import React from 'react';
import { TemporalAnimationState } from '@/hooks/useTemporalAnimation';

interface AnimatedChartContainerProps {
  children: React.ReactNode;
  isTemporalAnimated?: boolean;
  animationState?: TemporalAnimationState;
  className?: string;
}

export const AnimatedChartContainer = ({
  children,
  isTemporalAnimated,
  animationState,
  className = ''
}: AnimatedChartContainerProps) => {
  const isAnimating = isTemporalAnimated && animationState?.isPlaying;
  
  return (
    <div 
      className={`
        relative rounded-lg overflow-hidden transition-all duration-300
        ${isTemporalAnimated ? 'ring-2 ring-primary/20' : ''}
        ${isAnimating ? 'ring-primary/50 shadow-lg shadow-primary/10' : ''}
        ${className}
      `}
    >
      {/* Animation indicator */}
      {isTemporalAnimated && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <div className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${isAnimating ? 'bg-red-500 animate-pulse' : 'bg-primary/50'}
          `} />
          <span className="text-xs bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-foreground">
            {isAnimating ? 'Recording' : 'Temporal'}
          </span>
        </div>
      )}
      
      {/* Current time display */}
      {isTemporalAnimated && animationState?.currentFrameData?.timeLabel && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded text-sm font-medium text-foreground border">
            {animationState.currentFrameData.timeLabel}
          </div>
        </div>
      )}
      
      {/* Chart content */}
      <div className={`
        transition-all duration-200
        ${isTemporalAnimated ? 'bg-background/50' : ''}
      `}>
        {children}
      </div>
    </div>
  );
};
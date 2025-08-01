import React from 'react';
import { Slider } from '@/components/ui/slider';
import { TemporalAnimationState, TemporalAnimationControls } from '@/hooks/useTemporalAnimation';
import { formatDistanceToNow } from 'date-fns';

interface TemporalTimelineSliderProps {
  state: TemporalAnimationState;
  controls: TemporalAnimationControls;
  className?: string;
}

export const TemporalTimelineSlider = ({ state, controls, className }: TemporalTimelineSliderProps) => {
  if (!state.currentFrameData || state.totalFrames <= 1) {
    return null;
  }

  const handleSliderChange = (values: number[]) => {
    const frameIndex = values[0];
    controls.jumpToFrame(frameIndex);
  };

  const formatTimeLabel = (timestamp: number | string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className={`bg-background/80 backdrop-blur-sm border rounded-lg p-3 space-y-2 ${className}`}>
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Timeline</span>
          {state.currentFrameData.timestamp && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
              {formatTimeLabel(state.currentFrameData.timestamp)}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {state.currentFrame + 1} / {state.totalFrames}
        </span>
      </div>
      
      {/* Timeline Slider */}
      <div className="space-y-2">
        <Slider
          value={[state.currentFrame]}
          onValueChange={handleSliderChange}
          max={state.totalFrames - 1}
          min={0}
          step={1}
          className="w-full"
        />
        
        {/* Timeline Labels */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Start</span>
          <span>End</span>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={controls.previousFrame}
          disabled={state.currentFrame === 0}
          className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="w-1 h-1 bg-primary rounded-full" />
          <span>Frame {state.currentFrame + 1}</span>
        </div>
        
        <button
          onClick={controls.nextFrame}
          disabled={state.currentFrame === state.totalFrames - 1}
          className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
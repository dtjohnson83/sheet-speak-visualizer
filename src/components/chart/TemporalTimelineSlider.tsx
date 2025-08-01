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
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Timeline</span>
        <span>{state.currentFrame + 1} / {state.totalFrames}</span>
      </div>
      
      <div className="space-y-1">
        <Slider
          value={[state.currentFrame]}
          onValueChange={handleSliderChange}
          max={state.totalFrames - 1}
          min={0}
          step={1}
          className="w-full"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Start</span>
          {state.currentFrameData.timestamp && (
            <span className="font-medium text-foreground">
              {formatTimeLabel(state.currentFrameData.timestamp)}
            </span>
          )}
          <span>End</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-xs">
        <button
          onClick={controls.previousFrame}
          disabled={state.currentFrame === 0}
          className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <button
          onClick={controls.nextFrame}
          disabled={state.currentFrame === state.totalFrames - 1}
          className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { TemporalAnimationState, TemporalAnimationControls } from '@/hooks/useTemporalAnimation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FloatingTemporalControlsProps {
  state: TemporalAnimationState;
  controls: TemporalAnimationControls;
  showAdvanced?: boolean;
  children?: React.ReactNode;
}

export const FloatingTemporalControls = ({
  state,
  controls,
  showAdvanced = false,
  children
}: FloatingTemporalControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute top-2 right-2 z-20 max-w-xs">
      {/* Main Control Bar */}
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-2">
          {/* Current Time Display */}
          {state.currentFrameData?.timeLabel && (
            <div className="text-xs font-medium text-foreground px-2 py-1 bg-primary/10 rounded">
              {state.currentFrameData.timeLabel}
            </div>
          )}
          
          {/* Play/Pause Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={controls.togglePlay}
            className="h-8 w-8 p-0 hover:bg-primary/10"
            title={state.isPlaying ? "Pause Animation" : "Play Animation"}
          >
            {state.isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>

          {/* Reset Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={controls.reset}
            className="h-8 w-8 p-0 hover:bg-primary/10"
            title="Reset Animation to Start"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>



          {/* Advanced Settings Toggle */}
          {showAdvanced && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                  title="Animation Settings"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full bg-secondary h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${state.progress * 100}%` }}
          />
        </div>

        {/* Frame Counter */}
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span>Frame {state.currentFrame + 1} / {state.totalFrames}</span>
        </div>
      </div>

      {/* Expandable Advanced Settings */}
      {showAdvanced && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="mt-2">
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 space-y-3">
              {children}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
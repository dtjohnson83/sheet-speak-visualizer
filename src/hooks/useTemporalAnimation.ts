import { useState, useEffect, useCallback, useRef } from 'react';
import { TemporalFrame, TemporalAnimationConfig } from '@/lib/chart/temporalDataProcessor';

export interface TemporalAnimationState {
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  currentFrameData: TemporalFrame | null;
  progress: number; // 0-1
}

export interface TemporalAnimationControls {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  reset: () => void;
  jumpToFrame: (frameIndex: number) => void;
  nextFrame: () => void;
  previousFrame: () => void;
  setSpeed: (speed: number) => void;
  setLoop: (loop: boolean) => void;
}

export const useTemporalAnimation = (
  frames: TemporalFrame[],
  config: TemporalAnimationConfig
) => {
  const [state, setState] = useState<TemporalAnimationState>({
    isPlaying: false,
    currentFrame: 0,
    totalFrames: frames.length,
    currentFrameData: frames[0] || null,
    progress: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(config.animationSpeed || 1000);
  const [loop, setLoop] = useState(config.loop || false);

  // Update state when frames change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      totalFrames: frames.length,
      currentFrameData: frames[prev.currentFrame] || frames[0] || null,
      progress: frames.length > 0 ? prev.currentFrame / (frames.length - 1) : 0
    }));
  }, [frames]);

  // Auto-play on load if configured
  useEffect(() => {
    if (config.autoPlay && frames.length > 0) {
      play();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config.autoPlay, frames.length]);

  const updateFrame = useCallback((frameIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(frameIndex, frames.length - 1));
    const progress = frames.length > 1 ? clampedIndex / (frames.length - 1) : 0;
    
    setState(prev => ({
      ...prev,
      currentFrame: clampedIndex,
      currentFrameData: frames[clampedIndex] || null,
      progress
    }));
  }, [frames]);

  const play = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setState(prev => ({ ...prev, isPlaying: true }));

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const nextFrame = prev.currentFrame + 1;
        
        if (nextFrame >= frames.length) {
          if (loop) {
            updateFrame(0);
            return prev;
          } else {
            // End of animation
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return { ...prev, isPlaying: false };
          }
        } else {
          updateFrame(nextFrame);
          return prev;
        }
      });
    }, animationSpeed);
  }, [animationSpeed, loop, frames.length, updateFrame]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const reset = useCallback(() => {
    pause();
    updateFrame(0);
  }, [pause, updateFrame]);

  const jumpToFrame = useCallback((frameIndex: number) => {
    updateFrame(frameIndex);
  }, [updateFrame]);

  const nextFrame = useCallback(() => {
    const nextIndex = Math.min(state.currentFrame + 1, frames.length - 1);
    updateFrame(nextIndex);
  }, [state.currentFrame, frames.length, updateFrame]);

  const previousFrame = useCallback(() => {
    const prevIndex = Math.max(state.currentFrame - 1, 0);
    updateFrame(prevIndex);
  }, [state.currentFrame, updateFrame]);

  const setSpeed = useCallback((speed: number) => {
    setAnimationSpeed(speed);
    
    // Restart animation with new speed if currently playing
    if (state.isPlaying) {
      pause();
      setTimeout(() => play(), 50); // Small delay to ensure cleanup
    }
  }, [state.isPlaying, pause, play]);

  const controls: TemporalAnimationControls = {
    play,
    pause,
    togglePlay,
    reset,
    jumpToFrame,
    nextFrame,
    previousFrame,
    setSpeed,
    setLoop
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    state,
    controls,
    isConfigured: frames.length > 0 && config.enabled
  };
};
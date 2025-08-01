import React from 'react';
import { TemporalAnimationState, TemporalAnimationControls } from '@/hooks/useTemporalAnimation';
import { FloatingTemporalControls } from './FloatingTemporalControls';
import { CompactTemporalSettings } from './CompactTemporalSettings';
import { ColumnInfo } from '@/pages/Index';
import { TemporalAnimationConfig } from '@/lib/chart/temporalDataProcessor';

interface AnimatedChartContainerProps {
  children: React.ReactNode;
  isTemporalAnimated?: boolean;
  animationState?: TemporalAnimationState;
  animationControls?: TemporalAnimationControls;
  className?: string;
  columns?: ColumnInfo[];
  temporalConfig?: TemporalAnimationConfig;
  onTemporalConfigChange?: (config: TemporalAnimationConfig) => void;
  onTest?: () => void;
  
}

export const AnimatedChartContainer = ({
  children,
  isTemporalAnimated,
  animationState,
  animationControls,
  className = '',
  columns,
  temporalConfig,
  onTemporalConfigChange,
  onTest,
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
      {/* Floating Temporal Controls */}
      {isTemporalAnimated && animationState && animationControls && (
        <FloatingTemporalControls
          state={animationState}
          controls={animationControls}
          onTest={onTest}
          
          showAdvanced={!!columns && !!temporalConfig && !!onTemporalConfigChange}
        >
          {columns && temporalConfig && onTemporalConfigChange && (
            <CompactTemporalSettings
              columns={columns}
              config={temporalConfig}
              onConfigChange={onTemporalConfigChange}
            />
          )}
        </FloatingTemporalControls>
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
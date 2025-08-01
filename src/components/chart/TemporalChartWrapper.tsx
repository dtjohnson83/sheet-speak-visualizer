import React, { useState, useMemo } from 'react';
import { ChartRenderers } from './ChartRenderers';
import { TemporalAnimationConfiguration } from './config/TemporalAnimationConfiguration';
import { TemporalTimelineSlider } from './TemporalTimelineSlider';
import { AnimatedChartContainer } from './AnimatedChartContainer';
import { detectTemporalColumns, prepareTemporalAnimationData, TemporalAnimationConfig } from '@/lib/chart/temporalDataProcessor';
import { useTemporalAnimation } from '@/hooks/useTemporalAnimation';
import { recordTemporalAnimation } from '@/lib/chart/temporalAnimationRecorder';
import { useToast } from '@/hooks/use-toast';
import { ChartRenderersProps } from '@/types';

interface TemporalChartWrapperProps extends ChartRenderersProps {
  chartRef?: React.RefObject<HTMLElement>;
}

export const TemporalChartWrapper: React.FC<TemporalChartWrapperProps> = (props) => {
  const { data, columns, chartRef, chartType } = props;
  const { toast } = useToast();
  
  const temporalColumns = detectTemporalColumns(columns);
  const hasTemporalData = temporalColumns.length > 0;
  
  // Chart types that support temporal animation
  const supportedChartTypes = ['bar', 'line', 'area', 'pie', 'scatter', 'bar3d', 'scatter3d', 'surface3d'];
  const isChartTypeSupported = chartType ? supportedChartTypes.includes(chartType) : false;
  
  const [temporalConfig, setTemporalConfig] = useState<TemporalAnimationConfig>({
    enabled: false,
    dateColumn: temporalColumns[0]?.name || '',
    timeInterval: 'month',
    animationSpeed: 1000,
    autoPlay: false,
    loop: false,
    aggregationMethod: 'sum',
    showCumulative: false
  });

  // Get numeric columns for animation
  const numericColumns = useMemo(() => 
    columns.filter(col => col.type === 'numeric').map(col => col.name),
    [columns]
  );

  // Prepare temporal animation data
  const temporalFrames = useMemo(() => {
    if (!temporalConfig.enabled || !hasTemporalData) return [];
    
    return prepareTemporalAnimationData(data, temporalConfig, numericColumns);
  }, [data, temporalConfig, hasTemporalData, numericColumns]);

  // Use temporal animation hook
  const { state, controls, isConfigured } = useTemporalAnimation(temporalFrames, temporalConfig);

  // Use animated data if temporal animation is active
  const chartData = isConfigured && state.currentFrameData 
    ? state.currentFrameData.data 
    : data;

  const handleRecordAnimation = async () => {
    if (!chartRef?.current) {
      toast({
        title: "Error",
        description: "Chart not found for recording",
        variant: "destructive"
      });
      return;
    }

    try {
      await recordTemporalAnimation(
        chartRef.current,
        state,
        controls,
        {
          format: 'mp4',
          width: 1600,
          height: 1200,
          fileName: 'temporal-animation'
        }
      );
      
      toast({
        title: "Recording Started",
        description: "Temporal animation recording in progress...",
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Failed to record temporal animation",
        variant: "destructive"
      });
    }
  };

  const handleTestAnimation = () => {
    controls.reset();
    setTimeout(() => {
      controls.play();
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Minimal Configuration Panel - Only show if not enabled */}
      {hasTemporalData && isChartTypeSupported && !temporalConfig.enabled && (
        <TemporalAnimationConfiguration
          columns={columns}
          data={data}
          config={temporalConfig}
          onConfigChange={setTemporalConfig}
          isPlaying={state.isPlaying}
          onTogglePlay={controls.togglePlay}
          onReset={controls.reset}
          currentTimeLabel={state.currentFrameData?.timeLabel}
          progress={state.progress}
          onRecordAnimation={handleRecordAnimation}
          chartRef={chartRef}
          temporalAnimationState={state}
          temporalAnimationControls={controls}
        />
      )}
      
      {/* Chart with Integrated Controls */}
      <div className="space-y-2">
        <AnimatedChartContainer
          isTemporalAnimated={temporalConfig.enabled}
          animationState={state}
          animationControls={controls}
          className="relative"
          columns={temporalConfig.enabled ? columns : undefined}
          temporalConfig={temporalConfig.enabled ? temporalConfig : undefined}
          onTemporalConfigChange={temporalConfig.enabled ? setTemporalConfig : undefined}
          onTest={temporalConfig.enabled ? handleTestAnimation : undefined}
          onRecord={temporalConfig.enabled ? handleRecordAnimation : undefined}
        >
          <ChartRenderers
            {...props}
            data={chartData}
            isTemporalAnimated={temporalConfig.enabled}
            animationSpeed={temporalConfig.animationSpeed}
          />
        </AnimatedChartContainer>
        
        {/* Timeline Slider - Directly under chart with minimal gap */}
        {temporalConfig.enabled && isConfigured && (
          <TemporalTimelineSlider
            state={state}
            controls={controls}
            className="mt-1"
          />
        )}
      </div>
    </div>
  );
};
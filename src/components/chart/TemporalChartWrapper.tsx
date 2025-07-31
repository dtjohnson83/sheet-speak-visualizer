import React, { useState, useMemo } from 'react';
import { ChartRenderers } from './ChartRenderers';
import { TemporalAnimationConfiguration } from './config/TemporalAnimationConfiguration';
import { useTemporalAnimation } from '@/hooks/useTemporalAnimation';
import { 
  prepareTemporalAnimationData, 
  isTemporalDataSuitable, 
  detectTemporalColumns,
  TemporalAnimationConfig 
} from '@/lib/chart/temporalDataProcessor';
import { ColumnInfo } from '@/pages/Index';
import { ChartRenderersProps } from '@/types';

interface TemporalChartWrapperProps extends ChartRenderersProps {
  aggregationMethod?: any;
  zColumn?: string;
}

export const TemporalChartWrapper = (props: TemporalChartWrapperProps) => {
  const { data, columns } = props;
  
  const temporalColumns = detectTemporalColumns(columns);
  const hasTemporalData = temporalColumns.length > 0;
  
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

  return (
    <div className="space-y-4">
      {hasTemporalData && (
        <TemporalAnimationConfiguration
          columns={columns}
          config={temporalConfig}
          onConfigChange={setTemporalConfig}
          isPlaying={state.isPlaying}
          onTogglePlay={controls.togglePlay}
          onReset={controls.reset}
          currentTimeLabel={state.currentFrameData?.timeLabel}
          progress={state.progress}
        />
      )}
      
      <ChartRenderers
        {...props}
        data={chartData}
        isTemporalAnimated={temporalConfig.enabled}
        animationSpeed={temporalConfig.animationSpeed}
      />
    </div>
  );
};
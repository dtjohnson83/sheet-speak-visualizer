import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Play, Pause, RotateCcw, Settings, Video, TestTube } from 'lucide-react';
import { ColumnInfo, DataRow } from '@/pages/Index';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { TemporalAnimationConfig, TimeInterval, detectTemporalColumns } from '@/lib/chart/temporalDataProcessor';
import { TemporalDataValidation } from './TemporalDataValidation';

interface TemporalAnimationConfigurationProps {
  columns: ColumnInfo[];
  data: DataRow[];
  config: TemporalAnimationConfig;
  onConfigChange: (config: TemporalAnimationConfig) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onReset?: () => void;
  currentTimeLabel?: string;
  progress?: number;
  onRecordAnimation?: () => void;
  chartRef?: React.RefObject<HTMLElement>;
  temporalAnimationState?: any;
  temporalAnimationControls?: any;
}

export const TemporalAnimationConfiguration = ({
  columns,
  data,
  config,
  onConfigChange,
  isPlaying = false,
  onTogglePlay,
  onReset,
  currentTimeLabel,
  progress = 0,
  onRecordAnimation,
  chartRef,
  temporalAnimationState,
  temporalAnimationControls
}: TemporalAnimationConfigurationProps) => {
  const temporalColumns = detectTemporalColumns(columns);
  const hasTemporalColumns = temporalColumns.length > 0;

  const timeIntervalOptions: { value: TimeInterval; label: string }[] = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' }
  ];

  const aggregationOptions: { value: AggregationMethod; label: string }[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'average', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' }
  ];

  const speedOptions = [
    { value: 2000, label: 'Slow (2s)' },
    { value: 1000, label: 'Medium (1s)' },
    { value: 500, label: 'Fast (0.5s)' },
    { value: 200, label: 'Very Fast (0.2s)' }
  ];

  const updateConfig = (updates: Partial<TemporalAnimationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const handleTestAnimation = () => {
    if (temporalAnimationControls?.reset) {
      temporalAnimationControls.reset();
      setTimeout(() => {
        if (temporalAnimationControls?.play) {
          temporalAnimationControls.play();
        }
      }, 100);
    }
  };

  if (!hasTemporalColumns) {
    return (
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Temporal Animation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No date/time columns detected. Upload data with temporal information to enable animated charts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Temporal Animation
          </CardTitle>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
        </div>
      </CardHeader>
      
      {config.enabled && (
        <CardContent className="space-y-4">
          {/* Animation Controls */}
          {currentTimeLabel && (
            <div className="space-y-2" data-ignore-recording="true">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  {isPlaying && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  {currentTimeLabel}
                </span>
                <div className="flex items-center gap-2 temporal-controls">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onTogglePlay}
                    className="h-8 w-8 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReset}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTestAnimation}
                    className="h-8 w-8 p-0"
                    title="Test Animation"
                  >
                    <TestTube className="h-3 w-3" />
                  </Button>
                  {onRecordAnimation && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onRecordAnimation}
                      className="h-8 w-8 p-0"
                      title="Record Animation"
                    >
                      <Video className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Date Column Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Date Column</Label>
            <Select
              value={config.dateColumn}
              onValueChange={(value) => updateConfig({ dateColumn: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select date column" />
              </SelectTrigger>
              <SelectContent>
                {temporalColumns.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Validation */}
          {config.dateColumn && (
            <TemporalDataValidation
              data={data}
              dateColumn={config.dateColumn}
              columns={columns}
            />
          )}

          {/* Time Interval */}
          <div className="space-y-2">
            <Label className="text-sm">Time Interval</Label>
            <Select
              value={config.timeInterval}
              onValueChange={(value: TimeInterval) => updateConfig({ timeInterval: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeIntervalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Animation Speed */}
          <div className="space-y-2">
            <Label className="text-sm">Animation Speed</Label>
            <Select
              value={config.animationSpeed.toString()}
              onValueChange={(value) => updateConfig({ animationSpeed: parseInt(value) })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {speedOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aggregation Method */}
          <div className="space-y-2">
            <Label className="text-sm">Aggregation Method</Label>
            <Select
              value={config.aggregationMethod}
              onValueChange={(value: AggregationMethod) => updateConfig({ aggregationMethod: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aggregationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={config.startDate || ''}
                onChange={(e) => updateConfig({ startDate: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={config.endDate || ''}
                onChange={(e) => updateConfig({ endDate: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Animation Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto Play</Label>
              <Switch
                checked={config.autoPlay}
                onCheckedChange={(autoPlay) => updateConfig({ autoPlay })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Loop Animation</Label>
              <Switch
                checked={config.loop}
                onCheckedChange={(loop) => updateConfig({ loop })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Cumulative</Label>
              <Switch
                checked={config.showCumulative}
                onCheckedChange={(showCumulative) => updateConfig({ showCumulative })}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
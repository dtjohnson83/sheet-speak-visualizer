import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnInfo, DataRow } from '@/pages/Index';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { TemporalAnimationConfig, TimeInterval, detectTemporalColumns } from '@/lib/chart/temporalDataProcessor';

interface CompactTemporalSettingsProps {
  columns: ColumnInfo[];
  data?: DataRow[];
  config: TemporalAnimationConfig;
  onConfigChange: (config: TemporalAnimationConfig) => void;
}

export const CompactTemporalSettings = ({
  columns,
  data,
  config,
  onConfigChange
}: CompactTemporalSettingsProps) => {
  const temporalColumns = detectTemporalColumns(columns, data);

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
    { value: 2000, label: 'Slow' },
    { value: 1000, label: 'Medium' },
    { value: 500, label: 'Fast' },
    { value: 200, label: 'Very Fast' }
  ];

  const updateConfig = (updates: Partial<TemporalAnimationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-3">
      {/* Date Column */}
      <div className="space-y-1">
        <Label className="text-xs">Date Column</Label>
        <Select
          value={config.dateColumn}
          onValueChange={(value) => updateConfig({ dateColumn: value })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Select date column" />
          </SelectTrigger>
          <SelectContent>
            {temporalColumns.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Interval & Speed */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Interval</Label>
          <Select
            value={config.timeInterval}
            onValueChange={(value: TimeInterval) => updateConfig({ timeInterval: value })}
          >
            <SelectTrigger className="h-7 text-xs">
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

        <div className="space-y-1">
          <Label className="text-xs">Speed</Label>
          <Select
            value={config.animationSpeed.toString()}
            onValueChange={(value) => updateConfig({ animationSpeed: parseInt(value) })}
          >
            <SelectTrigger className="h-7 text-xs">
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
      </div>

      {/* Aggregation */}
      <div className="space-y-1">
        <Label className="text-xs">Aggregation</Label>
        <Select
          value={config.aggregationMethod}
          onValueChange={(value: AggregationMethod) => updateConfig({ aggregationMethod: value })}
        >
          <SelectTrigger className="h-7 text-xs">
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

      {/* Options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Auto Play</Label>
          <Switch
            checked={config.autoPlay}
            onCheckedChange={(autoPlay) => updateConfig({ autoPlay })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-xs">Loop</Label>
          <Switch
            checked={config.loop}
            onCheckedChange={(loop) => updateConfig({ loop })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-xs">Cumulative</Label>
          <Switch
            checked={config.showCumulative}
            onCheckedChange={(showCumulative) => updateConfig({ showCumulative })}
          />
        </div>
      </div>
    </div>
  );
};
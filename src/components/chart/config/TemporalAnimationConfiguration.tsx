import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { ColumnInfo, DataRow } from '@/pages/Index';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { TemporalAnimationConfig, TimeInterval, detectTemporalColumns } from '@/lib/chart/temporalDataProcessor';
import { TemporalDataValidation } from './TemporalDataValidation';
import { TemporalDebugger } from '../TemporalDebugger';

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
  
  chartRef,
  temporalAnimationState,
  temporalAnimationControls
}: TemporalAnimationConfigurationProps) => {
  const temporalColumns = detectTemporalColumns(columns, data);
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


  if (!hasTemporalColumns) {
    const availableColumns = columns.map(col => col.name).join(', ');
    const suggestions = columns.filter(col => 
      /date|time|year|month|day|period|when|created|updated/i.test(col.name) ||
      col.type === 'text' || col.type === 'categorical'
    ).map(col => col.name);
    
    return (
      <Card className="bg-muted/50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Temporal Animation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No date/time columns detected in your data.
          </p>
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-orange-600">
                Possible date columns to check:
              </p>
              <p className="text-xs text-muted-foreground">
                {suggestions.join(', ')}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-medium">Available columns:</p>
            <p className="text-xs text-muted-foreground font-mono">
              {availableColumns}
            </p>
          </div>
          <p className="text-xs text-blue-600">
            💡 Make sure your data has columns with dates in formats like: YYYY-MM-DD, MM/DD/YYYY, or timestamp values.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Temporal Animation Setup
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">

          {/* Date Column Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Date Column</Label>
            <Select
              value={config.dateColumn}
              onValueChange={(value) => updateConfig({ dateColumn: value, enabled: !!value })}
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
            <>
              <TemporalDataValidation
                data={data}
                dateColumn={config.dateColumn}
                columns={columns}
              />
              <TemporalDebugger
                data={data}
                columns={columns}
                selectedDateColumn={config.dateColumn}
              />
            </>
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
    </Card>
  );
};
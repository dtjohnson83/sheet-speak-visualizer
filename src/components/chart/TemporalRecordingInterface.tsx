import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Play, Pause, RotateCcw, Video, Download, Settings } from 'lucide-react';
import { detectTemporalColumns, prepareTemporalAnimationData, TemporalAnimationConfig } from '@/lib/chart/temporalDataProcessor';
import { useTemporalAnimation } from '@/hooks/useTemporalAnimation';
import { recordTemporalAnimation } from '@/lib/chart/temporalAnimationRecorder';
import { useToast } from '@/hooks/use-toast';
import { ColumnInfo, DataRow } from '@/pages/Index';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TemporalRecordingInterfaceProps {
  data: DataRow[];
  columns: ColumnInfo[];
  chartRef?: React.RefObject<HTMLElement>;
  onTemporalConfigChange?: (config: TemporalAnimationConfig) => void;
}

export const TemporalRecordingInterface: React.FC<TemporalRecordingInterfaceProps> = ({
  data,
  columns,
  chartRef,
  onTemporalConfigChange
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  const updateConfig = (updates: Partial<TemporalAnimationConfig>) => {
    const newConfig = { ...temporalConfig, ...updates };
    setTemporalConfig(newConfig);
    onTemporalConfigChange?.(newConfig);
  };

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

  if (!hasTemporalData) {
    return null;
  }

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Temporal Animation & Recording</CardTitle>
              <CardDescription>
                Animate your chart over time and record the animation
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {temporalColumns.length} Date Column{temporalColumns.length !== 1 ? 's' : ''}
            </Badge>
            {temporalConfig.enabled && (
              <Badge variant="default" className="animate-pulse">
                Animation Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions Row */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="temporal-enabled"
              checked={temporalConfig.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
            <Label htmlFor="temporal-enabled" className="font-medium">
              Enable Animation
            </Label>
          </div>

          {temporalConfig.enabled && (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={state.isPlaying ? controls.pause : controls.play}
                  className="flex items-center gap-2"
                >
                  {state.isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={controls.reset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>

                <Button
                  onClick={handleRecordAnimation}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <Video className="h-4 w-4" />
                  Record Animation
                </Button>
              </div>

              {state.currentFrameData && (
                <div className="flex items-center gap-2 ml-auto">
                  <Badge variant="outline" className="font-mono">
                    {state.currentFrameData.timeLabel}
                  </Badge>
                  <Progress value={state.progress} className="w-24" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Advanced Configuration (Collapsible) */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Animation Settings
              </span>
              <span className="text-xs text-muted-foreground">
                {isExpanded ? 'Hide' : 'Show'} Configuration
              </span>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date Column</Label>
                <Select
                  value={temporalConfig.dateColumn}
                  onValueChange={(value) => updateConfig({ dateColumn: value })}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Time Interval</Label>
                <Select
                  value={temporalConfig.timeInterval}
                  onValueChange={(value: any) => updateConfig({ timeInterval: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Animation Speed</Label>
                <Select
                  value={temporalConfig.animationSpeed.toString()}
                  onValueChange={(value) => updateConfig({ animationSpeed: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">Fast (0.5s)</SelectItem>
                    <SelectItem value="1000">Normal (1s)</SelectItem>
                    <SelectItem value="2000">Slow (2s)</SelectItem>
                    <SelectItem value="3000">Very Slow (3s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aggregation Method</Label>
                <Select
                  value={temporalConfig.aggregationMethod}
                  onValueChange={(value: any) => updateConfig({ aggregationMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-play"
                  checked={temporalConfig.autoPlay}
                  onCheckedChange={(autoPlay) => updateConfig({ autoPlay })}
                />
                <Label htmlFor="auto-play">Auto Play</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="loop"
                  checked={temporalConfig.loop}
                  onCheckedChange={(loop) => updateConfig({ loop })}
                />
                <Label htmlFor="loop">Loop Animation</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="cumulative"
                checked={temporalConfig.showCumulative}
                onCheckedChange={(showCumulative) => updateConfig({ showCumulative })}
              />
              <Label htmlFor="cumulative">Show Cumulative Data</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Recording Tips */}
        {temporalConfig.enabled && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Download className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Recording Tips:</p>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• Recording captures the full animation cycle</li>
                  <li>• Videos are saved as MP4 format (1600×1200px)</li>
                  <li>• Keep the chart visible during recording</li>
                  <li>• Longer animations create larger files</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
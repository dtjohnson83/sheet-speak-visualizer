import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, Globe } from 'lucide-react';

export interface ScheduleConfig {
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  timezone?: string;
  businessHoursOnly: boolean;
  weekendsIncluded: boolean;
  customInterval?: number;
  isPaused: boolean;
}

interface ScheduleConfigurationProps {
  config: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
  disabled?: boolean;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
];

export const ScheduleConfiguration = ({ config, onChange, disabled = false }: ScheduleConfigurationProps) => {
  const updateConfig = (updates: Partial<ScheduleConfig>) => {
    onChange({ ...config, ...updates });
  };

  const showTimeConfig = config.frequency !== 'manual' && config.frequency !== 'hourly';
  const showCustomInterval = config.frequency === 'hourly';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Configuration
        </CardTitle>
        <CardDescription>
          Configure when and how often this agent should run
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Frequency Selection */}
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={config.frequency}
            onValueChange={(value: ScheduleConfig['frequency']) => updateConfig({ frequency: value })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Only</SelectItem>
              <SelectItem value="hourly">Every Hour</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Interval for Hourly */}
        {showCustomInterval && (
          <div className="space-y-2">
            <Label htmlFor="interval">Custom Interval (hours)</Label>
            <Input
              id="interval"
              type="number"
              min="1"
              max="24"
              value={config.customInterval || 1}
              onChange={(e) => updateConfig({ customInterval: parseInt(e.target.value) || 1 })}
              disabled={disabled}
              placeholder="1"
            />
          </div>
        )}

        {/* Time Selection */}
        {showTimeConfig && (
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Time
            </Label>
            <Input
              id="time"
              type="time"
              value={config.time || '09:00'}
              onChange={(e) => updateConfig({ time: e.target.value })}
              disabled={disabled}
            />
          </div>
        )}

        {/* Timezone Selection */}
        {config.frequency !== 'manual' && (
          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Timezone
            </Label>
            <Select
              value={config.timezone || 'UTC'}
              onValueChange={(value) => updateConfig({ timezone: value })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Advanced Options */}
        {config.frequency !== 'manual' && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Advanced Options</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="business-hours">Business Hours Only</Label>
                <p className="text-sm text-muted-foreground">
                  Run only during weekdays 9 AM - 5 PM
                </p>
              </div>
              <Switch
                id="business-hours"
                checked={config.businessHoursOnly}
                onCheckedChange={(checked) => updateConfig({ businessHoursOnly: checked })}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weekends">Include Weekends</Label>
                <p className="text-sm text-muted-foreground">
                  Allow agent to run on weekends
                </p>
              </div>
              <Switch
                id="weekends"
                checked={config.weekendsIncluded}
                onCheckedChange={(checked) => updateConfig({ weekendsIncluded: checked })}
                disabled={disabled || config.businessHoursOnly}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="paused">Pause Schedule</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily pause automatic runs
                </p>
              </div>
              <Switch
                id="paused"
                checked={config.isPaused}
                onCheckedChange={(checked) => updateConfig({ isPaused: checked })}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
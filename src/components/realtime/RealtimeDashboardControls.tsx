import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bell, BellOff, Wifi, WifiOff, RefreshCw, Settings } from 'lucide-react';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';

export const RealtimeDashboardControls = () => {
  const {
    config,
    updateConfig,
    isConnected,
    availableSources,
    connectToDataSource,
    disconnectDataSource,
    requestNotificationPermission,
    lastUpdateTime
  } = useRealtimeDashboard();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDataSourceChange = (sourceId: string) => {
    if (sourceId === 'none') {
      disconnectDataSource();
    } else {
      connectToDataSource(sourceId);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const permitted = await requestNotificationPermission();
      if (permitted) {
        updateConfig({ enableNotifications: enabled });
      }
    } else {
      updateConfig({ enableNotifications: enabled });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Real-time Dashboard
        </CardTitle>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Disconnected
            </Badge>
          )}
          {lastUpdateTime && (
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdateTime.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Data Source</Label>
            <Select
              value={config.dataSourceId || 'none'}
              onValueChange={handleDataSourceChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No real-time data</SelectItem>
                {availableSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={config.autoRefresh}
              onCheckedChange={(checked) => updateConfig({ autoRefresh: checked })}
            />
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={config.enableNotifications}
              onCheckedChange={handleNotificationToggle}
            />
            <Label htmlFor="notifications" className="flex items-center gap-1">
              {config.enableNotifications ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              Notifications
            </Label>
          </div>
        </div>

        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-sm">Advanced Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  value={config.refreshInterval / 1000}
                  onChange={(e) => updateConfig({ refreshInterval: parseInt(e.target.value) * 1000 })}
                  min="1"
                  max="300"
                  disabled={!config.autoRefresh}
                />
              </div>
            </div>
          </div>
        )}

        {!isConnected && config.dataSourceId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Connection to data source lost. Charts will not update in real-time.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
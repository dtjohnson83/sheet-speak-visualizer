import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wifi, WifiOff, Clock, Zap, RefreshCw } from 'lucide-react';
import { useRealtimeData } from '@/contexts/RealtimeDataContext';
import { useState, useEffect } from 'react';

interface ActiveSourceIndicatorProps {
  currentDatasetName?: string;
  onSourceChange?: (sourceId: string) => void;
}

export const ActiveSourceIndicator = ({ currentDatasetName, onSourceChange }: ActiveSourceIndicatorProps) => {
  const { sources, latestUpdates } = useRealtimeData();
  const [recentSources, setRecentSources] = useState<string[]>([]);
  
  // Filter sources that have data available
  const sourcesWithData = sources.filter(source => latestUpdates[source.id]);
  
  // Find the current active source based on the dataset name
  const activeSource = sources.find(source => 
    currentDatasetName && currentDatasetName === source.name
  );
  
  const activeSourceUpdate = activeSource ? latestUpdates[activeSource.id] : null;

  // Track recently used sources
  useEffect(() => {
    if (activeSource && !recentSources.includes(activeSource.id)) {
      setRecentSources(prev => [activeSource.id, ...prev.slice(0, 4)]); // Keep last 5
    }
  }, [activeSource, recentSources]);

  const handleSourceSwitch = (sourceId: string) => {
    if (onSourceChange) {
      onSourceChange(sourceId);
    }
  };

  if (!currentDatasetName || sourcesWithData.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Real-time Source:</span>
            </div>
            
            {activeSource ? (
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-blue-500">
                  {activeSource.name}
                </Badge>
                <div className="flex items-center gap-1">
                  {activeSource.connectionStatus === 'connected' ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <Badge variant={activeSource.connectionStatus === 'connected' ? 'default' : 'destructive'}>
                    {activeSource.connectionStatus}
                  </Badge>
                </div>
              </div>
            ) : (
              <Badge variant="outline">Static Data</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeSourceUpdate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last updated: {activeSourceUpdate.timestamp.toLocaleTimeString()}</span>
                {activeSourceUpdate.data.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeSourceUpdate.data.length} records
                  </Badge>
                )}
              </div>
            )}

            {sourcesWithData.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Switch to:</span>
                <Select value={activeSource?.id || ''} onValueChange={handleSourceSwitch}>
                  <SelectTrigger className="w-48 h-8">
                    <SelectValue placeholder="Select source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sourcesWithData.map((source) => {
                      const update = latestUpdates[source.id];
                      return (
                        <SelectItem key={source.id} value={source.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{source.name}</span>
                            <div className="flex items-center gap-1 ml-2">
                              {source.connectionStatus === 'connected' ? (
                                <Wifi className="h-3 w-3 text-green-500" />
                              ) : (
                                <WifiOff className="h-3 w-3 text-red-500" />
                              )}
                              {update && (
                                <Badge variant="secondary" className="text-xs">
                                  {update.data.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sources for Quick Access */}
        {recentSources.length > 1 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Recent:</span>
              <div className="flex gap-1">
                {recentSources.slice(0, 3).map((sourceId) => {
                  const source = sources.find(s => s.id === sourceId);
                  if (!source || !latestUpdates[sourceId]) return null;
                  
                  return (
                    <Button
                      key={sourceId}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleSourceSwitch(sourceId)}
                      disabled={sourceId === activeSource?.id}
                    >
                      {source.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
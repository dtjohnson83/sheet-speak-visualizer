import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Wifi, WifiOff, Globe, Database, Play, RefreshCw, Eye } from 'lucide-react';
import { useRealtimeData, RealtimeDataSource } from '@/hooks/useRealtimeData';

interface RealtimeDataConfigProps {
  onUseForVisualization?: (sourceId: string) => void;
}

export const RealtimeDataConfig = ({ onUseForVisualization }: RealtimeDataConfigProps = {}) => {
  const { sources, isSupabaseConnected, addRealtimeSource, removeRealtimeSource, latestUpdates, testConnection, refreshSource } = useRealtimeData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourceType, setSourceType] = useState<'external_api' | 'websocket'>('external_api');
  const [sourceName, setSourceName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiHeaders, setApiHeaders] = useState('{}');
  const [refreshInterval, setRefreshInterval] = useState('30000');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [previewData, setPreviewData] = useState<{[sourceId: string]: any}>({});

  const handleAddSource = () => {
    if (!sourceName.trim() || !apiUrl.trim()) return;

    let headers = {};
    try {
      headers = JSON.parse(apiHeaders);
    } catch (error) {
      console.error('Invalid JSON in headers:', error);
      return;
    }

    const config = {
      url: apiUrl,
      method: apiMethod,
      headers
    };

    addRealtimeSource({
      type: sourceType,
      name: sourceName,
      config,
      refreshInterval: autoRefresh ? parseInt(refreshInterval) : undefined
    });

    // Reset form
    setSourceName('');
    setApiUrl('');
    setApiMethod('GET');
    setApiHeaders('{}');
    setRefreshInterval('30000');
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Real-time Data Sources</h3>
          <div className="flex items-center gap-1">
            {isSupabaseConnected ? (
              <><Wifi className="h-4 w-4 text-green-500" /><Badge variant="secondary">Supabase Connected</Badge></>
            ) : (
              <><WifiOff className="h-4 w-4 text-red-500" /><Badge variant="destructive">Supabase Disconnected</Badge></>
            )}
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Real-time Data Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Source Type</Label>
                <Select value={sourceType} onValueChange={(value: 'external_api' | 'websocket') => setSourceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external_api">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        REST API
                      </div>
                    </SelectItem>
                    <SelectItem value="websocket">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        WebSocket
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Source Name</Label>
                <Input
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="Enter source name..."
                />
              </div>

              <div>
                <Label>URL</Label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder={sourceType === 'websocket' ? 'wss://api.example.com/ws' : 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'}
                />
              </div>

              {sourceType === 'external_api' && (
                <>
                  <div>
                    <Label>HTTP Method</Label>
                    <Select value={apiMethod} onValueChange={setApiMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Headers (JSON)</Label>
                    <Textarea
                      value={apiHeaders}
                      onChange={(e) => setApiHeaders(e.target.value)}
                      placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                      <Label>Auto Refresh</Label>
                    </div>
                    {autoRefresh && (
                      <div className="flex-1">
                        <Label>Interval (ms)</Label>
                        <Input
                          type="number"
                          value={refreshInterval}
                          onChange={(e) => setRefreshInterval(e.target.value)}
                          min="1000"
                          step="1000"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSource} disabled={!sourceName.trim() || !apiUrl.trim()}>
                  Add Source
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Database className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Real-time Sources</h3>
              <p className="text-gray-500 mb-4">Add external APIs or WebSocket connections to enable real-time chart updates.</p>
            </CardContent>
          </Card>
        ) : (
          sources.map((source) => (
            <Card key={source.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(source.id)}
                    disabled={source.connectionStatus === 'testing'}
                    className="h-8 px-2"
                  >
                    {source.connectionStatus === 'testing' ? 'Testing...' : 'Test'}
                  </Button>
                  {source.type === 'external_api' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshSource(source.id)}
                      disabled={source.connectionStatus === 'testing'}
                      className="h-8 px-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                  {latestUpdates[source.id] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewData(prev => ({
                        ...prev,
                        [source.id]: prev[source.id] ? null : latestUpdates[source.id]?.data?.slice(0, 5)
                      }))}
                      className="h-8 px-2"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  {latestUpdates[source.id] && onUseForVisualization && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        console.log('🎯 Use for Charts button clicked for source:', source.id);
                        console.log('📋 Available data:', latestUpdates[source.id]);
                        onUseForVisualization(source.id);
                      }}
                      className="h-8 px-2"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Use for Charts
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRealtimeSource(source.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {source.type === 'external_api' ? (
                    <Globe className="h-4 w-4" />
                  ) : (
                    <Wifi className="h-4 w-4" />
                  )}
                  <Badge variant="outline">
                    {source.type === 'external_api' ? 'REST API' : 'WebSocket'}
                  </Badge>
                  {source.refreshInterval && (
                    <Badge variant="secondary">
                      {source.refreshInterval / 1000}s
                    </Badge>
                  )}
                  <Badge 
                    variant={
                      source.connectionStatus === 'connected' ? 'default' :
                      source.connectionStatus === 'testing' ? 'secondary' :
                      source.connectionStatus === 'error' ? 'destructive' : 'outline'
                    }
                    className={
                      source.connectionStatus === 'connected' ? 'bg-green-500' :
                      source.connectionStatus === 'testing' ? 'bg-blue-500' : ''
                    }
                  >
                    {source.connectionStatus === 'connected' && 'Connected'}
                    {source.connectionStatus === 'testing' && 'Testing...'}
                    {source.connectionStatus === 'error' && 'Error'}
                    {source.connectionStatus === 'disconnected' && 'Not Tested'}
                  </Badge>
                  {latestUpdates[source.id] && (
                    <Badge variant="default" className="bg-green-500">
                      Data Available
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {source.config.url}
                </p>
                {source.errorMessage && (
                  <p className="text-xs text-destructive mt-1">
                    {source.errorMessage}
                  </p>
                )}
                {latestUpdates[source.id] && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated: {latestUpdates[source.id].timestamp.toLocaleTimeString()}
                    {latestUpdates[source.id].data.length > 0 && (
                      <span className="ml-2 text-green-600">
                        • {latestUpdates[source.id].data.length} records
                      </span>
                    )}
                  </p>
                )}
                {source.lastUpdated && !latestUpdates[source.id] && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last attempt: {source.lastUpdated.toLocaleTimeString()}
                  </p>
                )}
                {previewData[source.id] && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <p className="font-medium mb-1">Data Preview:</p>
                    <pre className="text-xs overflow-auto max-h-20">
                      {JSON.stringify(previewData[source.id], null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RESTAPIConfig } from '@/types/restAPI';
import { useToast } from '@/components/ui/use-toast';
import { dataSourceManager } from '@/lib/dataSources/DataSourceManager';

interface RESTAPIConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (config: RESTAPIConfig) => void;
}

export const RESTAPIConnectionDialog = ({ open, onOpenChange, onConnect }: RESTAPIConnectionDialogProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<RESTAPIConfig>({
    baseUrl: '',
    authentication: { type: 'none' },
    headers: {},
    queryParams: {},
    pagination: { type: 'none' },
    dataPath: '',
  });
  const [testing, setTesting] = useState(false);
  const [customHeaders, setCustomHeaders] = useState('');
  const [customParams, setCustomParams] = useState('');

  const handleTest = async () => {
    if (!config.baseUrl) {
      toast({
        title: "Error",
        description: "Please enter a base URL",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      // Parse custom headers and params
      const parsedConfig = {
        ...config,
        headers: customHeaders ? JSON.parse(customHeaders) : {},
        queryParams: customParams ? JSON.parse(customParams) : {},
      };

      const success = await dataSourceManager.testConnection('rest_api', parsedConfig);
      
      if (success) {
        toast({
          title: "Success",
          description: "Connection test successful!",
        });
      } else {
        toast({
          title: "Error",
          description: "Connection test failed. Please check your configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON in headers or parameters",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = () => {
    try {
      const finalConfig = {
        ...config,
        headers: customHeaders ? JSON.parse(customHeaders) : {},
        queryParams: customParams ? JSON.parse(customParams) : {},
      };

      onConnect(finalConfig);
      onOpenChange(false);
      
      // Reset form
      setConfig({
        baseUrl: '',
        authentication: { type: 'none' },
        headers: {},
        queryParams: {},
        pagination: { type: 'none' },
        dataPath: '',
      });
      setCustomHeaders('');
      setCustomParams('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON in headers or parameters",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect to REST API</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="headers">Headers & Params</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Configuration</CardTitle>
                <CardDescription>Configure the basic API connection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="baseUrl">Base URL *</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://api.example.com"
                    value={config.baseUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dataPath">Data Path (JSONPath)</Label>
                  <Input
                    id="dataPath"
                    placeholder="data.items (optional - path to extract data from response)"
                    value={config.dataPath}
                    onChange={(e) => setConfig(prev => ({ ...prev, dataPath: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>Configure API authentication method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Authentication Type</Label>
                  <Select
                    value={config.authentication.type}
                    onValueChange={(value: any) => setConfig(prev => ({
                      ...prev,
                      authentication: { ...prev.authentication, type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer_token">Bearer Token</SelectItem>
                      <SelectItem value="basic_auth">Basic Auth</SelectItem>
                      <SelectItem value="oauth">OAuth Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.authentication.type === 'api_key' && (
                  <>
                    <div>
                      <Label htmlFor="apiKeyHeader">API Key Header</Label>
                      <Input
                        id="apiKeyHeader"
                        placeholder="X-API-Key"
                        value={config.authentication.apiKeyHeader || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, apiKeyHeader: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Your API key"
                        value={config.authentication.apiKey || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, apiKey: e.target.value }
                        }))}
                      />
                    </div>
                  </>
                )}

                {config.authentication.type === 'bearer_token' && (
                  <div>
                    <Label htmlFor="bearerToken">Bearer Token</Label>
                    <Input
                      id="bearerToken"
                      type="password"
                      placeholder="Your bearer token"
                      value={config.authentication.bearerToken || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        authentication: { ...prev.authentication, bearerToken: e.target.value }
                      }))}
                    />
                  </div>
                )}

                {config.authentication.type === 'oauth' && (
                  <div>
                    <Label htmlFor="oauthToken">OAuth Token</Label>
                    <Input
                      id="oauthToken"
                      type="password"
                      placeholder="Your OAuth token"
                      value={config.authentication.oauthToken || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        authentication: { ...prev.authentication, oauthToken: e.target.value }
                      }))}
                    />
                  </div>
                )}

                {config.authentication.type === 'basic_auth' && (
                  <>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Username"
                        value={config.authentication.username || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, username: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={config.authentication.password || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, password: e.target.value }
                        }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="headers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Headers</CardTitle>
                  <CardDescription>Additional HTTP headers to include with requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder='{"Content-Type": "application/json", "User-Agent": "MyApp/1.0"}'
                    value={customHeaders}
                    onChange={(e) => setCustomHeaders(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Query Parameters</CardTitle>
                  <CardDescription>Default query parameters for all requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder='{"format": "json", "version": "v1"}'
                    value={customParams}
                    onChange={(e) => setCustomParams(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Rate limiting and pagination configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pagination Type</Label>
                  <Select
                    value={config.pagination?.type || 'none'}
                    onValueChange={(value: any) => setConfig(prev => ({
                      ...prev,
                      pagination: { ...prev.pagination, type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="offset">Offset-based</SelectItem>
                      <SelectItem value="cursor">Cursor-based</SelectItem>
                      <SelectItem value="page">Page-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  <Badge variant="secondary">Coming Soon</Badge>
                  <p className="mt-2">Pagination and rate limiting configuration will be available in a future update.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={handleConnect} disabled={!config.baseUrl}>
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
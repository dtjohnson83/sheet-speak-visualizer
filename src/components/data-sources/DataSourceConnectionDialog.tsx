import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { dataSourceManager } from '@/lib/dataSources/DataSourceManager';

interface DataSourceConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceType: string;
  onSuccess: (data: any[], columns: any[], name: string) => void;
}

export const DataSourceConnectionDialog = ({ 
  open, 
  onOpenChange, 
  sourceType, 
  onSuccess 
}: DataSourceConnectionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const handleConnect = async () => {
    setLoading(true);
    try {
      const connectionId = `conn_${Date.now()}`;
      const success = await dataSourceManager.connect(connectionId, sourceType, credentials);
      
      if (success) {
        const adapter = dataSourceManager.getConnection(connectionId);
        if (adapter) {
          const data = await adapter.fetchData();
          const columns = await adapter.discoverSchema();
          
          onSuccess(data, columns, adapter.getName());
          onOpenChange(false);
          
          toast({
            title: "Connected successfully",
            description: `Connected to ${adapter.getName()}`,
          });
        }
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error.message || 'Failed to connect to data source',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCredentialFields = () => {
    switch (sourceType) {
      case 'postgresql':
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={credentials.host || ''}
                onChange={(e) => setCredentials(prev => ({ ...prev, host: e.target.value }))}
                placeholder="localhost"
              />
            </div>
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={credentials.port || 5432}
                onChange={(e) => setCredentials(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                value={credentials.database || ''}
                onChange={(e) => setCredentials(prev => ({ ...prev, database: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={credentials.username || ''}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password || ''}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
        );
      case 'json':
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="jsonData">JSON Data</Label>
              <Textarea
                id="jsonData"
                value={credentials.data || ''}
                onChange={(e) => setCredentials(prev => ({ ...prev, data: e.target.value }))}
                placeholder="Paste your JSON data here..."
                rows={10}
              />
            </div>
          </div>
        );
      default:
        return <div>Configuration for {sourceType} not implemented yet.</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to {sourceType}</DialogTitle>
          <DialogDescription>
            Enter the connection details for your data source.
          </DialogDescription>
        </DialogHeader>
        
        {renderCredentialFields()}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
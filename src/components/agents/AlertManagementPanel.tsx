import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bell, Settings, Trash2, Plus, Mail, Webhook, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertConfigurationDialog } from './AlertConfigurationDialog';

interface AlertConfig {
  id: string;
  alert_type: string;
  is_enabled: boolean;
  severity_threshold: string;
  cooldown_minutes: number;
  email_enabled: boolean;
  webhook_enabled: boolean;
  webhook_url?: string;
  thresholds: Record<string, number>;
  created_at: string;
}

interface AlertNotification {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  notification_channels: string[];
  delivery_status: Record<string, string>;
  created_at: string;
  delivered_at?: string;
}

interface AlertManagementPanelProps {
  agentId: string;
}

export const AlertManagementPanel = ({ agentId }: AlertManagementPanelProps) => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AlertConfig | undefined>();

  useEffect(() => {
    loadAlertData();
  }, [agentId]);

  const loadAlertData = async () => {
    setLoading(true);
    try {
      // Load alert configurations
      const { data: configData, error: configError } = await supabase
        .from('agent_alert_configs')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (configError) throw configError;
      setConfigs((configData || []).map(config => ({
        ...config,
        thresholds: config.thresholds as Record<string, number>
      })));

      // Load recent notifications
      const { data: notificationData, error: notificationError } = await supabase
        .from('alert_notifications')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationError) throw notificationError;
      setNotifications((notificationData || []).map(notification => ({
        ...notification,
        notification_channels: notification.notification_channels as string[],
        delivery_status: notification.delivery_status as Record<string, string>
      })));
    } catch (error) {
      console.error('Error loading alert data:', error);
      toast({
        title: "Error",
        description: "Failed to load alert configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleConfig = async (configId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_alert_configs')
        .update({ is_enabled: enabled })
        .eq('id', configId);

      if (error) throw error;

      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, is_enabled: enabled } : config
      ));

      toast({
        title: "Success",
        description: `Alert configuration ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling config:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    }
  };

  const deleteConfig = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('agent_alert_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      setConfigs(prev => prev.filter(config => config.id !== configId));
      
      toast({
        title: "Success",
        description: "Alert configuration deleted",
      });
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'all': return 'All Insights';
      case 'anomaly': return 'Anomalies';
      case 'trend': return 'Trends';
      case 'data_quality_issue': return 'Data Quality';
      case 'summary': return 'Summaries';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading alert configurations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Alert Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure automated alerts for this agent
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingConfig(undefined);
            setConfigDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Alert
        </Button>
      </div>

      <Tabs defaultValue="configurations" className="w-full">
        <TabsList>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="notifications">Recent Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          {configs.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-medium">No alert configurations</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first alert configuration to start receiving notifications
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingConfig(undefined);
                      setConfigDialogOpen(true);
                    }}
                  >
                    Create Alert Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {configs.map((config) => (
                <Card key={config.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {getAlertTypeLabel(config.alert_type)}
                        </CardTitle>
                        <CardDescription>
                          Severity: {config.severity_threshold} • Cooldown: {config.cooldown_minutes}min
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.is_enabled}
                          onCheckedChange={(checked) => toggleConfig(config.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingConfig(config);
                            setConfigDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteConfig(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {config.email_enabled && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </Badge>
                      )}
                      {config.webhook_enabled && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Webhook className="h-3 w-3" />
                          Webhook
                        </Badge>
                      )}
                      <Badge variant="outline" className={`${getSeverityColor(config.severity_threshold)} text-white`}>
                        {config.severity_threshold}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">No recent alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Alert notifications will appear here once they're triggered
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(notification.severity)}>
                            {notification.severity}
                          </Badge>
                          <Badge variant="outline">
                            {getAlertTypeLabel(notification.alert_type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex gap-2">
                          {notification.notification_channels.map((channel) => (
                            <Badge
                              key={channel}
                              variant={notification.delivery_status[channel] === 'sent' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {channel}: {notification.delivery_status[channel] || 'pending'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertConfigurationDialog
        isOpen={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        agentId={agentId}
        config={editingConfig}
        onSave={loadAlertData}
      />
    </div>
  );
};
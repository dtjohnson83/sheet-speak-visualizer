import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AlertConfig {
  id?: string;
  alert_type: string;
  is_enabled: boolean;
  severity_threshold: string;
  cooldown_minutes: number;
  email_enabled: boolean;
  email_address?: string;
  webhook_enabled: boolean;
  webhook_url?: string;
  thresholds: Record<string, number>;
}

interface AlertConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  config?: AlertConfig;
  onSave: () => void;
}

export const AlertConfigurationDialog = ({
  isOpen,
  onClose,
  agentId,
  config,
  onSave
}: AlertConfigurationDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<AlertConfig>({
    alert_type: config?.alert_type || 'all',
    is_enabled: config?.is_enabled ?? true,
    severity_threshold: config?.severity_threshold || 'medium',
    cooldown_minutes: config?.cooldown_minutes || 60,
    email_enabled: config?.email_enabled ?? true,
    email_address: config?.email_address || '',
    webhook_enabled: config?.webhook_enabled ?? false,
    webhook_url: config?.webhook_url || '',
    thresholds: config?.thresholds || {
      min_anomalies: 1,
      min_trend_change: 10,
      min_affected_percentage: 5
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        agent_id: agentId,
        ...formData
      };

      if (config?.id) {
        // Update existing config
        const { error } = await supabase
          .from('agent_alert_configs')
          .update(payload)
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        // Create new config
        const { error } = await supabase
          .from('agent_alert_configs')
          .insert(payload);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Alert configuration saved successfully",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving alert config:', error);
      toast({
        title: "Error",
        description: "Failed to save alert configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {config ? 'Edit Alert Configuration' : 'Create Alert Configuration'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Settings</CardTitle>
              <CardDescription>Configure alert type and thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert_type">Alert Type</Label>
                  <Select 
                    value={formData.alert_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, alert_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="all">All Insights</SelectItem>
                      <SelectItem value="anomaly">Anomalies Only</SelectItem>
                      <SelectItem value="trend">Trends Only</SelectItem>
                      <SelectItem value="data_quality_issue">Data Quality Issues</SelectItem>
                      <SelectItem value="summary">Summary Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity_threshold">Minimum Severity</Label>
                  <Select 
                    value={formData.severity_threshold} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, severity_threshold: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooldown_minutes">Cooldown Period (minutes)</Label>
                <Input
                  id="cooldown_minutes"
                  type="number"
                  min="1"
                  value={formData.cooldown_minutes}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cooldown_minutes: parseInt(e.target.value) || 60 
                  }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_enabled"
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
                />
                <Label htmlFor="is_enabled">Enable this alert configuration</Label>
              </div>
            </CardContent>
          </Card>

          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Channels</CardTitle>
              <CardDescription>Choose how you want to receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email_enabled"
                    checked={formData.email_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_enabled: checked }))}
                  />
                  <Label htmlFor="email_enabled">Email notifications</Label>
                </div>

                {formData.email_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="email_address">Email Address</Label>
                    <Input
                      id="email_address"
                      type="email"
                      placeholder="your-email@example.com"
                      value={formData.email_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, email_address: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="webhook_enabled"
                    checked={formData.webhook_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, webhook_enabled: checked }))}
                  />
                  <Label htmlFor="webhook_enabled">Webhook notifications</Label>
                </div>

                {formData.webhook_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">Webhook URL</Label>
                    <Input
                      id="webhook_url"
                      type="url"
                      placeholder="https://your-webhook-endpoint.com/alerts"
                      value={formData.webhook_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alert Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Thresholds</CardTitle>
              <CardDescription>Fine-tune when alerts should be triggered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_anomalies">Min Anomalies</Label>
                  <Input
                    id="min_anomalies"
                    type="number"
                    min="1"
                    value={formData.thresholds.min_anomalies}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        min_anomalies: parseInt(e.target.value) || 1
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_trend_change">Min Trend Change (%)</Label>
                  <Input
                    id="min_trend_change"
                    type="number"
                    min="0"
                    value={formData.thresholds.min_trend_change}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        min_trend_change: parseFloat(e.target.value) || 10
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_affected_percentage">Min Affected Data (%)</Label>
                  <Input
                    id="min_affected_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.thresholds.min_affected_percentage}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        min_affected_percentage: parseFloat(e.target.value) || 5
                      }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
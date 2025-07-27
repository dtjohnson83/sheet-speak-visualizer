import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, TrendingUp } from 'lucide-react';
import { BusinessRule } from '@/types/agents';
import { useToast } from '@/hooks/use-toast';

interface BusinessRuleConfigurationDialogProps {
  agentId: string;
  columns: string[];
  onRuleCreated: (rule: Partial<BusinessRule>) => void;
  trigger?: React.ReactNode;
}

interface BusinessRuleFormData {
  rule_name: string;
  description: string;
  metric_column: string;
  operator: BusinessRule['operator'];
  threshold_value: number;
  comparison_type: BusinessRule['comparison_type'];
  time_window: BusinessRule['time_window'];
  baseline_calculation: BusinessRule['baseline_calculation'];
  alert_frequency: BusinessRule['alert_frequency'];
  is_active: boolean;
}

export const BusinessRuleConfigurationDialog: React.FC<BusinessRuleConfigurationDialogProps> = ({
  agentId,
  columns,
  onRuleCreated,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<BusinessRuleFormData>({
    rule_name: '',
    description: '',
    metric_column: '',
    operator: '>',
    threshold_value: 0,
    comparison_type: 'percentage',
    time_window: 'monthly',
    baseline_calculation: 'previous_period',
    alert_frequency: 'immediate',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const rule: Partial<BusinessRule> = {
        agent_id: agentId,
        ...formData,
        threshold_value: Number(formData.threshold_value)
      };

      await onRuleCreated(rule);
      
      setOpen(false);
      setFormData({
        rule_name: '',
        description: '',
        metric_column: '',
        operator: '>',
        threshold_value: 0,
        comparison_type: 'percentage',
        time_window: 'monthly',
        baseline_calculation: 'previous_period',
        alert_frequency: 'immediate',
        is_active: true
      });

      toast({
        title: "Business Rule Created",
        description: "Your business rule has been configured successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create business rule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOperatorLabel = (operator: string) => {
    const labels = {
      '>': 'Greater than',
      '<': 'Less than',
      '>=': 'Greater than or equal to',
      '<=': 'Less than or equal to',
      '=': 'Equal to',
      '!=': 'Not equal to'
    };
    return labels[operator as keyof typeof labels] || operator;
  };

  const getExampleText = () => {
    if (!formData.metric_column || !formData.operator || !formData.threshold_value) {
      return "Configure your rule to see an example";
    }

    const comparisonText = formData.comparison_type === 'percentage' ? 
      `${formData.threshold_value}%` : 
      formData.threshold_value.toString();

    const timeText = formData.time_window.replace('ly', '');
    
    return `Alert when ${formData.metric_column} ${getOperatorLabel(formData.operator).toLowerCase()} ${comparisonText} compared to ${formData.baseline_calculation.replace('_', ' ')} (${timeText} check)`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Business Rule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Configure Business Rule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">Rule Name *</Label>
                <Input
                  id="rule_name"
                  value={formData.rule_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                  placeholder="e.g., MOM Sales Growth Alert"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric_column">Metric Column *</Label>
                <Select
                  value={formData.metric_column}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, metric_column: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe when this rule should trigger alerts..."
                className="min-h-20"
              />
            </div>
          </div>

          {/* Rule Configuration */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Rule Configuration</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operator">Condition</Label>
                <Select
                  value={formData.operator}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, operator: value as BusinessRule['operator'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">Greater than (&gt;)</SelectItem>
                    <SelectItem value="<">Less than (&lt;)</SelectItem>
                    <SelectItem value=">=">Greater or equal (≥)</SelectItem>
                    <SelectItem value="<=">Less or equal (≤)</SelectItem>
                    <SelectItem value="=">Equal to (=)</SelectItem>
                    <SelectItem value="!=">Not equal (≠)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold_value">Threshold Value *</Label>
                <Input
                  id="threshold_value"
                  type="number"
                  step="0.01"
                  value={formData.threshold_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, threshold_value: parseFloat(e.target.value) || 0 }))}
                  placeholder="10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparison_type">Comparison Type</Label>
                <Select
                  value={formData.comparison_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, comparison_type: value as BusinessRule['comparison_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Change</SelectItem>
                    <SelectItem value="absolute">Absolute Value</SelectItem>
                    <SelectItem value="trend">Trend Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_window">Time Window</Label>
                <Select
                  value={formData.time_window}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, time_window: value as BusinessRule['time_window'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseline_calculation">Baseline Calculation</Label>
                <Select
                  value={formData.baseline_calculation}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, baseline_calculation: value as BusinessRule['baseline_calculation'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previous_period">Previous Period</SelectItem>
                    <SelectItem value="moving_average">Moving Average</SelectItem>
                    <SelectItem value="fixed_value">Fixed Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alert_frequency">Alert Frequency</Label>
                <Select
                  value={formData.alert_frequency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, alert_frequency: value as BusinessRule['alert_frequency'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Rule Status</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active" className="text-sm">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2 border-t pt-4">
            <Label>Rule Preview</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              {getExampleText()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
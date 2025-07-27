import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, CheckCircle, TrendingUp, Clock, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { BusinessRule } from '@/types/agents';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface BusinessRulesListProps {
  rules: BusinessRule[];
  onToggleRule: (ruleId: string, isActive: boolean) => void;
  onEditRule: (rule: BusinessRule) => void;
  onDeleteRule: (ruleId: string) => void;
  isLoading?: boolean;
}

export const BusinessRulesList: React.FC<BusinessRulesListProps> = ({
  rules,
  onToggleRule,
  onEditRule,
  onDeleteRule,
  isLoading = false
}) => {
  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Business Rules Configured</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first business rule to get automated alerts when your KPIs change.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getOperatorSymbol = (operator: string) => {
    const symbols = {
      '>': '>',
      '<': '<',
      '>=': '≥',
      '<=': '≤',
      '=': '=',
      '!=': '≠'
    };
    return symbols[operator as keyof typeof symbols] || operator;
  };

  const getSeverityColor = (triggerCount: number) => {
    if (triggerCount === 0) return 'default';
    if (triggerCount < 5) return 'secondary';
    if (triggerCount < 10) return 'destructive';
    return 'destructive';
  };

  const getSeverityIcon = (triggerCount: number) => {
    if (triggerCount === 0) return CheckCircle;
    return AlertTriangle;
  };

  return (
    <div className="space-y-4">
      {rules.map((rule) => {
        const SeverityIcon = getSeverityIcon(rule.trigger_count);
        
        return (
          <Card key={rule.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <SeverityIcon className={`h-4 w-4 ${rule.trigger_count > 0 ? 'text-destructive' : 'text-green-500'}`} />
                    {rule.rule_name}
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {rule.description || 'No description provided'}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                    disabled={isLoading}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditRule(rule)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Rule
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteRule(rule.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Rule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Rule Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Metric:</span> {rule.metric_column}
                </div>
                <div>
                  <span className="font-medium">Condition:</span> {getOperatorSymbol(rule.operator)} {rule.threshold_value}
                  {rule.comparison_type === 'percentage' && '%'}
                </div>
                <div>
                  <span className="font-medium">Time Window:</span> {rule.time_window}
                </div>
                <div>
                  <span className="font-medium">Baseline:</span> {rule.baseline_calculation.replace('_', ' ')}
                </div>
              </div>

              {/* Statistics */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Triggered {rule.trigger_count} times</span>
                  </div>
                  {rule.last_triggered && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Last triggered {formatDistanceToNow(rule.last_triggered)} ago</span>
                    </div>
                  )}
                </div>
                
                <Badge variant={getSeverityColor(rule.trigger_count)}>
                  Alert Frequency: {rule.alert_frequency}
                </Badge>
              </div>

              {/* Rule Summary */}
              <div className="p-3 bg-muted rounded-md text-sm">
                <strong>Rule:</strong> Alert when <em>{rule.metric_column}</em> {getOperatorSymbol(rule.operator)} {rule.threshold_value}
                {rule.comparison_type === 'percentage' && '%'} compared to {rule.baseline_calculation.replace('_', ' ')} ({rule.time_window} check)
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
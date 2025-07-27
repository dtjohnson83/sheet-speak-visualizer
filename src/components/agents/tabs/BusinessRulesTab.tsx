import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessRuleConfigurationDialog } from '../business-rules/BusinessRuleConfigurationDialog';
import { BusinessRulesList } from '../business-rules/BusinessRulesList';
import { useBusinessRules } from '@/hooks/agents/useBusinessRules';
import { Agent } from '@/types/agents';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BusinessRulesTabProps {
  agent: Agent;
  columns: string[];
}

export const BusinessRulesTab: React.FC<BusinessRulesTabProps> = ({
  agent,
  columns
}) => {
  const {
    rules,
    violations,
    isLoading,
    createRule,
    toggleRule,
    deleteRule,
  } = useBusinessRules(agent.id);

  const activeRules = rules.filter(rule => rule.is_active);
  const recentViolations = violations.slice(0, 5);

  const handleCreateRule = async (ruleData: any) => {
    await createRule(ruleData);
  };

  const handleEditRule = (rule: any) => {
    // TODO: Implement edit functionality
    console.log('Edit rule:', rule);
  };

  return (
    <TabsContent value="business-rules" className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {rules.length - activeRules.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentViolations.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={activeRules.length > 0 ? 'default' : 'secondary'}>
                {activeRules.length > 0 ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Business monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Rules Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Rules Configuration
              </CardTitle>
              <CardDescription>
                Configure automated alerts for business KPI changes and thresholds
              </CardDescription>
            </div>
            <BusinessRuleConfigurationDialog
              agentId={agent.id}
              columns={columns}
              onRuleCreated={handleCreateRule}
            />
          </div>
        </CardHeader>
        <CardContent>
          <BusinessRulesList
            rules={rules}
            onToggleRule={toggleRule}
            onEditRule={handleEditRule}
            onDeleteRule={deleteRule}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Recent Violations */}
      {recentViolations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Recent Rule Violations
            </CardTitle>
            <CardDescription>
              Latest business rule violations and threshold breaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentViolations.map((violation) => (
                <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${
                      violation.violation_severity === 'critical' ? 'text-red-500' :
                      violation.violation_severity === 'high' ? 'text-orange-500' :
                      violation.violation_severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">
                        Threshold breach: {violation.metric_value} vs {violation.threshold_value}
                      </p>
                      {violation.percentage_change && (
                        <p className="text-xs text-muted-foreground">
                          {violation.percentage_change > 0 ? '+' : ''}{violation.percentage_change.toFixed(1)}% change
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      violation.violation_severity === 'critical' ? 'destructive' :
                      violation.violation_severity === 'high' ? 'destructive' :
                      violation.violation_severity === 'medium' ? 'secondary' :
                      'outline'
                    }>
                      {violation.violation_severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(violation.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      {rules.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started with Business Rules</CardTitle>
            <CardDescription>
              Set up automated monitoring for your key business metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Common Rule Examples:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Alert when monthly sales increase by 10%</li>
                  <li>• Notify if customer churn rate exceeds 5%</li>
                  <li>• Warn when inventory drops below 100 units</li>
                  <li>• Alert on revenue growth above 15%</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Rule Components:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Metric:</strong> Which column to monitor</li>
                  <li>• <strong>Condition:</strong> Greater/less than threshold</li>
                  <li>• <strong>Threshold:</strong> Target value or percentage</li>
                  <li>• <strong>Time Window:</strong> Daily, weekly, monthly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
};
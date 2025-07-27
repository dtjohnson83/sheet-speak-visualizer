import React from 'react';
import { AIAgent, AgentTask, AgentInsight, BusinessRuleViolation } from '@/types/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Brain, BarChart3 } from 'lucide-react';

interface AgentOutputAggregatorProps {
  agents: AIAgent[];
  tasks: AgentTask[];
  insights: AgentInsight[];
  businessRuleViolations?: BusinessRuleViolation[];
}

interface ExecutiveSummary {
  overallHealth: number;
  criticalIssues: number;
  activeMonitoring: number;
  keyInsights: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
    trends: {
      direction: 'up' | 'down' | 'stable';
      confidence: number;
    };
  recommendations: string[];
}

export const AgentOutputAggregator: React.FC<AgentOutputAggregatorProps> = ({
  agents,
  tasks,
  insights,
  businessRuleViolations = []
}) => {
  const generateExecutiveSummary = (): ExecutiveSummary => {
    const activeAgents = agents.filter(agent => agent.status === 'active');
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const criticalInsights = insights.filter(insight => insight.severity === 'critical');
    const highSeverityViolations = businessRuleViolations.filter(v => v.severity === 'critical');

    // Calculate overall health score
    const agentHealthScore = activeAgents.length / Math.max(agents.length, 1) * 100;
    const taskSuccessRate = completedTasks.length / Math.max(tasks.length, 1) * 100;
    const issueScore = Math.max(0, 100 - (criticalInsights.length + highSeverityViolations.length) * 10);
    const overallHealth = (agentHealthScore + taskSuccessRate + issueScore) / 3;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (highSeverityViolations.length > 3 || criticalInsights.length > 5) {
      riskLevel = 'critical';
    } else if (highSeverityViolations.length > 1 || criticalInsights.length > 2) {
      riskLevel = 'high';
    } else if (overallHealth < 70) {
      riskLevel = 'medium';
    }

    // Analyze trends
    const recentInsights = insights.filter(insight => 
      new Date(insight.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    const previousInsights = insights.filter(insight => {
      const date = new Date(insight.created_at).getTime();
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      return date > twoWeeksAgo && date <= weekAgo;
    });

    let trends: { direction: 'up' | 'down' | 'stable'; confidence: number } = { direction: 'stable', confidence: 0.5 };
    if (recentInsights.length > previousInsights.length * 1.2) {
      trends = { direction: 'up', confidence: 0.8 };
    } else if (recentInsights.length < previousInsights.length * 0.8) {
      trends = { direction: 'down', confidence: 0.8 };
    }

    // Generate key insights
    const keyInsights = [
      `${activeAgents.length} of ${agents.length} agents actively monitoring`,
      `${completedTasks.length} tasks completed successfully`,
      `${insights.length} insights generated across all agents`,
      businessRuleViolations.length > 0 ? `${businessRuleViolations.length} business rule violations detected` : 'All business rules compliant'
    ];

    // Generate recommendations
    const recommendations = [];
    if (activeAgents.length < agents.length) {
      recommendations.push(`Activate ${agents.length - activeAgents.length} inactive agents for comprehensive monitoring`);
    }
    if (criticalInsights.length > 0) {
      recommendations.push(`Address ${criticalInsights.length} critical insights requiring immediate attention`);
    }
    if (highSeverityViolations.length > 0) {
      recommendations.push(`Resolve ${highSeverityViolations.length} critical business rule violations`);
    }
    if (recommendations.length === 0) {
      recommendations.push('System operating optimally - continue current monitoring strategy');
    }

    return {
      overallHealth,
      criticalIssues: criticalInsights.length + highSeverityViolations.length,
      activeMonitoring: activeAgents.length,
      keyInsights,
      riskLevel,
      trends,
      recommendations
    };
  };

  const summary = generateExecutiveSummary();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.overallHealth.toFixed(1)}%</div>
            <Progress value={summary.overallHealth} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Aggregate performance across all agents
            </p>
          </CardContent>
        </Card>

        {/* Risk Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${getRiskColor(summary.riskLevel)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getRiskColor(summary.riskLevel)}`}>
              {summary.riskLevel}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.criticalIssues} critical issues detected
            </p>
          </CardContent>
        </Card>

        {/* Active Monitoring */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeMonitoring}</div>
            <div className="flex items-center space-x-2 mt-2">
              {getTrendIcon(summary.trends.direction)}
              <span className="text-xs text-muted-foreground">
                agents monitoring data quality
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Key Insights</h4>
            <ul className="space-y-1">
              {summary.keyInsights.map((insight, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {summary.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map(agent => {
              const agentTasks = tasks.filter(task => task.agent_id === agent.id);
              const agentInsights = insights.filter(insight => insight.agent_id === agent.id);
              const successRate = agentTasks.length > 0 
                ? (agentTasks.filter(t => t.status === 'completed').length / agentTasks.length) * 100 
                : 0;

              return (
                <div key={agent.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{agent.name}</span>
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {agentTasks.length} tasks, {agentInsights.length} insights
                  </div>
                  <Progress value={successRate} className="h-1" />
                  <div className="text-xs text-muted-foreground">
                    {successRate.toFixed(0)}% success rate
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
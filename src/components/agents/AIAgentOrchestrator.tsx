
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Activity, 
  Settings, 
  BarChart3, 
  List,
  FileSpreadsheet 
} from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { AgentOverviewTab } from './tabs/AgentOverviewTab';
import { AgentManagementTab } from './tabs/AgentManagementTab';
import { TaskManagementTab } from './tabs/TaskManagementTab';
import { InsightManagementTab } from './tabs/InsightManagementTab';
import { ReportAutomationTab } from './tabs/ReportAutomationTab';

interface AIAgentOrchestratorProps {
  data: any[];
  columns: any[];
  fileName: string;
  onAIUsed?: () => void;
}

export const AIAgentOrchestrator = ({ data, columns, fileName, onAIUsed }: AIAgentOrchestratorProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    agents,
    tasks,
    insights,
    agentSummary,
    isLoading,
    createAgent,
    updateAgentStatus,
    deleteAgent,
    deleteAllAgents,
    createTask,
    deleteTask,
    clearAllTasks,
    markInsightRead,
    deleteInsight,
    clearAllInsights,
    triggerProcessor,
    scheduleTasksForDataset,
    isDeletingAgent,
    isDeletingAllAgents,
    isDeletingTask,
    isClearingAllTasks,
    isDeletingInsight,
    isClearingAllInsights
  } = useAIAgents();

  const handleCreateAgent = (type: string) => {
    const agentConfig = {
      data_quality: {
        name: 'Data Quality Monitor',
        description: 'Monitors data completeness, accuracy, and consistency',
        type: 'data_quality' as const,
        capabilities: ['data_validation', 'completeness_check', 'accuracy_assessment'],
        configuration: {
          schedule: { frequency: 'daily' as const, time: '09:00' },
          thresholds: { completeness: 95, accuracy: 98 }
        }
      },
      anomaly_detection: {
        name: 'Anomaly Detection Agent',
        description: 'Identifies unusual patterns and outliers in your data',
        type: 'anomaly_detection' as const,
        capabilities: ['outlier_detection', 'pattern_analysis', 'statistical_monitoring'],
        configuration: {
          schedule: { frequency: 'hourly' as const },
          thresholds: { sensitivity: 0.95, confidence: 0.8 }
        }
      },
      trend_analysis: {
        name: 'Trend Analysis Agent',
        description: 'Analyzes trends and patterns over time',
        type: 'trend_analysis' as const,
        capabilities: ['trend_detection', 'seasonal_analysis', 'forecasting'],
        configuration: {
          schedule: { frequency: 'weekly' as const, time: '10:00' },
          thresholds: { trend_strength: 0.7, seasonality: 0.6 }
        }
      },
      predictive_analytics: {
        name: 'Predictive Analytics Agent',
        description: 'Forecasts future trends based on historical data',
        type: 'predictive_analytics' as const,
        capabilities: ['forecasting', 'regression_analysis', 'model_training'],
        configuration: {
          schedule: { frequency: 'weekly' as const, time: '11:00' },
          thresholds: { accuracy: 0.85, confidence_interval: 0.95 }
        }
      },
      report_automation: {
        name: 'Report Automation Agent',
        description: 'Automates Excel report generation and distribution',
        type: 'report_automation' as const,
        capabilities: ['report_generation', 'template_management', 'automated_distribution'],
        configuration: {
          schedule: { frequency: 'weekly' as const, time: '08:00' },
          reportConfig: {
            outputFormat: 'excel' as const,
            recipients: [],
            includeCharts: true,
            autoDistribute: false
          }
        }
      }
    };

    const config = agentConfig[type as keyof typeof agentConfig];
    if (config) {
      createAgent(config);
      onAIUsed?.();
    }
  };

  const handleToggleAgent = (agent: any) => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    updateAgentStatus({ agentId: agent.id, status: newStatus });
  };

  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const unreadInsights = insights.filter(insight => !insight.is_read).length;

  const tabs = [
    { value: 'overview', label: 'Overview', icon: Activity, badge: agents.length },
    { value: 'management', label: 'Agents', icon: Bot, badge: activeAgents },
    { value: 'tasks', label: 'Tasks', icon: List, badge: pendingTasks },
    { value: 'insights', label: 'Insights', icon: BarChart3, badge: unreadInsights },
    { value: 'report-automation', label: 'Reports', icon: FileSpreadsheet }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading AI agents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI Agent Orchestrator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage AI agents that continuously monitor and analyze your data, providing automated insights and quality assessments.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="relative">
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <AgentOverviewTab
          agents={agents}
          onCreateAgent={handleCreateAgent}
        />

        <AgentManagementTab
          agents={agents}
          onToggleAgent={handleToggleAgent}
          onDeleteAgent={deleteAgent}
          onDeleteAllAgents={deleteAllAgents}
          isDeletingAgent={isDeletingAgent}
          isDeletingAllAgents={isDeletingAllAgents}
        />

        <TaskManagementTab
          tasks={tasks}
          onDeleteTask={deleteTask}
          onClearAllTasks={clearAllTasks}
          isDeletingTask={isDeletingTask}
          isClearingAllTasks={isClearingAllTasks}
        />

        <InsightManagementTab
          insights={insights}
          onMarkInsightRead={markInsightRead}
          onDeleteInsight={deleteInsight}
          onClearAllInsights={clearAllInsights}
          isDeletingInsight={isDeletingInsight}
          isClearingAllInsights={isClearingAllInsights}
        />

        <ReportAutomationTab />
      </Tabs>
    </div>
  );
};

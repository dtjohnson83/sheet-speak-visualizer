import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Activity, 
  Settings, 
  BarChart3, 
  List,
  FileSpreadsheet,
  Calendar,
  Bell,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { AgentCreationWizard } from './AgentCreationWizard';
import { AgentManagementTab } from './tabs/AgentManagementTab';
import { SchedulingTab } from './tabs/SchedulingTab';
import { TaskManagementTab } from './tabs/TaskManagementTab';
import { InsightManagementTab } from './tabs/InsightManagementTab';
import { ExecutiveSummaryTab } from './tabs/ExecutiveSummaryTab';
import { DomainSurvey, DomainContext } from './DomainSurvey';
import { DataContext, Agent } from '@/types/agents';
import { AgentDetailView } from './AgentDetailView';

interface AIAgentOrchestratorProps {
  data: any[];
  columns: any[];
  fileName: string;
  onAIUsed?: () => void;
}

export const AIAgentOrchestrator = ({ data, columns, fileName, onAIUsed }: AIAgentOrchestratorProps) => {
  const [activeTab, setActiveTab] = useState('create');
  const [showDomainSurvey, setShowDomainSurvey] = useState(false);
  const [pendingAgentType, setPendingAgentType] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDetail, setShowAgentDetail] = useState(false);
  
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

  // Create data context from orchestrator props
  const createDataContext = (domainContext?: DomainContext): DataContext => ({
    data,
    columns,
    fileName,
    rowCount: data.length,
    columnCount: columns.length,
    domainContext
  });

  const createAgentWithConfig = (type: string, domainContext?: DomainContext) => {
    const agentConfig = {
      data_quality: {
        name: 'Data Quality Monitor',
        description: 'Monitors data completeness, accuracy, and consistency',
        type: 'data_quality' as const,
        capabilities: ['data_validation', 'completeness_check', 'accuracy_assessment'],
        configuration: {
          schedule: { frequency: 'daily' as const, time: '09:00' },
          thresholds: { completeness: 95, accuracy: 98 },
          dataContext: createDataContext(domainContext)
        }
      },
      anomaly_detection: {
        name: 'Anomaly Detection Agent',
        description: 'Identifies unusual patterns and outliers in your data',
        type: 'anomaly_detection' as const,
        capabilities: ['outlier_detection', 'pattern_analysis', 'statistical_monitoring'],
        configuration: {
          schedule: { frequency: 'hourly' as const },
          thresholds: { sensitivity: 0.95, confidence: 0.8 },
          dataContext: createDataContext(domainContext)
        }
      },
      trend_analysis: {
        name: 'Trend Analysis Agent',
        description: 'Analyzes trends and patterns over time',
        type: 'trend_analysis' as const,
        capabilities: ['trend_detection', 'seasonal_analysis', 'forecasting'],
        configuration: {
          schedule: { frequency: 'weekly' as const, time: '10:00' },
          thresholds: { trend_strength: 0.7, seasonality: 0.6 },
          dataContext: createDataContext(domainContext)
        }
      },
      predictive_analytics: {
        name: domainContext ? `${domainContext.domain} Predictive Analytics Agent` : 'Predictive Analytics Agent',
        description: domainContext 
          ? `Domain-aware forecasting for ${domainContext.industry || domainContext.domain} data`
          : 'Forecasts future trends based on historical data',
        type: 'predictive_analytics' as const,
        capabilities: domainContext 
          ? ['domain_aware_prediction', 'business_forecasting', 'predictive_modeling', ...(domainContext.analysisGoals || [])]
          : ['forecasting', 'regression_analysis', 'model_training'],
        configuration: {
          schedule: { frequency: 'weekly' as const, time: '11:00' },
          thresholds: { accuracy: 0.85, confidence_interval: 0.95 },
          domainContext,
          dataContext: createDataContext(domainContext)
        }
      },
      executive_summary: {
        name: 'AI Chief Data Officer',
        description: 'Aggregates insights from all agents and provides executive-level reporting',
        type: 'executive_summary' as const,
        capabilities: ['multi_agent_aggregation', 'executive_reporting', 'strategic_insights', 'risk_assessment'],
        configuration: {
          schedule: { frequency: 'daily' as const, time: '07:00' },
          thresholds: { riskThreshold: 0.7, healthThreshold: 0.8 },
          dataContext: createDataContext(domainContext),
          reportingLevel: 'executive',
          consolidationScope: 'all_agents'
        }
      }
    };

    const config = agentConfig[type as keyof typeof agentConfig];
    if (config) {
      createAgent(config);
      onAIUsed?.();
    }
  };

  const handleCreateAgent = (type: string) => {
    // For predictive analytics, show domain survey first
    if (type === 'predictive_analytics') {
      setPendingAgentType(type);
      setShowDomainSurvey(true);
      return;
    }

    // For other agent types, create directly
    createAgentWithConfig(type);
  };

  const handleDomainSurveyComplete = (domainContext: DomainContext) => {
    setShowDomainSurvey(false);
    if (pendingAgentType) {
      createAgentWithConfig(pendingAgentType, domainContext);
      setPendingAgentType(null);
    }
  };

  const handleDomainSurveySkip = () => {
    setShowDomainSurvey(false);
    if (pendingAgentType) {
      createAgentWithConfig(pendingAgentType);
      setPendingAgentType(null);
    }
  };

  const handleConfigureAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentDetail(true);
  };

  // Calculate notification counts
  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const runningTasks = tasks.filter(task => task.status === 'running').length;
  const unreadInsights = insights.filter(insight => !insight.is_read).length;
  const failedTasks = tasks.filter(task => task.status === 'failed').length;

  const criticalInsights = insights.filter(insight => insight.severity === 'critical').length;
  
  const tabs = [
    { value: 'cdo', label: 'CDO', icon: TrendingUp, badge: criticalInsights },
    { value: 'create', label: 'Create Agents', icon: Bot, badge: null },
    { value: 'manage', label: 'Manage', icon: Settings, badge: activeAgents },
    { value: 'scheduling', label: 'Scheduling', icon: Calendar, badge: activeAgents },
    { value: 'tasks', label: 'Tasks', icon: List, badge: pendingTasks },
    { value: 'insights', label: 'Insights', icon: BarChart3, badge: unreadInsights }
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
            Create and manage AI agents that automatically analyze your data. Start by creating agents, then run them to generate insights and monitor data quality.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 gap-y-2 min-h-fit">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="relative p-2 sm:p-3 min-h-10">
              <tab.icon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cdo">
          <ExecutiveSummaryTab
            agents={agents}
            tasks={tasks}
            insights={insights}
            data={data}
            columns={columns}
            fileName={fileName}
          />
        </TabsContent>

        <TabsContent value="create">
          <AgentCreationWizard
            agents={agents}
            onCreateAgent={handleCreateAgent}
            isCreating={false}
            currentDataset={{
              fileName,
              rowCount: data.length,
              columnCount: columns.length
            }}
          />
        </TabsContent>

        <TabsContent value="manage">
          <AgentManagementTab
            agents={agents}
            tasks={tasks}
            onCreateAgent={createAgent}
            onUpdateStatus={updateAgentStatus}
            onDeleteAgent={deleteAgent}
            onDeleteAll={deleteAllAgents}
            onTriggerProcessor={() => triggerProcessor()}
            onClearPendingTasks={() => clearAllTasks('pending')}
            onConfigureAgent={handleConfigureAgent}
          />
        </TabsContent>

        <TabsContent value="scheduling">
          <SchedulingTab />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManagementTab
            tasks={tasks}
            onCreate={createTask}
            onDelete={deleteTask}
            onClearAll={clearAllTasks}
            onScheduleForDataset={scheduleTasksForDataset}
            isDeletingTask={isDeletingTask}
            isClearingAllTasks={isClearingAllTasks}
          />
        </TabsContent>

        <TabsContent value="insights">
          <InsightManagementTab
            insights={insights}
            onMarkRead={markInsightRead}
            onDelete={deleteInsight}
            onClearAll={clearAllInsights}
            isDeletingInsight={isDeletingInsight}
            isClearingAllInsights={isClearingAllInsights}
          />
        </TabsContent>
      </Tabs>

      {/* Domain Survey Modal */}
      <DomainSurvey
        open={showDomainSurvey}
        onClose={() => setShowDomainSurvey(false)}
        onComplete={handleDomainSurveyComplete}
        onSkip={handleDomainSurveySkip}
      />

      {/* Agent Detail View */}
      <AgentDetailView
        agent={selectedAgent}
        open={showAgentDetail}
        onClose={() => setShowAgentDetail(false)}
        columns={columns.map(col => typeof col === 'string' ? col : col.name || col.key || '')}
      />
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Agent } from '@/types/agents';

interface AgentCreationWizardProps {
  agents: Agent[];
  onCreateAgent: (type: string) => void;
  isCreating?: boolean;
}

export const AgentCreationWizard = ({ agents, onCreateAgent, isCreating }: AgentCreationWizardProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'data_quality': return CheckCircle;
      case 'anomaly_detection': return AlertTriangle;
      case 'trend_analysis': return TrendingUp;
      case 'predictive_analytics': return BarChart3;
      default: return Activity;
    }
  };

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'data_quality': return 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'anomaly_detection': return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'trend_analysis': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'predictive_analytics': return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const agentTypes = [
    {
      type: 'data_quality',
      name: 'Data Quality Monitor',
      description: 'Monitors data completeness, accuracy, and consistency',
      benefits: ['Automatically detects data issues', 'Ensures data reliability', 'Continuous monitoring'],
      useCase: 'Perfect for maintaining high-quality datasets and catching data problems early'
    },
    {
      type: 'anomaly_detection',
      name: 'Anomaly Detection',
      description: 'Identifies unusual patterns and outliers in your data',
      benefits: ['Spots unusual patterns', 'Detects fraudulent activity', 'Real-time alerting'],
      useCase: 'Ideal for fraud detection, quality control, and identifying unexpected behavior'
    },
    {
      type: 'trend_analysis',
      name: 'Trend Analyzer',
      description: 'Analyzes trends and patterns over time',
      benefits: ['Identifies growth patterns', 'Seasonal analysis', 'Historical insights'],
      useCase: 'Great for business intelligence, performance tracking, and understanding data patterns'
    },
    {
      type: 'predictive_analytics',
      name: 'Predictive Analytics',
      description: 'Forecasts future trends based on historical data',
      benefits: ['Future forecasting', 'Business planning', 'Risk assessment'],
      useCase: 'Essential for strategic planning, inventory management, and risk mitigation'
    }
  ];

  const getExistingAgent = (type: string) => agents.find(a => a.type === type);

  const handleCreateAgent = () => {
    if (selectedType) {
      onCreateAgent(selectedType);
      setSelectedType(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>AI Agent Creation Wizard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            AI agents work automatically to analyze your data and provide insights. Create an agent below, then use the "Manage" tab to run it and view results in the "Tasks" and "Insights" tabs.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentTypes.map((agentType) => {
            const Icon = getAgentTypeIcon(agentType.type);
            const existingAgent = getExistingAgent(agentType.type);
            const isSelected = selectedType === agentType.type;
            
            return (
              <Card 
                key={agentType.type} 
                className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                  isSelected 
                    ? getAgentTypeColor(agentType.type)
                    : 'border-border hover:border-primary/20'
                }`}
                onClick={() => setSelectedType(agentType.type)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getAgentTypeColor(agentType.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{agentType.name}</h4>
                          {existingAgent && (
                            <Badge variant="secondary" className="mt-1">
                              Already created
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {agentType.description}
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Key Benefits:</p>
                      <ul className="text-xs space-y-1">
                        {agentType.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Use case:</span> {agentType.useCase}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedType && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Ready to create:</span>
              <Badge variant="secondary">
                {agentTypes.find(t => t.type === selectedType)?.name}
              </Badge>
            </div>
            <Button 
              onClick={handleCreateAgent}
              disabled={isCreating}
              className="flex items-center space-x-2"
            >
              {isCreating ? 'Creating...' : 'Create Agent'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
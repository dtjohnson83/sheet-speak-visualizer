
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bot, Play, Pause, Trash2, TrashIcon, Settings, Zap } from 'lucide-react';
import { AIAgent } from '@/types/agents';
import { CreateAgentDialog } from '../CreateAgentDialog';
import { formatDistanceToNow } from 'date-fns';

interface AgentManagementTabProps {
  agents: AIAgent[];
  onToggleAgent: (agent: AIAgent) => void;
  onDeleteAgent: (agentId: string) => void;
  onDeleteAllAgents: () => void;
  isDeletingAgent: boolean;
  isDeletingAllAgents: boolean;
}

export const AgentManagementTab = ({ 
  agents, 
  onToggleAgent, 
  onDeleteAgent, 
  onDeleteAllAgents,
  isDeletingAgent,
  isDeletingAllAgents
}: AgentManagementTabProps) => {
  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'monitoring': return '📊';
      case 'insight_generation': return '🧠';
      case 'visualization': return '👁️';
      case 'anomaly_detection': return '⚠️';
      case 'trend_analysis': return '📈';
      case 'data_quality': return '🛡️';
      case 'predictive_analytics': return '🔮';
      case 'report_automation': return '📋';
      default: return '🤖';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const inactiveAgents = agents.filter(agent => agent.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Agents</p>
                <p className="text-2xl font-bold text-blue-900">{agents.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">{activeAgents}</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveAgents}</p>
              </div>
              <Settings className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Bot className="h-5 w-5 text-blue-600" />
                Agent Management
              </CardTitle>
              <CardDescription className="text-blue-700">
                Configure and monitor your AI agents
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {agents.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-red-200">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Agents</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {agents.length} agents and their associated tasks and insights. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={onDeleteAllAgents}
                        disabled={isDeletingAllAgents}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingAllAgents ? 'Deleting...' : 'Delete All'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <CreateAgentDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {agents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-lg font-medium text-blue-900 mb-2">No agents created yet</p>
                <p className="text-sm text-blue-600 mb-4">
                  Create your first AI agent to start automating data analysis
                </p>
                <CreateAgentDialog />
              </div>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2 bg-blue-100 rounded-lg">
                        {getAgentIcon(agent.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-blue-900">{agent.name}</h4>
                          <Badge className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-600 font-medium">
                          {getTypeLabel(agent.type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onToggleAgent(agent)}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        {agent.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={isDeletingAgent}
                            className="text-destructive hover:text-destructive border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{agent.name}" and all its associated tasks and insights. 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeleteAgent(agent.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {agent.description && (
                    <p className="text-sm text-blue-700 mb-3 bg-blue-50 p-2 rounded">
                      {agent.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">Priority: {agent.priority}</span>
                      <span className="font-medium">Capabilities: {agent.capabilities.length}</span>
                    </div>
                    {agent.last_active && (
                      <span className="font-medium">
                        Last active {formatDistanceToNow(new Date(agent.last_active), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

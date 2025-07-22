import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bot, Play, Pause, Trash2, TrashIcon } from 'lucide-react';
import { Agent } from '@/types/agents';
import { CreateAgentDialog } from '../CreateAgentDialog';
import { formatDistanceToNow } from 'date-fns';

interface AgentManagementTabProps {
  agents: Agent[];
  onCreateAgent: (config: any) => void;
  onUpdateStatus: (params: { agentId: string; status: string }) => void;
  onDeleteAgent: (agentId: string) => void;
  onDeleteAll: () => void;
  onTriggerProcessor: () => void;
}

export const AgentManagementTab = ({ 
  agents, 
  onCreateAgent,
  onUpdateStatus,
  onDeleteAgent, 
  onDeleteAll,
  onTriggerProcessor
}: AgentManagementTabProps) => {
  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'monitoring': return '📊';
      case 'insight_generation': return '🧠';
      case 'visualization': return '👁️';
      case 'anomaly_detection': return '⚠️';
      case 'trend_analysis': return '📈';
      default: return '🤖';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'paused': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleToggleAgent = (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    onUpdateStatus({ agentId: agent.id, status: newStatus });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Agents ({agents.length})
            </CardTitle>
            <CardDescription>
              Manage your automated analysis agents
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {agents.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
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
                      onClick={onDeleteAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <CreateAgentDialog />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No agents created yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first AI agent to start automating data analysis
              </p>
              <CreateAgentDialog />
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getAgentIcon(agent.type)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{agent.name}</h4>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(agent.status)}
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getTypeLabel(agent.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleAgent(agent)}
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
                          className="text-destructive hover:text-destructive"
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
                  <p className="text-sm text-muted-foreground mb-3">
                    {agent.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Priority: {agent.priority}</span>
                    <span>Capabilities: {agent.capabilities.length}</span>
                  </div>
                  {agent.last_active && (
                    <span>
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
  );
};

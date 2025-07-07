import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Play, Pause, Trash2, Settings } from 'lucide-react';
import { AIAgent } from '@/types/agents';
import { useAIAgents } from '@/hooks/useAIAgents';
import { formatDistanceToNow } from 'date-fns';

interface AgentsListProps {
  agents: AIAgent[];
}

export const AgentsList = ({ agents }: AgentsListProps) => {
  const { updateAgentStatus, deleteAgent, isDeletingAgent } = useAIAgents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'paused': return 'bg-warning';
      case 'error': return 'bg-destructive';
      case 'disabled': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleToggleStatus = (agent: AIAgent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    updateAgentStatus({ agentId: agent.id, status: newStatus });
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent? This will also remove all associated tasks and insights. This action cannot be undone.')) {
      deleteAgent(agentId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Agents
        </CardTitle>
        <CardDescription>
          Manage your AI agents and their configurations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No agents created yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first AI agent to start automating data analysis
              </p>
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getTypeLabel(agent.type)}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(agent.status)}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleStatus(agent)}
                    >
                      {agent.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteAgent(agent.id)}
                      disabled={isDeletingAgent}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
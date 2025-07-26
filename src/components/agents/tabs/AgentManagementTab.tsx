import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bot, Play, Pause, Trash2, TrashIcon, Clock, Zap, Database, FileText, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Agent, AgentTask } from '@/types/agents';
import { CreateAgentDialog } from '../CreateAgentDialog';
import { formatDistanceToNow } from 'date-fns';

interface AgentManagementTabProps {
  agents: Agent[];
  tasks: AgentTask[];
  onCreateAgent: (config: any) => void;
  onUpdateStatus: (params: { agentId: string; status: string }) => void;
  onDeleteAgent: (agentId: string) => void;
  onDeleteAll: () => void;
  onTriggerProcessor: () => void;
  onClearPendingTasks: () => void;
}

export const AgentManagementTab = ({ 
  agents, 
  tasks,
  onCreateAgent,
  onUpdateStatus,
  onDeleteAgent, 
  onDeleteAll,
  onTriggerProcessor,
  onClearPendingTasks
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

  const getDatasetInfo = (agent: Agent) => {
    const dataContext = agent.configuration?.dataContext;
    if (!dataContext) return null;
    
    return {
      fileName: dataContext.fileName || 'Unknown Dataset',
      rowCount: dataContext.rowCount || 0,
      columnCount: dataContext.columnCount || 0
    };
  };

  const getAgentTaskStatus = (agentId: string) => {
    const agentTasks = tasks.filter(task => task.agent_id === agentId);
    const pendingTasks = agentTasks.filter(task => task.status === 'pending');
    const runningTasks = agentTasks.filter(task => task.status === 'running');
    const failedTasks = agentTasks.filter(task => task.status === 'failed');
    
    return {
      pending: pendingTasks.length,
      running: runningTasks.length,
      failed: failedTasks.length,
      total: agentTasks.length
    };
  };

  const getAgentAvailabilityStatus = (agentId: string) => {
    const taskStatus = getAgentTaskStatus(agentId);
    if (taskStatus.running > 0) return 'running';
    if (taskStatus.pending > 0) return 'busy';
    if (taskStatus.failed > 0) return 'has-errors';
    return 'available';
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'busy': return 'bg-warning';
      case 'has-errors': return 'bg-destructive';
      case 'available': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-3 w-3" />;
      case 'busy': return <AlertCircle className="h-3 w-3" />;
      case 'has-errors': return <XCircle className="h-3 w-3" />;
      case 'available': return <CheckCircle2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleToggleAgent = (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    onUpdateStatus({ agentId: agent.id, status: newStatus });
  };

  const pendingTaskCount = tasks.filter(task => task.status === 'pending').length;

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
            {pendingTaskCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-warning hover:text-warning">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Clear Pending ({pendingTaskCount})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Pending Tasks</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear {pendingTaskCount} pending task{pendingTaskCount > 1 ? 's' : ''}, allowing agents to process new requests. 
                      This will not affect running or completed tasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onClearPendingTasks}
                      className="bg-warning text-warning-foreground hover:bg-warning/90"
                    >
                      Clear Pending Tasks
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
            agents.map((agent) => {
              const datasetInfo = getDatasetInfo(agent);
              const taskStatus = getAgentTaskStatus(agent.id);
              const availabilityStatus = getAgentAvailabilityStatus(agent.id);
              
              return (
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
                          <Badge 
                            variant="outline" 
                            className={`text-xs flex items-center gap-1 ${getAvailabilityColor(availabilityStatus)}`}
                          >
                            {getAvailabilityIcon(availabilityStatus)}
                            {availabilityStatus === 'running' ? 'Processing' : 
                             availabilityStatus === 'busy' ? `${taskStatus.pending} Pending` :
                             availabilityStatus === 'has-errors' ? `${taskStatus.failed} Failed` : 'Available'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(agent.type)}
                          </p>
                          {datasetInfo && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {datasetInfo.fileName}
                            </Badge>
                          )}
                        </div>
                        {datasetInfo && (
                          <p className="text-xs text-muted-foreground">
                            {datasetInfo.rowCount.toLocaleString()} rows × {datasetInfo.columnCount} columns
                          </p>
                        )}
                        {taskStatus.total > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Tasks: {taskStatus.running} running, {taskStatus.pending} pending, {taskStatus.failed} failed
                          </p>
                        )}
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
                
                <div className="space-y-2">
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
                  
                  {/* Next Run Indicator */}
                  {agent.status === 'active' && agent.configuration?.analysis_frequency && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-info">
                        <Clock className="h-3 w-3" />
                        <span>
                          Next run: {(() => {
                            const lastActive = agent.last_active ? new Date(agent.last_active) : new Date();
                            const frequency = agent.configuration.analysis_frequency;
                            let nextRun: Date;
                            
                            switch (frequency) {
                              case 'hourly':
                                nextRun = new Date(lastActive.getTime() + 60 * 60 * 1000);
                                break;
                              case 'daily':
                                nextRun = new Date(lastActive.getTime() + 24 * 60 * 60 * 1000);
                                break;
                              case 'weekly':
                                nextRun = new Date(lastActive.getTime() + 7 * 24 * 60 * 60 * 1000);
                                break;
                              default:
                                nextRun = new Date(lastActive.getTime() + 24 * 60 * 60 * 1000);
                            }
                            
                            return formatDistanceToNow(nextRun, { addSuffix: true });
                          })()}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-info/20 text-info">
                        {agent.configuration.analysis_frequency}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Manual Trigger Button */}
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerProcessor();
                      }}
                      className="text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Run Now
                    </Button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Trash2, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const SystemCacheManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const clearAllCache = async () => {
    setIsClearing(true);
    try {
      // Clear all React Query caches
      await queryClient.clear();
      
      // Force refetch of critical data
      await queryClient.refetchQueries({ queryKey: ['agents'] });
      await queryClient.refetchQueries({ queryKey: ['agent-tasks'] });
      await queryClient.refetchQueries({ queryKey: ['agent-insights'] });
      await queryClient.refetchQueries({ queryKey: ['datasets'] });
      
      toast({
        title: "Cache Cleared",
        description: "All cached data has been cleared and refreshed",
      });
    } catch (error) {
      toast({
        title: "Cache Clear Failed",
        description: `Error clearing cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const verifyDatabaseIntegrity = async () => {
    setIsVerifying(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // First, get all agent IDs for this user
      const { data: userAgents, error: agentsError } = await supabase
        .from('ai_agents')
        .select('id')
        .eq('user_id', user.user.id);

      if (agentsError) throw agentsError;

      const validAgentIds = userAgents?.map(agent => agent.id) || [];
      console.log('Valid agent IDs for user:', validAgentIds);

      // Check for orphaned tasks (tasks that don't belong to user's agents)
      let orphanedTasks = [];
      if (validAgentIds.length > 0) {
        const { data: tasks, error: tasksError } = await supabase
          .from('agent_tasks')
          .select('id, agent_id')
          .not('agent_id', 'in', `(${validAgentIds.map(id => `'${id}'`).join(',')})`);
        
        if (tasksError) throw tasksError;
        orphanedTasks = tasks || [];
      } else {
        // If no valid agents, all tasks are orphaned
        const { data: allTasks, error: allTasksError } = await supabase
          .from('agent_tasks')
          .select('id, agent_id');
        
        if (allTasksError) throw allTasksError;
        orphanedTasks = allTasks || [];
      }

      // Check for stuck tasks
      const { data: stuckTasks, error: stuckError } = await supabase
        .from('agent_tasks')
        .select('id, status, created_at')
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

      if (stuckError) throw stuckError;

      // Check for agents without datasets
      const { data: datasets } = await supabase
        .from('saved_datasets')
        .select('id')
        .eq('user_id', user.user.id);

      const issuesFound = [];
      
      if (orphanedTasks && orphanedTasks.length > 0) {
        issuesFound.push(`${orphanedTasks.length} orphaned tasks found`);
      }
      
      if (stuckTasks && stuckTasks.length > 0) {
        issuesFound.push(`${stuckTasks.length} stuck tasks found`);
      }
      
      if (!datasets || datasets.length === 0) {
        issuesFound.push("No datasets available for agent processing");
      }

      if (issuesFound.length === 0) {
        toast({
          title: "Database Integrity Check Passed",
          description: "No issues found in the database",
        });
      } else {
        toast({
          title: "Database Issues Found",
          description: issuesFound.join(", "),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Integrity Check Failed",
        description: `Error checking database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const performSystemReset = async () => {
    setIsClearing(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Get user's agents first
      const { data: userAgents } = await supabase
        .from('ai_agents')
        .select('id')
        .eq('user_id', user.user.id);

      if (userAgents && userAgents.length > 0) {
        const agentIds = userAgents.map(agent => agent.id);

        // Clear all agent tasks
        const { error: tasksError } = await supabase
          .from('agent_tasks')
          .delete()
          .in('agent_id', agentIds);

        if (tasksError) throw tasksError;

        // Clear all agent insights
        const { error: insightsError } = await supabase
          .from('agent_insights')
          .delete()
          .in('agent_id', agentIds);

        if (insightsError) throw insightsError;
      }

      // Clear all caches
      await queryClient.clear();
      
      // Force refetch
      await queryClient.refetchQueries({ queryKey: ['agents'] });
      await queryClient.refetchQueries({ queryKey: ['agent-tasks'] });
      await queryClient.refetchQueries({ queryKey: ['agent-insights'] });

      toast({
        title: "System Reset Complete",
        description: "All agent data has been cleared and caches refreshed",
      });
    } catch (error) {
      toast({
        title: "System Reset Failed",
        description: `Error during reset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          System Management
        </CardTitle>
        <CardDescription>
          Advanced cache clearing and database integrity tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={clearAllCache}
            disabled={isClearing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </Button>

          <Button
            onClick={verifyDatabaseIntegrity}
            disabled={isVerifying}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <CheckCircle className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Checking...' : 'Check Integrity'}
          </Button>

          <Button
            onClick={performSystemReset}
            disabled={isClearing}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? 'Resetting...' : 'System Reset'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p className="font-medium mb-1">Tool Functions:</p>
          <ul className="text-xs space-y-1">
            <li>• <strong>Clear Cache:</strong> Refreshes all cached data</li>
            <li>• <strong>Check Integrity:</strong> Verifies database consistency</li>
            <li>• <strong>System Reset:</strong> Clears all agent data and cache</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
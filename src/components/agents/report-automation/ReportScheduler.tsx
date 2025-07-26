import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Play, 
  Settings, 
  Plus,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScheduledReport {
  id: string;
  template_id: string;
  frequency: string;
  schedule_time: string;
  timezone: string;
  recipients: string[];
  is_active: boolean;
  next_run?: string;
  last_run?: string;
  template_name?: string;
}

export const ReportScheduler = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .select(`
          *,
          report_templates!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedSchedules = (data || []).map(schedule => ({
        ...schedule,
        template_name: schedule.report_templates?.name || 'Unknown Template',
        recipients: Array.isArray(schedule.recipients) ? schedule.recipients : []
      })) as ScheduledReport[];
      
      setSchedules(formattedSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load report schedules.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (lastRun?: string) => {
    if (!lastRun) return <Clock className="h-4 w-4 text-gray-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = (isActive: boolean, lastRun?: string) => {
    if (!isActive) return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    if (!lastRun) return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
    return 'bg-green-500/15 text-green-600 dark:text-green-400';
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'weekly': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      case 'monthly': return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const handleToggleSchedule = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('report_schedules')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Schedule Updated",
        description: `Report schedule has been ${!currentActive ? 'activated' : 'deactivated'}.`,
      });

      loadSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('report_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Schedule Deleted",
        description: "Report schedule has been deleted successfully.",
      });

      loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule.",
        variant: "destructive",
      });
    }
  };

  const activeSchedules = schedules.filter(s => s.is_active);
  const totalRecipients = schedules.reduce((sum, s) => sum + (s.recipients?.length || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Report Scheduling</h3>
          <p className="text-sm text-muted-foreground">
            Manage automated report generation and distribution schedules
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold">{activeSchedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-sm font-medium">{activeSchedules.length > 0 ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recipients</p>
                <p className="text-2xl font-bold">{totalRecipients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Schedules Found</h3>
              <p className="text-muted-foreground mb-4">Create your first report schedule to automate report generation.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={schedule.is_active}
                        onCheckedChange={() => handleToggleSchedule(schedule.id, schedule.is_active)}
                      />
                      <div>
                        <h4 className="font-semibold">{schedule.template_name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getFrequencyColor(schedule.frequency)}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {schedule.frequency}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {schedule.schedule_time || 'Not set'}
                          </Badge>
                          <Badge className={getStatusColor(schedule.is_active, schedule.last_run)}>
                            {getStatusIcon(schedule.last_run)}
                            <span className="ml-1">{schedule.is_active ? 'Active' : 'Inactive'}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {schedule.next_run && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Next Run</p>
                        <p className="font-medium">{new Date(schedule.next_run).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{new Date(schedule.next_run).toLocaleTimeString()}</p>
                      </div>
                    )}
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Recipients</p>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{schedule.recipients?.length || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recipients List */}
                {schedule.recipients && schedule.recipients.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Recipients:</p>
                    <div className="flex flex-wrap gap-2">
                      {schedule.recipients.map((recipient, index) => (
                        <Badge key={index} variant="secondary">
                          <Mail className="h-3 w-3 mr-1" />
                          {recipient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Run Info */}
                {schedule.last_run && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Last run: {new Date(schedule.last_run).toLocaleDateString()} at {new Date(schedule.last_run).toLocaleTimeString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
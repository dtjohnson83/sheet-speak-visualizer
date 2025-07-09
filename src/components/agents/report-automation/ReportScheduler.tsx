
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Play, 
  Pause, 
  Settings, 
  Plus,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduledReport {
  id: string;
  templateName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  timezone: string;
  recipients: string[];
  isActive: boolean;
  nextRun: Date;
  lastRun?: Date;
  status: 'running' | 'success' | 'failed' | 'pending';
}

export const ReportScheduler = () => {
  const { toast } = useToast();
  const [schedules] = useState<ScheduledReport[]>([
    {
      id: '1',
      templateName: 'Weekly Sales Report',
      frequency: 'weekly',
      time: '09:00',
      timezone: 'UTC',
      recipients: ['sales@company.com', 'manager@company.com'],
      isActive: true,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'success'
    },
    {
      id: '2',
      templateName: 'Monthly Financial Summary',
      frequency: 'monthly',
      time: '08:00',
      timezone: 'UTC',
      recipients: ['finance@company.com', 'cfo@company.com'],
      isActive: true,
      nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'success'
    },
    {
      id: '3',
      templateName: 'Daily Operations Dashboard',
      frequency: 'daily',
      time: '07:30',
      timezone: 'UTC',
      recipients: ['ops@company.com'],
      isActive: false,
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
      status: 'pending'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Play className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      case 'failed': return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'running': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'weekly': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      case 'monthly': return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const handleToggleSchedule = (id: string) => {
    toast({
      title: "Schedule Updated",
      description: "Report schedule has been updated successfully.",
    });
  };

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
                <p className="text-2xl font-bold">{schedules.filter(s => s.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Next Run</p>
                <p className="text-sm font-medium">Today 9:00 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">98%</p>
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
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => handleToggleSchedule(schedule.id)}
                    />
                    <div>
                      <h4 className="font-semibold">{schedule.templateName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getFrequencyColor(schedule.frequency)}>
                          <Calendar className="h-3 w-3 mr-1" />
                          {schedule.frequency}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {schedule.time}
                        </Badge>
                        <Badge className={getStatusColor(schedule.status)}>
                          {getStatusIcon(schedule.status)}
                          <span className="ml-1">{schedule.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Next Run</p>
                    <p className="font-medium">{schedule.nextRun.toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{schedule.nextRun.toLocaleTimeString()}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Recipients</p>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{schedule.recipients.length}</span>
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

              {/* Last Run Info */}
              {schedule.lastRun && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Last run: {schedule.lastRun.toLocaleDateString()} at {schedule.lastRun.toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

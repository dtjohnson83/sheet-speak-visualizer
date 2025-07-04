import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'csv' | 'excel';
  recipients: string[];
  nextRun: Date;
  isActive: boolean;
}

interface QualityReportSchedulerProps {
  agentId?: string;
}

export const QualityReportScheduler = ({ agentId }: QualityReportSchedulerProps) => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newReport, setNewReport] = useState<{
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    format: 'pdf' | 'csv' | 'excel';
    recipients: string;
    isActive: boolean;
  }>({
    name: '',
    frequency: 'weekly',
    format: 'pdf',
    recipients: '',
    isActive: true
  });

  const { toast } = useToast();

  const handleCreateSchedule = async () => {
    if (!newReport.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the scheduled report.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const recipients = newReport.recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const nextRun = calculateNextRun(newReport.frequency);

      const report: ScheduledReport = {
        id: Date.now().toString(),
        name: newReport.name,
        frequency: newReport.frequency,
        format: newReport.format,
        recipients,
        nextRun,
        isActive: newReport.isActive
      };

      setScheduledReports(prev => [...prev, report]);

      // Reset form
      setNewReport({
        name: '',
        frequency: 'weekly',
        format: 'pdf',
        recipients: '',
        isActive: true
      });

      toast({
        title: "Schedule Created",
        description: `Report "${report.name}" scheduled successfully.`,
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create scheduled report.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const calculateNextRun = (frequency: string): Date => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        return nextMonth;
      default:
        return now;
    }
  };

  const toggleReportStatus = (reportId: string) => {
    setScheduledReports(prev =>
      prev.map(report =>
        report.id === reportId
          ? { ...report, isActive: !report.isActive }
          : report
      )
    );
  };

  const deleteReport = (reportId: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== reportId));
    toast({
      title: "Schedule Deleted",
      description: "Scheduled report has been removed.",
    });
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '📈';
      default: return '⏰';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Reports
            </CardTitle>
            <CardDescription>
              Automatically generate and send quality reports
            </CardDescription>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Report</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name</Label>
                  <Input
                    id="name"
                    placeholder="Weekly Quality Report"
                    value={newReport.name}
                    onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select 
                    value={newReport.frequency} 
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      setNewReport(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select 
                    value={newReport.format} 
                    onValueChange={(value: 'pdf' | 'csv' | 'excel') => 
                      setNewReport(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                  <Input
                    id="recipients"
                    placeholder="email@example.com, team@company.com"
                    value={newReport.recipients}
                    onChange={(e) => setNewReport(prev => ({ ...prev, recipients: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newReport.isActive}
                    onCheckedChange={(checked) => 
                      setNewReport(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <Button 
                  onClick={handleCreateSchedule}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Schedule'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {scheduledReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled reports yet</p>
            <p className="text-sm">Create your first automated report schedule</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledReports.map(report => (
              <Card key={report.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getFrequencyIcon(report.frequency)}</span>
                      <h4 className="font-medium">{report.name}</h4>
                      <Badge variant={report.isActive ? "default" : "secondary"}>
                        {report.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{report.frequency} • {report.format.toUpperCase()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{report.recipients.length} recipient(s)</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Next: {report.nextRun.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReportStatus(report.id)}
                    >
                      {report.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NewReportConfig, ScheduledReport, DEFAULT_NEW_REPORT } from './SchedulerTypes';
import { calculateNextRun, parseRecipientsEmail } from './SchedulerUtilities';

interface CreateScheduleDialogProps {
  onCreateSchedule: (report: ScheduledReport) => void;
}

export const CreateScheduleDialog = ({ onCreateSchedule }: CreateScheduleDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newReport, setNewReport] = useState<NewReportConfig>(DEFAULT_NEW_REPORT);
  const [isOpen, setIsOpen] = useState(false);

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
      const recipients = parseRecipientsEmail(newReport.recipients);
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

      onCreateSchedule(report);

      // Reset form
      setNewReport(DEFAULT_NEW_REPORT);
      setIsOpen(false);

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

  const updateNewReport = (key: keyof NewReportConfig, value: any) => {
    setNewReport(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              onChange={(e) => updateNewReport('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select 
              value={newReport.frequency} 
              onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                updateNewReport('frequency', value)
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
                updateNewReport('format', value)
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
              onChange={(e) => updateNewReport('recipients', e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={newReport.isActive}
              onCheckedChange={(checked) => updateNewReport('isActive', checked)}
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
  );
};
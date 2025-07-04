import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateScheduleDialog } from './scheduler/CreateScheduleDialog';
import { ScheduledReportsList } from './scheduler/ScheduledReportsList';
import { ScheduledReport, QualityReportSchedulerProps } from './scheduler/SchedulerTypes';

export const QualityReportScheduler = ({ agentId }: QualityReportSchedulerProps) => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  const { toast } = useToast();

  const handleCreateSchedule = (report: ScheduledReport) => {
    setScheduledReports(prev => [...prev, report]);
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
          
          <CreateScheduleDialog onCreateSchedule={handleCreateSchedule} />
        </div>
      </CardHeader>
      
      <CardContent>
        <ScheduledReportsList 
          reports={scheduledReports}
          onToggleStatus={toggleReportStatus}
          onDeleteReport={deleteReport}
        />
      </CardContent>
    </Card>
  );
};
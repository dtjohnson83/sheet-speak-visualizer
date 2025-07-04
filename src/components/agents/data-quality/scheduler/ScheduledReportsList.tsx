import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail, Trash2 } from 'lucide-react';
import { ScheduledReport } from './SchedulerTypes';
import { getFrequencyIcon } from './SchedulerUtilities';

interface ScheduledReportsListProps {
  reports: ScheduledReport[];
  onToggleStatus: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
}

export const ScheduledReportsList = ({ 
  reports, 
  onToggleStatus, 
  onDeleteReport 
}: ScheduledReportsListProps) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No scheduled reports yet</p>
        <p className="text-sm">Create your first automated report schedule</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map(report => (
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
                onClick={() => onToggleStatus(report.id)}
              >
                {report.isActive ? 'Pause' : 'Resume'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteReport(report.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
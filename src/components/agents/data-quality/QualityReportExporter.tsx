import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ExportConfiguration } from './export/ExportConfiguration';
import { exportToPDF, exportToCSV, exportToExcel } from './export/ExportUtilities';
import { ExportOptions, QualityReportExporterProps, DEFAULT_EXPORT_OPTIONS } from './export/ExportTypes';

export const QualityReportExporter = ({ report, isAnalyzing }: QualityReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);

  const { toast } = useToast();

  const handleExport = async () => {
    if (!report) {
      toast({
        title: "No Data Available",
        description: "Please run a quality analysis first.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      if (exportOptions.format === 'pdf') {
        await exportToPDF(report, exportOptions);
      } else if (exportOptions.format === 'csv') {
        await exportToCSV(report, exportOptions);
      } else if (exportOptions.format === 'excel') {
        await exportToExcel(report, exportOptions);
      }

      toast({
        title: "Export Successful",
        description: `Report exported as ${exportOptions.format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={!report || isAnalyzing}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Quality Report</DialogTitle>
        </DialogHeader>
        
        <ExportConfiguration 
          options={exportOptions}
          onChange={setExportOptions}
        />

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting || !report}
          className="w-full"
        >
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
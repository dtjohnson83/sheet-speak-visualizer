import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Table } from 'lucide-react';
import { DataQualityReport } from './types';
import { useToast } from '@/hooks/use-toast';

interface QualityReportExporterProps {
  report: DataQualityReport | null;
  isAnalyzing: boolean;
}

interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeCharts: boolean;
  includeTrends: boolean;
  includeHeatmap: boolean;
  includeRecommendations: boolean;
  includeRawData: boolean;
  timeRange: 'current' | 'last_7_days' | 'last_30_days';
}

export const QualityReportExporter = ({ report, isAnalyzing }: QualityReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeTrends: true,
    includeHeatmap: true,
    includeRecommendations: true,
    includeRawData: false,
    timeRange: 'current'
  });

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
        await exportToPDF();
      } else if (exportOptions.format === 'csv') {
        await exportToCSV();
      } else if (exportOptions.format === 'excel') {
        await exportToExcel();
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

  const exportToPDF = async () => {
    // Dynamic import to avoid bundle size issues
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Title and metadata
    doc.setFontSize(20);
    doc.text('Data Quality Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Dataset: ${report?.datasetInfo.rows} rows, ${report?.datasetInfo.columns} columns`, 20, 55);

    // Quality scores
    doc.setFontSize(16);
    doc.text('Quality Scores', 20, 75);
    
    const scores = [
      ['Overall Score', `${report?.qualityScore.overall.toFixed(1)}%`],
      ['Completeness', `${report?.qualityScore.completeness.toFixed(1)}%`],
      ['Consistency', `${report?.qualityScore.consistency.toFixed(1)}%`],
      ['Accuracy', `${report?.qualityScore.accuracy.toFixed(1)}%`],
      ['Uniqueness', `${report?.qualityScore.uniqueness.toFixed(1)}%`],
      ['Timeliness', `${report?.qualityScore.timeliness.toFixed(1)}%`]
    ];

    let yPos = 90;
    scores.forEach(([metric, score]) => {
      doc.setFontSize(12);
      doc.text(`${metric}:`, 30, yPos);
      doc.text(score, 120, yPos);
      yPos += 15;
    });

    // Issues summary
    doc.setFontSize(16);
    doc.text('Issues Summary', 20, yPos + 20);
    yPos += 35;

    doc.setFontSize(12);
    doc.text(`Total Issues: ${report?.summary.totalIssues}`, 30, yPos);
    doc.text(`High Severity: ${report?.summary.highSeverityIssues}`, 30, yPos + 15);
    doc.text(`Affected Columns: ${report?.summary.affectedColumns}`, 30, yPos + 30);

    // Add issues list if they exist
    if (report?.issues && report.issues.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Detailed Issues', 20, 30);
      
      yPos = 50;
      report.issues.slice(0, 20).forEach((issue, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }
        
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${issue.column} - ${issue.type}`, 20, yPos);
        doc.text(`Severity: ${issue.severity} | Impact: ${issue.percentage.toFixed(1)}%`, 25, yPos + 8);
        doc.text(issue.description, 25, yPos + 16, { maxWidth: 160 });
        yPos += 30;
      });
    }

    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`data-quality-report-${timestamp}.pdf`);
  };

  const exportToCSV = async () => {
    if (!report) return;

    const csvData = [
      // Header
      ['Data Quality Report'],
      ['Generated', new Date().toLocaleDateString()],
      ['Dataset Info', `${report.datasetInfo.rows} rows, ${report.datasetInfo.columns} columns`],
      [],
      
      // Quality Scores
      ['Quality Scores'],
      ['Metric', 'Score (%)'],
      ['Overall', report.qualityScore.overall.toFixed(1)],
      ['Completeness', report.qualityScore.completeness.toFixed(1)],
      ['Consistency', report.qualityScore.consistency.toFixed(1)],
      ['Accuracy', report.qualityScore.accuracy.toFixed(1)],
      ['Uniqueness', report.qualityScore.uniqueness.toFixed(1)],
      ['Timeliness', report.qualityScore.timeliness.toFixed(1)],
      [],
      
      // Issues
      ['Issues'],
      ['Column', 'Type', 'Severity', 'Affected Rows', 'Impact (%)', 'Description'],
      ...report.issues.map(issue => [
        issue.column,
        issue.type,
        issue.severity,
        issue.affectedRows.toString(),
        issue.percentage.toFixed(1),
        issue.description
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `data-quality-report-${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async () => {
    // For now, export as CSV with Excel-friendly format
    // Future enhancement could use a library like xlsx
    await exportToCSV();
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
        
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select 
              value={exportOptions.format} 
              onValueChange={(value: 'pdf' | 'csv' | 'excel') => 
                setExportOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV Data
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Excel Spreadsheet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="charts"
                checked={exportOptions.includeCharts}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeCharts: !!checked }))
                }
              />
              <Label htmlFor="charts">Quality Score Charts</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="trends"
                checked={exportOptions.includeTrends}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeTrends: !!checked }))
                }
              />
              <Label htmlFor="trends">Trend Analysis</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="heatmap"
                checked={exportOptions.includeHeatmap}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeHeatmap: !!checked }))
                }
              />
              <Label htmlFor="heatmap">Issues Heatmap</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recommendations"
                checked={exportOptions.includeRecommendations}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeRecommendations: !!checked }))
                }
              />
              <Label htmlFor="recommendations">Fix Recommendations</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rawdata"
                checked={exportOptions.includeRawData}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeRawData: !!checked }))
                }
              />
              <Label htmlFor="rawdata">Raw Issue Data</Label>
            </div>
          </div>

          <Separator />

          {/* Time Range */}
          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select 
              value={exportOptions.timeRange} 
              onValueChange={(value: 'current' | 'last_7_days' | 'last_30_days') => 
                setExportOptions(prev => ({ ...prev, timeRange: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Analysis</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !report}
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
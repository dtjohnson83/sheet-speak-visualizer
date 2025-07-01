import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { exportToCSV, exportToExcel, getDataSummary } from '@/utils/dataExport';
import { ExportFormatSelector } from './export/ExportFormatSelector';
import { ExportOptionsConfig } from './export/ExportOptionsConfig';
import { ColumnSelector } from './export/ColumnSelector';
import { ExportSummary } from './export/ExportSummary';

interface DataExportButtonProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
}

export const DataExportButton = ({ data, columns, fileName = 'data-export' }: DataExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [exportFileName, setExportFileName] = useState(fileName);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(col => col.name));
  const [dateFormat, setDateFormat] = useState<'iso' | 'local' | 'short'>('local');
  const { toast } = useToast();

  const handleColumnToggle = (columnName: string, checked: boolean) => {
    if (checked) {
      setSelectedColumns(prev => [...prev, columnName]);
    } else {
      setSelectedColumns(prev => prev.filter(name => name !== columnName));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedColumns(columns.map(col => col.name));
    } else {
      setSelectedColumns([]);
    }
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "No columns selected",
        description: "Please select at least one column to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exportOptions = {
        filename: exportFileName || 'data-export',
        includeHeaders,
        selectedColumns,
        dateFormat,
      };

      if (exportFormat === 'csv') {
        exportToCSV(data, columns, exportOptions);
      } else {
        exportToExcel(data, columns, exportOptions);
      }

      const summary = getDataSummary(data, columns.filter(col => selectedColumns.includes(col.name)));
      
      toast({
        title: "Export successful",
        description: `Exported ${summary.totalRows} rows and ${selectedColumns.length} columns as ${exportFormat.toUpperCase()}.`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const summary = getDataSummary(data, columns.filter(col => selectedColumns.includes(col.name)));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <ExportFormatSelector
            exportFormat={exportFormat}
            onFormatChange={setExportFormat}
          />

          <ExportOptionsConfig
            exportFileName={exportFileName}
            onFileNameChange={setExportFileName}
            includeHeaders={includeHeaders}
            onIncludeHeadersChange={setIncludeHeaders}
            dateFormat={dateFormat}
            onDateFormatChange={setDateFormat}
          />

          <ColumnSelector
            columns={columns}
            selectedColumns={selectedColumns}
            onColumnToggle={handleColumnToggle}
            onSelectAll={handleSelectAll}
          />

          <ExportSummary
            summary={summary}
            selectedColumnsCount={selectedColumns.length}
            exportFormat={exportFormat}
          />

          {/* Export Button */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || selectedColumns.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
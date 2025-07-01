import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { exportToCSV, exportToExcel, getDataSummary } from '@/utils/dataExport';

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
  const allSelected = selectedColumns.length === columns.length;
  const someSelected = selectedColumns.length > 0 && selectedColumns.length < columns.length;

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
          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`p-4 cursor-pointer transition-colors ${exportFormat === 'csv' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => setExportFormat('csv')}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-medium">CSV</div>
                    <div className="text-sm text-gray-600">Comma-separated values</div>
                  </div>
                </div>
              </Card>
              <Card 
                className={`p-4 cursor-pointer transition-colors ${exportFormat === 'excel' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => setExportFormat('excel')}
              >
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-medium">Excel</div>
                    <div className="text-sm text-gray-600">Excel workbook (.xlsx)</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-semibold">File Name</Label>
            <Input
              id="filename"
              value={exportFileName}
              onChange={(e) => setExportFileName(e.target.value)}
              placeholder="Enter filename (without extension)"
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="headers"
                  checked={includeHeaders}
                  onCheckedChange={(checked) => setIncludeHeaders(!!checked)}
                />
                <Label htmlFor="headers" className="text-sm">Include column headers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="date-format" className="text-sm">Date format:</Label>
                <Select value={dateFormat} onValueChange={(value: 'iso' | 'local' | 'short') => setDateFormat(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local (MM/DD/YYYY HH:MM:SS)</SelectItem>
                    <SelectItem value="short">Short (MM/DD/YYYY)</SelectItem>
                    <SelectItem value="iso">ISO (YYYY-MM-DDTHH:MM:SS.sssZ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Column Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Select Columns</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <Label className="text-sm">Select All</Label>
              </div>
            </div>
            
            <Card className="p-3 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {columns.map((column) => (
                  <div key={column.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-${column.name}`}
                      checked={selectedColumns.includes(column.name)}
                      onCheckedChange={(checked) => handleColumnToggle(column.name, !!checked)}
                    />
                    <Label 
                      htmlFor={`col-${column.name}`} 
                      className="text-sm truncate flex-1 cursor-pointer"
                      title={column.name}
                    >
                      {column.name}
                      <span className="text-xs text-gray-500 ml-1">({column.type})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Export Summary */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-2">
              <div className="font-medium text-sm">Export Summary</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Rows:</span>
                  <span className="ml-2 font-medium">{summary.totalRows.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Columns:</span>
                  <span className="ml-2 font-medium">{selectedColumns.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Format:</span>
                  <span className="ml-2 font-medium">{exportFormat.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Est. Size:</span>
                  <span className="ml-2 font-medium">{(summary.memoryUsage / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>
          </Card>

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
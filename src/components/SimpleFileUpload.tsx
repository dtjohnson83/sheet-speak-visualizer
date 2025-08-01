import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSecureFileUpload } from '@/hooks/useSecureFileUpload';
import * as XLSX from 'xlsx';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { WorksheetSelector } from './WorksheetSelector';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { FileErrorMessage } from '@/components/ui/error-message';
import { detectColumnTypeWithName } from '@/lib/columnTypeDetection';
import { useDomainContext } from '@/hooks/useDomainContext';

interface SimpleFileUploadProps {
  onDataLoaded: (data: DataRow[], columns: ColumnInfo[], fileName: string, worksheetName?: string) => void;
}

interface WorksheetInfo {
  name: string;
  rowCount: number;
  data: any[];
}

type ProcessingStage = 'idle' | 'processing' | 'complete' | 'error';

// Excel date conversion utilities
const convertExcelDate = (serial: number): string => {
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  return date.toISOString();
};

const isExcelDateSerial = (value: number): boolean => {
  return value >= 1 && value <= 2958465;
};

export const SimpleFileUpload = ({ onDataLoaded }: SimpleFileUploadProps) => {
  const [processing, setProcessing] = useState<ProcessingStage>('idle');
  const [worksheets, setWorksheets] = useState<WorksheetInfo[]>([]);
  const [currentFileName, setCurrentFileName] = useState('');
  const [showWorksheetSelector, setShowWorksheetSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { triggerSurvey, hasContext } = useDomainContext();

  // Using enhanced detection with column name consideration
  const detectColumnType = (columnName: string, values: any[]): 'numeric' | 'date' | 'categorical' | 'text' => {
    return detectColumnTypeWithName(columnName, values);
  };

  const processWorksheetData = useCallback((worksheetData: WorksheetInfo) => {
    setProcessing('processing');
    setError(null);
    
    const rawData = worksheetData.data;
    if (!rawData || rawData.length === 0) {
      setError("No data found in the selected worksheet.");
      setProcessing('error');
      return;
    }

    const columnNames = Object.keys(rawData[0]);
    
    // Detect column types using enhanced detection with column names
    const columnTypes: Record<string, 'numeric' | 'date' | 'categorical' | 'text'> = {};
    columnNames.forEach(name => {
      const values = rawData.map(row => row[name]);
      columnTypes[name] = detectColumnType(name, values);
    });

    // Process data based on detected types
    const processedData = rawData.map(row => {
      const processedRow: DataRow = {};
      
      columnNames.forEach(columnName => {
        const value = row[columnName];
        const columnType = columnTypes[columnName];
        
        if (value === null || value === undefined || value === '') {
          processedRow[columnName] = value;
          return;
        }
        
        if (columnType === 'date') {
          const num = Number(value);
          if (!isNaN(num) && isExcelDateSerial(num)) {
            try {
              processedRow[columnName] = convertExcelDate(num);
            } catch (error) {
              processedRow[columnName] = value;
            }
          } else {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              processedRow[columnName] = date.toISOString();
            } else {
              processedRow[columnName] = value;
            }
          }
        } else {
          processedRow[columnName] = value;
        }
      });
      
      return processedRow;
    });
    
    // Create column info
    const columns: ColumnInfo[] = columnNames.map(name => {
      const values = processedData.map(row => row[name]);
      const type = columnTypes[name];
      return {
        name,
        type,
        values: values.filter(v => v !== null && v !== undefined && v !== '')
      };
    });
    
    setProcessing('complete');
    onDataLoaded(processedData, columns, currentFileName, worksheetData.name);
    
    // Trigger domain survey if no context exists
    if (!hasContext) {
      setTimeout(() => {
        triggerSurvey();
      }, 1000);
    }
    
    toast({
      title: "Success",
      description: `Loaded ${processedData.length} rows with ${columns.length} columns`,
    });
    
    setTimeout(() => setProcessing('idle'), 2000);
  }, [onDataLoaded, toast, currentFileName]);

  const processExcelFile = useCallback((workbook: XLSX.WorkBook, fileName: string) => {
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 1) {
      const worksheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const worksheetInfo: WorksheetInfo = {
        name: sheetNames[0],
        rowCount: jsonData.length,
        data: jsonData
      };
      processWorksheetData(worksheetInfo);
    } else {
      const worksheetInfos: WorksheetInfo[] = sheetNames.map(name => {
        const worksheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        return {
          name,
          rowCount: jsonData.length,
          data: jsonData
        };
      });
      
      setWorksheets(worksheetInfos);
      setCurrentFileName(fileName);
      setShowWorksheetSelector(true);
      setProcessing('idle');
    }
  }, [processWorksheetData]);

  const { handleFileUpload: secureHandleFileUpload, isUploading } = useSecureFileUpload({
    onSuccess: (file) => {
      setProcessing('processing');
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;

        try {
          const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
          processExcelFile(workbook, file.name);
        } catch (parseError) {
          setError('Failed to parse the spreadsheet. The file may be corrupted.');
          setProcessing('error');
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file. Please try again.');
        setProcessing('error');
      };
      reader.readAsBinaryString(file);
    },
    onError: (error) => {
      setError(error);
      setProcessing('error');
    }
  });

  const handleWorksheetSelected = useCallback((worksheet: WorksheetInfo) => {
    setShowWorksheetSelector(false);
    setWorksheets([]);
    processWorksheetData(worksheet);
  }, [processWorksheetData]);

  const handleWorksheetSelectorCancel = useCallback(() => {
    setShowWorksheetSelector(false);
    setWorksheets([]);
    setCurrentFileName('');
    setProcessing('idle');
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      secureHandleFileUpload(files[0]);
    }
  }, [secureHandleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const isLoading = processing === 'processing' || isUploading;

  if (showWorksheetSelector) {
    return (
      <div className="space-y-6">
        {isLoading && <LoadingSkeleton variant="card" count={1} />}
        <WorksheetSelector
          worksheets={worksheets}
          fileName={currentFileName}
          onWorksheetSelected={handleWorksheetSelected}
          onCancel={handleWorksheetSelectorCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Processing Status */}
      {isLoading && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Processing file...
            </div>
          </div>
        </Card>
      )}

      {/* Success Status */}
      {processing === 'complete' && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Data loaded successfully!
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <FileErrorMessage 
          message={error} 
          onRetry={() => {
            setError(null);
            setProcessing('idle');
          }}
        />
      )}

      {/* Upload Area */}
      <Card 
        className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="flex flex-col items-center space-y-3 text-center">
          <FileSpreadsheet className="h-8 w-8 text-gray-400" />
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
              Drop Excel or CSV File
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Drag & drop or click to browse
            </p>
          </div>
          <Button 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-1" />
                Choose File
              </>
            )}
          </Button>
        </div>
        
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              secureHandleFileUpload(file);
            }
          }}
          disabled={isLoading}
          className="hidden"
        />
      </Card>
    </div>
  );
};
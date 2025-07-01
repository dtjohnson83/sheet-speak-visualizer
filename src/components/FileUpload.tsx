import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Link, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { WorksheetSelector } from './WorksheetSelector';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { FileErrorMessage, NetworkErrorMessage, ErrorMessage } from '@/components/ui/error-message';

interface FileUploadProps {
  onDataLoaded: (data: DataRow[], columns: ColumnInfo[], fileName: string, worksheetName?: string) => void;
}

type ProcessingStage = 'idle' | 'reading' | 'parsing' | 'processing' | 'complete' | 'error';

interface ProcessingStatus {
  stage: ProcessingStage;
  message: string;
  progress?: number;
}

interface WorksheetInfo {
  name: string;
  rowCount: number;
  data: any[];
}

// Excel date serial number conversion
const convertExcelDate = (serial: number): string => {
  // Excel's epoch is 1900-01-01, but Excel incorrectly treats 1900 as a leap year
  // So we need to account for this bug
  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  return date.toISOString();
};

// Improved Excel date serial number detection - more inclusive
const isExcelDateSerial = (value: number): boolean => {
  // Expanded range: 1 (1900-01-01) to 2958465 (2099-12-31)
  // This catches more valid date ranges while avoiding obvious IDs
  return value >= 1 && value <= 2958465 && Number.isInteger(value);
};

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [processing, setProcessing] = useState<ProcessingStatus>({ stage: 'idle', message: '' });
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [worksheets, setWorksheets] = useState<WorksheetInfo[]>([]);
  const [currentFileName, setCurrentFileName] = useState('');
  const [showWorksheetSelector, setShowWorksheetSelector] = useState(false);
  const [error, setError] = useState<{type: 'file' | 'network' | 'validation', message: string, details?: string} | null>(null);
  const { toast } = useToast();

  const isLoading = processing.stage !== 'idle' && processing.stage !== 'complete' && processing.stage !== 'error';

  const detectColumnType = (values: any[]): 'numeric' | 'date' | 'categorical' | 'text' => {
    const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonEmptyValues.length === 0) return 'text';
    
    console.log('Detecting column type for values:', nonEmptyValues.slice(0, 10));
    
    // STEP 1: Check for numeric values FIRST (higher priority)
    const numericValues = nonEmptyValues.filter(v => {
      const num = Number(v);
      return !isNaN(num) && isFinite(num) && String(v).trim() !== '';
    });
    
    console.log('Numeric values found:', numericValues.length, 'out of', nonEmptyValues.length);
    
    // If 80% or more values are numeric, treat as numeric
    if (numericValues.length >= nonEmptyValues.length * 0.8) {
      // Special case: Check if it's a year column (4-digit years)
      const yearValues = nonEmptyValues.filter(v => {
        const str = String(v).trim();
        if (!/^\d{4}$/.test(str)) return false;
        const year = parseInt(str);
        return year >= 1900 && year <= new Date().getFullYear() + 20;
      });
      
      // If most values are years, treat as numeric (not date)
      if (yearValues.length >= nonEmptyValues.length * 0.8) {
        console.log('Detected as year column (numeric)');
        return 'numeric';
      }
      
      // Check if values look like IDs, counts, or other clearly numeric data
      const allIntegers = numericValues.every(v => Number.isInteger(Number(v)));
      const hasLargeValues = numericValues.some(v => Math.abs(Number(v)) > 10000);
      const hasSmallConsecutive = numericValues.some(v => Number(v) >= 1 && Number(v) <= 1000);
      
      // If all integers with either large values or small consecutive values, likely numeric IDs/counts
      if (allIntegers && (hasLargeValues || hasSmallConsecutive)) {
        console.log('Detected as numeric (IDs/counts)');
        return 'numeric';
      }
      
      console.log('Detected as numeric (general)');
      return 'numeric';
    }
    
    // STEP 2: Enhanced date detection patterns (only after numeric check)
    const datePatterns = [
      /^\d{4}-\d{1,2}-\d{1,2}$/,                    // YYYY-MM-DD
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,                  // MM/DD/YYYY or DD/MM/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/,                    // MM-DD-YYYY or DD-MM-YYYY
      /^\d{4}\/\d{1,2}\/\d{1,2}$/,                  // YYYY/MM/DD
      /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}(\.\d{1,3})?Z?$/,  // ISO datetime
      /^\d{1,2}\/\d{1,2}\/\d{2}$/,                  // MM/DD/YY or DD/MM/YY
      /^\d{1,2}\/\d{1,2}\/\d{2}$/,                  // MM/DD/YY or DD/MM/YY
      /^\d{1,2}-\d{1,2}-\d{2}$/,                    // MM-DD-YY or DD-MM-YY
      /^\w{3}\s+\d{1,2},?\s+\d{4}$/,                // Mon DD, YYYY or Mon DD YYYY
      /^\d{1,2}\s+\w{3}\s+\d{4}$/,                  // DD Mon YYYY
      /^\w{3}\s+\d{1,2}$/,                          // Mon DD
      /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}/,    // ISO datetime
      /^\d{1,2}:\d{1,2}:\d{1,2}$/,                  // HH:MM:SS
      /^\d{1,2}:\d{1,2}$/,                          // HH:MM
    ];
    
    // Check for Excel date serial numbers (more conservative)
    const potentialDateSerials = nonEmptyValues.filter(v => {
      const num = Number(v);
      return !isNaN(num) && isExcelDateSerial(num);
    });
    
    // Reduced threshold from 70% to 50% to catch more date columns
    if (potentialDateSerials.length > nonEmptyValues.length * 0.5) {
      console.log('Detected as Excel date serials');
      return 'date';
    }
    
    // Check for date string patterns with improved validation
    const dateValues = nonEmptyValues.filter(v => {
      const str = String(v).trim();
      
      // Skip if it looks like a pure number (avoid false positives)
      if (/^\d+$/.test(str)) return false;
      
      // Check against date patterns
      const matchesPattern = datePatterns.some(pattern => pattern.test(str));
      if (!matchesPattern) return false;
      
      // Try to parse as date
      const date = new Date(str);
      if (isNaN(date.getTime())) return false;
      
      // Additional validation: reasonable date range (1900 - 2100)
      const year = date.getFullYear();
      if (year < 1900 || year > 2100) return false;
      
      return true;
    });
    
    // If more than 70% of values are valid dates, consider it a date column
    if (dateValues.length > nonEmptyValues.length * 0.7) {
      console.log('Detected as date column');
      return 'date';
    }
    
    // STEP 3: Check for categorical (limited unique values)
    const uniqueValues = new Set(nonEmptyValues.map(v => String(v).toLowerCase().trim()));
    if (uniqueValues.size < nonEmptyValues.length * 0.5 && uniqueValues.size > 1 && uniqueValues.size <= 50) {
      console.log('Detected as categorical');
      return 'categorical';
    }
    
    console.log('Detected as text (default)');
    return 'text';
  };

  const processWorksheetData = useCallback((worksheetData: WorksheetInfo) => {
    console.log('Processing worksheet data:', worksheetData);
    setProcessing({ stage: 'processing', message: 'Processing data columns...' });
    setError(null);
    
    const rawData = worksheetData.data;
    if (!rawData || rawData.length === 0) {
      const errorMsg = "No data found in the selected worksheet. Please ensure the worksheet contains data with headers.";
      setError({ type: 'validation', message: errorMsg });
      setProcessing({ stage: 'error', message: errorMsg });
      return;
    }

    // Get column names from the first row
    const columnNames = Object.keys(rawData[0]);
    
    // First pass: detect column types with improved logic
    const columnTypes: Record<string, 'numeric' | 'date' | 'categorical' | 'text'> = {};
    columnNames.forEach(name => {
      const values = rawData.map(row => row[name]);
      const detectedType = detectColumnType(values);
      columnTypes[name] = detectedType;
      console.log(`Column "${name}" detected as: ${detectedType}`);
    });

    // Second pass: convert data based on detected types
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
          // If it's a number and looks like an Excel date serial, convert it
          if (!isNaN(num) && isExcelDateSerial(num)) {
            try {
              processedRow[columnName] = convertExcelDate(num);
            } catch (error) {
              console.warn(`Failed to convert Excel date serial ${num}:`, error);
              processedRow[columnName] = value;
            }
          } else {
            // Try to parse as regular date and convert to ISO string
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              // Ensure we store dates consistently as ISO strings
              processedRow[columnName] = date.toISOString();
            } else {
              processedRow[columnName] = value; // Keep original if can't parse
            }
          }
        } else {
          processedRow[columnName] = value;
        }
      });
      
      return processedRow;
    });
    
    // Create column info with processed values
    const columns: ColumnInfo[] = columnNames.map(name => {
      const values = processedData.map(row => row[name]);
      const type = columnTypes[name];
      return {
        name,
        type,
        values: values.filter(v => v !== null && v !== undefined && v !== '')
      };
    });

    console.log('Final detected columns:', columns.map(c => ({ name: c.name, type: c.type })));
    console.log('Processed data sample:', processedData.slice(0, 3));
    
    setProcessing({ stage: 'complete', message: 'Data loaded successfully!' });
    onDataLoaded(processedData, columns, currentFileName, worksheetData.name);
    
    toast({
      title: "Success",
      description: `Loaded ${processedData.length} rows from "${worksheetData.name}" with ${columns.length} columns`,
    });
    
    // Reset processing state after a brief delay
    setTimeout(() => setProcessing({ stage: 'idle', message: '' }), 2000);
  }, [onDataLoaded, toast, currentFileName]);

  const handleWorksheetSelected = useCallback((worksheet: WorksheetInfo) => {
    setShowWorksheetSelector(false);
    setWorksheets([]);
    processWorksheetData(worksheet);
  }, [processWorksheetData]);

  const handleWorksheetSelectorCancel = useCallback(() => {
    setShowWorksheetSelector(false);
    setWorksheets([]);
    setCurrentFileName('');
    setProcessing({ stage: 'idle', message: '' });
    setError(null);
  }, []);

  const processExcelFile = useCallback((workbook: XLSX.WorkBook, fileName: string) => {
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 1) {
      // Single worksheet - process directly
      const worksheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const worksheetInfo: WorksheetInfo = {
        name: sheetNames[0],
        rowCount: jsonData.length,
        data: jsonData
      };
      processWorksheetData(worksheetInfo);
    } else {
      // Multiple worksheets - show selector
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
      setProcessing({ stage: 'idle', message: '' });
    }
  }, [processWorksheetData]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validTypes.includes(fileExtension)) {
      const errorMsg = `Invalid file type. Please upload ${validTypes.join(', ')} files only.`;
      setError({ type: 'file', message: errorMsg, details: `File: ${file.name}, Type: ${fileExtension}` });
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = `File too large. Maximum size is 50MB.`;
      setError({ type: 'file', message: errorMsg, details: `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB` });
      return;
    }

    setProcessing({ stage: 'reading', message: 'Reading file...' });
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setProcessing({ stage: 'reading', message: `Reading file... ${progress.toFixed(0)}%`, progress });
        }
      };
      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;

        setProcessing({ stage: 'parsing', message: 'Parsing spreadsheet...' });
        try {
          const workbook = XLSX.read(data, { type: 'binary' });
          processExcelFile(workbook, file.name);
        } catch (parseError) {
          const errorMsg = 'Failed to parse the spreadsheet. The file may be corrupted or in an unsupported format.';
          setError({ type: 'file', message: errorMsg, details: String(parseError) });
          setProcessing({ stage: 'error', message: errorMsg });
        }
      };
      reader.onerror = () => {
        const errorMsg = 'Failed to read the file. Please try again.';
        setError({ type: 'file', message: errorMsg });
        setProcessing({ stage: 'error', message: errorMsg });
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      const errorMsg = 'An unexpected error occurred while processing the file.';
      setError({ type: 'file', message: errorMsg, details: String(error) });
      setProcessing({ stage: 'error', message: errorMsg });
      console.error('Error reading file:', error);
    }
  }, [processExcelFile]);

  const handleGoogleSheetLoad = useCallback(async () => {
    if (!googleSheetUrl) {
      const errorMsg = "Please enter a Google Sheets URL";
      setError({ type: 'validation', message: errorMsg });
      return;
    }

    setProcessing({ stage: 'reading', message: 'Connecting to Google Sheets...' });
    setError(null);
    
    try {
      // Convert Google Sheets URL to CSV export URL
      const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error('Invalid Google Sheets URL format. Please use a valid Google Sheets sharing URL.');
      }
      
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      setProcessing({ stage: 'reading', message: 'Downloading data from Google Sheets...' });
      const response = await fetch(csvUrl);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Please ensure the Google Sheet is published to the web.');
        } else if (response.status === 404) {
          throw new Error('Google Sheet not found. Please check the URL.');
        } else {
          throw new Error(`Failed to fetch Google Sheet data (Status: ${response.status})`);
        }
      }
      
      setProcessing({ stage: 'parsing', message: 'Processing Google Sheets data...' });
      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      processExcelFile(workbook, 'Google Sheet');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load Google Sheet. Please try again.';
      setError({ type: 'network', message: errorMsg, details: String(error) });
      setProcessing({ stage: 'error', message: errorMsg });
      console.error('Error loading Google Sheet:', error);
    }
  }, [googleSheetUrl, processExcelFile]);

  if (showWorksheetSelector) {
    return (
      <div className="space-y-6">
        {isLoading && (
          <div className="text-center py-4">
            <LoadingSkeleton variant="card" count={1} />
          </div>
        )}
        <WorksheetSelector
          worksheets={worksheets}
          fileName={currentFileName}
          onWorksheetSelected={handleWorksheetSelected}
          onCancel={handleWorksheetSelectorCancel}
        />
      </div>
    );
  }

  const retryLastAction = () => {
    setError(null);
    setProcessing({ stage: 'idle', message: '' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Upload Your Data</h2>
        <p className="text-gray-600">
          Upload an Excel file (.xlsx) or connect to a Google Sheets document
        </p>
      </div>

      {/* Processing Status */}
      {isLoading && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {processing.message}
              </div>
              {processing.progress && (
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${processing.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Success Status */}
      {processing.stage === 'complete' && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              {processing.message}
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="space-y-2">
          {error.type === 'file' && (
            <FileErrorMessage 
              message={error.message} 
              details={error.details} 
              onRetry={retryLastAction}
            />
          )}
          {error.type === 'network' && (
            <NetworkErrorMessage 
              message={error.message} 
              details={error.details} 
              onRetry={retryLastAction}
            />
          )}
          {error.type === 'validation' && (
            <ErrorMessage 
              type="validation"
              message={error.message} 
              details={error.details} 
              onRetry={retryLastAction}
            />
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <FileSpreadsheet className="h-12 w-12 text-blue-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Upload Excel File</h3>
              <p className="text-sm text-gray-600">Select a .xlsx or .csv file</p>
            </div>
            <div className="w-full">
              <Label htmlFor="file-upload" className="sr-only">
                Choose file
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <Button 
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Link className="h-12 w-12 text-green-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Google Sheets</h3>
              <p className="text-sm text-gray-600">Enter a published Google Sheets URL</p>
            </div>
            <div className="w-full space-y-4">
              <Input
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                onClick={handleGoogleSheetLoad}
                disabled={isLoading || !googleSheetUrl}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Load Sheet
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

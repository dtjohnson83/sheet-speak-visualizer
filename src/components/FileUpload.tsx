import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { WorksheetSelector } from './WorksheetSelector';

interface FileUploadProps {
  onDataLoaded: (data: DataRow[], columns: ColumnInfo[], fileName: string, worksheetName?: string) => void;
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

// Check if a number could be an Excel date serial number
const isExcelDateSerial = (value: number): boolean => {
  // Excel date serials are typically between 1 (1900-01-01) and ~50000 (2037)
  // But let's be more conservative and check for reasonable date ranges
  return value >= 1 && value <= 100000 && Number.isInteger(value);
};

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [worksheets, setWorksheets] = useState<WorksheetInfo[]>([]);
  const [currentFileName, setCurrentFileName] = useState('');
  const [showWorksheetSelector, setShowWorksheetSelector] = useState(false);
  const [loadMultipleSheets, setLoadMultipleSheets] = useState(false);
  const { toast } = useToast();

  const detectColumnType = (values: any[]): 'numeric' | 'date' | 'categorical' | 'text' => {
    const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonEmptyValues.length === 0) return 'text';
    
    // Enhanced date detection patterns
    const datePatterns = [
      /^\d{4}-\d{1,2}-\d{1,2}$/,                    // YYYY-MM-DD
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,                  // MM/DD/YYYY or DD/MM/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/,                    // MM-DD-YYYY or DD-MM-YYYY
      /^\d{4}\/\d{1,2}\/\d{1,2}$/,                  // YYYY/MM/DD
      /^\d{1,2}\/\d{1,2}\/\d{2}$/,                  // MM/DD/YY or DD/MM/YY
      /^\d{1,2}-\d{1,2}-\d{2}$/,                    // MM-DD-YY or DD-MM-YY
      /^\w{3}\s+\d{1,2},?\s+\d{4}$/,                // Mon DD, YYYY or Mon DD YYYY
      /^\d{1,2}\s+\w{3}\s+\d{4}$/,                  // DD Mon YYYY
      /^\w{3}\s+\d{1,2}$/,                          // Mon DD
      /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}/,    // ISO datetime
      /^\d{1,2}:\d{1,2}:\d{1,2}$/,                  // HH:MM:SS
      /^\d{1,2}:\d{1,2}$/,                          // HH:MM
    ];
    
    // Check for Excel date serial numbers first
    const potentialDateSerials = nonEmptyValues.filter(v => {
      const num = Number(v);
      return !isNaN(num) && isExcelDateSerial(num);
    });
    
    // If more than 80% of values look like Excel date serials, treat as dates
    if (potentialDateSerials.length > nonEmptyValues.length * 0.8) {
      return 'date';
    }
    
    // Check for date values with improved logic
    const dateValues = nonEmptyValues.filter(v => {
      const str = String(v).trim();
      
      // Check against date patterns
      const matchesPattern = datePatterns.some(pattern => pattern.test(str));
      if (!matchesPattern) return false;
      
      // Try to parse as date
      const date = new Date(str);
      if (isNaN(date.getTime())) return false;
      
      // Additional validation: reasonable date range (1900 - 2100)
      const year = date.getFullYear();
      if (year < 1900 || year > 2100) return false;
      
      // Check if it's not just a number being interpreted as a date
      // (e.g., "2023" shouldn't be considered a date if it's likely a year column)
      if (/^\d{4}$/.test(str) && year >= 1900 && year <= new Date().getFullYear() + 10) {
        // Could be a year, need more context - check if other values in column are similar
        const yearLikeValues = nonEmptyValues.filter(val => /^\d{4}$/.test(String(val).trim()));
        if (yearLikeValues.length > nonEmptyValues.length * 0.8) {
          return false; // Likely a year column, not dates
        }
      }
      
      return true;
    });
    
    // If more than 60% of values are valid dates, consider it a date column
    if (dateValues.length > nonEmptyValues.length * 0.6) {
      return 'date';
    }
    
    // Check for numeric values (after date check to avoid conflicts)
    const numericValues = nonEmptyValues.filter(v => {
      const num = Number(v);
      return !isNaN(num) && isFinite(num) && String(v).trim() !== '';
    });
    if (numericValues.length > nonEmptyValues.length * 0.7) {
      return 'numeric';
    }
    
    // Check for categorical (limited unique values)
    const uniqueValues = new Set(nonEmptyValues.map(v => String(v).toLowerCase().trim()));
    if (uniqueValues.size < nonEmptyValues.length * 0.5 && uniqueValues.size > 1 && uniqueValues.size <= 50) {
      return 'categorical';
    }
    
    return 'text';
  };

  const processWorksheetData = useCallback((worksheetData: WorksheetInfo) => {
    console.log('Processing worksheet data:', worksheetData);
    
    const rawData = worksheetData.data;
    if (!rawData || rawData.length === 0) {
      toast({
        title: "Error",
        description: "No data found in the selected worksheet",
        variant: "destructive",
      });
      return;
    }

    // Get column names from the first row
    const columnNames = Object.keys(rawData[0]);
    
    // First pass: detect column types
    const columnTypes: Record<string, 'numeric' | 'date' | 'categorical' | 'text'> = {};
    columnNames.forEach(name => {
      const values = rawData.map(row => row[name]);
      columnTypes[name] = detectColumnType(values);
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
            processedRow[columnName] = convertExcelDate(num);
          } else {
            // Try to parse as regular date and convert to ISO string
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
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

    console.log('Detected columns:', columns);
    console.log('Processed data sample:', processedData.slice(0, 3));
    
    onDataLoaded(processedData, columns, currentFileName, worksheetData.name);
    
    toast({
      title: "Success",
      description: `Loaded ${processedData.length} rows from "${worksheetData.name}" with ${columns.length} columns`,
    });
  }, [onDataLoaded, toast, currentFileName]);

  const handleWorksheetSelected = useCallback((worksheet: WorksheetInfo) => {
    processWorksheetData(worksheet);
    
    if (!loadMultipleSheets) {
      setShowWorksheetSelector(false);
      setWorksheets([]);
    }
  }, [processWorksheetData, loadMultipleSheets]);

  const handleLoadAllSheets = useCallback(() => {
    worksheets.forEach(worksheet => {
      processWorksheetData(worksheet);
    });
    
    setShowWorksheetSelector(false);
    setWorksheets([]);
    setLoadMultipleSheets(false);
  }, [worksheets, processWorksheetData]);

  const handleWorksheetSelectorCancel = useCallback(() => {
    setShowWorksheetSelector(false);
    setWorksheets([]);
    setCurrentFileName('');
    setIsLoading(false);
    setLoadMultipleSheets(false);
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
    }
    setIsLoading(false);
  }, [processWorksheetData]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: 'binary' });
        processExcelFile(workbook, file.name);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read the file. Please check the file format.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [processExcelFile, toast]);

  const handleGoogleSheetLoad = useCallback(async () => {
    if (!googleSheetUrl) {
      toast({
        title: "Error",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert Google Sheets URL to CSV export URL
      const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error('Invalid Google Sheets URL');
      }
      
      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch Google Sheet data');
      }
      
      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      processExcelFile(workbook, 'Google Sheet');
    } catch (error) {
      console.error('Error loading Google Sheet:', error);
      toast({
        title: "Error",
        description: "Failed to load Google Sheet. Make sure the sheet is published to web.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [googleSheetUrl, processExcelFile, toast]);

  if (showWorksheetSelector) {
    return (
      <div className="space-y-6">
        <WorksheetSelector
          worksheets={worksheets}
          fileName={currentFileName}
          onWorksheetSelected={handleWorksheetSelected}
          onLoadAllSheets={handleLoadAllSheets}
          onCancel={handleWorksheetSelectorCancel}
          allowMultiple={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Upload Your Data</h2>
        <p className="text-gray-600">
          Upload an Excel file (.xlsx) or connect to a Google Sheets document
        </p>
      </div>

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
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? 'Processing...' : 'Choose File'}
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
                <Link className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Load Sheet'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

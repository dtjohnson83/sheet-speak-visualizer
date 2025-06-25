
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface FileUploadProps {
  onDataLoaded: (data: DataRow[], columns: ColumnInfo[], fileName: string) => void;
}

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
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

  const processData = useCallback((rawData: any[], fileName: string) => {
    console.log('Processing data:', rawData);
    
    if (!rawData || rawData.length === 0) {
      toast({
        title: "Error",
        description: "No data found in the file",
        variant: "destructive",
      });
      return;
    }

    // Get column names from the first row
    const columnNames = Object.keys(rawData[0]);
    
    // Detect column types
    const columns: ColumnInfo[] = columnNames.map(name => {
      const values = rawData.map(row => row[name]);
      const type = detectColumnType(values);
      return {
        name,
        type,
        values: values.filter(v => v !== null && v !== undefined && v !== '')
      };
    });

    console.log('Detected columns:', columns);
    onDataLoaded(rawData, columns, fileName);
    
    toast({
      title: "Success",
      description: `Loaded ${rawData.length} rows with ${columns.length} columns`,
    });
  }, [onDataLoaded, toast]);

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
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        processData(jsonData, file.name);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read the file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [processData, toast]);

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
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      processData(jsonData, 'Google Sheet');
    } catch (error) {
      console.error('Error loading Google Sheet:', error);
      toast({
        title: "Error",
        description: "Failed to load Google Sheet. Make sure the sheet is published to web.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [googleSheetUrl, processData, toast]);

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

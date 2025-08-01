import React, { useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
interface TemporalDataValidationProps {
  data: DataRow[];
  dateColumn: string;
  columns: ColumnInfo[];
}

const parseDateLocal = (value: any): Date | null => {
  if (!value) return null;
  
  try {
    // Handle Date objects
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return value;
    }
    
    // Handle Excel dates (numbers representing days since 1900-01-01)
    if (typeof value === 'number') {
      // Excel date serial number
      if (value > 1 && value < 2958466) { // Valid Excel date range
        const excelDate = new Date((value - 25569) * 86400 * 1000);
        return isNaN(excelDate.getTime()) ? null : excelDate;
      }
      // Unix timestamp
      if (value > 1000000000 && value < 4000000000) {
        return new Date(value * 1000);
      }
      // Millisecond timestamp
      if (value > 1000000000000) {
        return new Date(value);
      }
      return new Date(value);
    }
    
    const str = String(value).trim();
    if (!str) return null;
    
    // Try direct parsing
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const TemporalDataValidation: React.FC<TemporalDataValidationProps> = ({
  data,
  dateColumn,
  columns
}) => {
  const validation = useMemo(() => {
    if (!data.length || !dateColumn) {
      return {
        isValid: false,
        validDates: 0,
        totalRows: data.length,
        dateRange: null,
        sampleValues: [],
        uniqueDates: 0,
        issues: ['No data or date column selected']
      };
    }

    const sampleValues = data.slice(0, 5).map(row => ({
      original: row[dateColumn],
      type: typeof row[dateColumn],
      parsed: parseDateLocal(row[dateColumn])
    }));

    const validDates = data
      .map(row => parseDateLocal(row[dateColumn]))
      .filter(date => date !== null) as Date[];

    const uniqueDates = new Set(validDates.map(date => date.toDateString()));
    
    const issues: string[] = [];
    if (validDates.length === 0) {
      issues.push('No valid dates found in selected column');
    } else if (validDates.length < 3) {
      issues.push('Not enough valid dates for animation (minimum 3 required)');
    } else if (uniqueDates.size < 2) {
      issues.push('Insufficient time spread (need at least 2 different dates)');
    }

    let dateRange = null;
    if (validDates.length > 0) {
      const sortedDates = validDates.sort((a, b) => a.getTime() - b.getTime());
      dateRange = {
        start: sortedDates[0],
        end: sortedDates[sortedDates.length - 1]
      };
    }

    return {
      isValid: issues.length === 0,
      validDates: validDates.length,
      totalRows: data.length,
      dateRange,
      sampleValues,
      uniqueDates: uniqueDates.size,
      issues
    };
  }, [data, dateColumn]);

  if (!dateColumn) {
    return null;
  }

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <InfoIcon className="h-4 w-4" />
          Data Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          {validation.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-sm font-medium">
            {validation.isValid ? 'Ready for Animation' : 'Issues Found'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <Badge variant="outline" className="text-xs">
              {validation.validDates} / {validation.totalRows} valid dates
            </Badge>
          </div>
          <div>
            <Badge variant="outline" className="text-xs">
              {validation.uniqueDates} unique dates
            </Badge>
          </div>
        </div>

        {validation.dateRange && (
          <div className="text-xs text-muted-foreground">
            <strong>Date Range:</strong> {validation.dateRange.start.toLocaleDateString()} - {validation.dateRange.end.toLocaleDateString()}
          </div>
        )}

        {validation.issues.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <ul className="list-disc list-inside space-y-1">
                {validation.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Sample Data
          </summary>
          <div className="mt-2 space-y-1">
            {validation.sampleValues.map((sample, index) => (
              <div key={index} className="font-mono text-xs bg-muted p-1 rounded">
                <span className="text-blue-600">{JSON.stringify(sample.original)}</span>
                <span className="text-gray-500"> ({sample.type})</span>
                <span className="text-green-600"> → {sample.parsed?.toLocaleDateString() || 'Invalid'}</span>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
};
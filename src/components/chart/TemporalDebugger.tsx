import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Bug, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { parseDate, detectTemporalColumns } from '@/lib/chart/temporalDataProcessor';

interface TemporalDebuggerProps {
  data: DataRow[];
  columns: ColumnInfo[];
  selectedDateColumn: string;
}

export const TemporalDebugger: React.FC<TemporalDebuggerProps> = ({
  data,
  columns,
  selectedDateColumn
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data.length) return null;

  // Analyze the selected date column
  const columnExists = selectedDateColumn && selectedDateColumn in data[0];
  const sampleSize = Math.min(10, data.length);
  const sampleData = data.slice(0, sampleSize);

  // Parse sample dates
  const parseResults = sampleData.map((row, index) => {
    const rawValue = row[selectedDateColumn];
    const parsedDate = parseDate(rawValue);
    
    return {
      index,
      rawValue,
      type: typeof rawValue,
      parsed: parsedDate,
      success: parsedDate !== null
    };
  });

  const successCount = parseResults.filter(r => r.success).length;
  const successRate = (successCount / sampleSize) * 100;

  // Detect all potential temporal columns
  const temporalColumns = detectTemporalColumns(columns);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug Date Parsing
            {successRate < 50 && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            {successRate >= 50 && successRate < 100 && (
              <Info className="h-4 w-4 text-warning" />
            )}
            {successRate === 100 && (
              <CheckCircle className="h-4 w-4 text-success" />
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Date Column Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Column Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Selected Column:</span>
                <code className="bg-muted px-1 rounded text-sm">{selectedDateColumn || 'None'}</code>
                {columnExists ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
              
              {columnExists && (
                <div className="text-sm text-muted-foreground">
                  Success Rate: {successCount}/{sampleSize} ({successRate.toFixed(1)}%)
                </div>
              )}
            </div>

            {/* Available Temporal Columns */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Available Temporal Columns:</span>
              <div className="flex flex-wrap gap-1">
                {temporalColumns.length > 0 ? temporalColumns.map(col => (
                  <span 
                    key={col.name}
                    className={`px-2 py-1 rounded text-xs ${
                      col.name === selectedDateColumn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {col.name} ({col.type})
                  </span>
                )) : (
                  <span className="text-sm text-muted-foreground">
                    No temporal columns detected
                  </span>
                )}
              </div>
            </div>

            {/* Sample Parsing Results */}
            {columnExists && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Sample Data Parsing:</span>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {parseResults.map(result => (
                    <div 
                      key={result.index}
                      className={`p-2 rounded text-xs font-mono ${
                        result.success 
                          ? 'bg-success/10 border border-success/20' 
                          : 'bg-destructive/10 border border-destructive/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-3 w-3 text-success" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                        )}
                        <span>Row {result.index}:</span>
                      </div>
                      <div className="ml-5 space-y-1">
                        <div>Raw: <code>{JSON.stringify(result.rawValue)}</code> ({result.type})</div>
                        <div>Parsed: <code>{result.parsed ? result.parsed.toISOString() : 'null'}</code></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Recommendations:</span>
              <div className="space-y-1 text-sm text-muted-foreground">
                {successRate === 0 && (
                  <div className="text-destructive">
                    • No dates could be parsed. Check if the column contains valid date data.
                  </div>
                )}
                {successRate > 0 && successRate < 50 && (
                  <div className="text-warning">
                    • Low success rate. Consider using a different date format.
                  </div>
                )}
                {successRate >= 50 && successRate < 100 && (
                  <div className="text-info">
                    • Good success rate, but some dates couldn't be parsed.
                  </div>
                )}
                {successRate === 100 && (
                  <div className="text-success">
                    • All sample dates parsed successfully!
                  </div>
                )}
                
                <div>• Supported formats: ISO dates, Excel dates, Unix timestamps, MM/DD/YYYY, DD.MM.YYYY</div>
                <div>• Make sure date column contains consistent date formats</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
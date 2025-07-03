import { useState, useMemo } from 'react';
import { format, isAfter, isBefore, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangeFilterProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onFilteredDataChange: (filteredData: DataRow[], summary: string) => void;
  className?: string;
}

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: 365 },
  { label: 'All time', days: null },
];

export const DateRangeFilter = ({ 
  data, 
  columns, 
  onFilteredDataChange, 
  className 
}: DateRangeFilterProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // Auto-detect date columns
  const dateColumns = useMemo(() => {
    return columns.filter(col => col.type === 'date' || 
      col.name.toLowerCase().includes('date') ||
      col.name.toLowerCase().includes('time') ||
      col.name.toLowerCase().includes('created') ||
      col.name.toLowerCase().includes('updated')
    );
  }, [columns]);

  // Auto-select primary date column
  useMemo(() => {
    if (dateColumns.length > 0 && !selectedColumn) {
      // Prefer columns with 'date' in name, then 'created', then first available
      const primaryDate = dateColumns.find(col => 
        col.name.toLowerCase().includes('date')
      ) || dateColumns.find(col => 
        col.name.toLowerCase().includes('created')
      ) || dateColumns[0];
      
      setSelectedColumn(primaryDate.name);
    }
  }, [dateColumns, selectedColumn]);

  // Parse date value from various formats
  const parseDate = (value: any): Date | null => {
    if (!value) return null;
    
    // Handle existing Date objects
    if (value instanceof Date) return value;
    
    // Handle ISO strings and other formats
    if (typeof value === 'string') {
      const parsed = parseISO(value);
      if (isValid(parsed)) return parsed;
      
      // Try standard Date parsing
      const standardParsed = new Date(value);
      if (isValid(standardParsed)) return standardParsed;
    }
    
    // Handle numeric timestamps
    if (typeof value === 'number') {
      const date = new Date(value);
      if (isValid(date)) return date;
    }
    
    return null;
  };

  // Filter data based on date range
  const filterData = (from: Date | null, to: Date | null, column: string) => {
    if (!column || (!from && !to)) {
      onFilteredDataChange(data, `All ${data.length.toLocaleString()} rows`);
      return;
    }

    const filteredData = data.filter(row => {
      const dateValue = parseDate(row[column]);
      if (!dateValue) return false;

      if (from && isBefore(dateValue, from)) return false;
      if (to && isAfter(dateValue, to)) return false;
      
      return true;
    });

    const fromStr = from ? format(from, 'MMM dd, yyyy') : 'beginning';
    const toStr = to ? format(to, 'MMM dd, yyyy') : 'end';
    const summary = `${filteredData.length.toLocaleString()} of ${data.length.toLocaleString()} rows (${fromStr} - ${toStr})`;
    
    onFilteredDataChange(filteredData, summary);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    filterData(range.from, range.to, selectedColumn);
  };

  const handleColumnChange = (column: string) => {
    setSelectedColumn(column);
    filterData(dateRange.from, dateRange.to, column);
  };

  const handlePresetSelect = (days: number | null) => {
    if (days === null) {
      // All time
      const newRange = { from: null, to: null };
      setDateRange(newRange);
      filterData(null, null, selectedColumn);
    } else {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - days);
      
      const newRange = { from, to };
      setDateRange(newRange);
      filterData(from, to, selectedColumn);
    }
    setIsOpen(false);
  };

  const clearFilter = () => {
    const newRange = { from: null, to: null };
    setDateRange(newRange);
    filterData(null, null, selectedColumn);
  };

  const hasActiveFilter = dateRange.from || dateRange.to;

  if (dateColumns.length === 0) {
    return null; // No date columns found
  }

  return (
    <Card className={cn("mb-4", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Date Range Filter</CardTitle>
            <CardDescription className="text-xs">
              Filter data by date range for more focused analysis
            </CardDescription>
          </div>
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Date Column Selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium min-w-fit">Date Column:</span>
          <Select value={selectedColumn} onValueChange={handleColumnChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select date column" />
            </SelectTrigger>
            <SelectContent>
              {dateColumns.map((column) => (
                <SelectItem key={column.name} value={column.name}>
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Presets */}
          {DATE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect(preset.days)}
              className="h-7 px-2 text-xs"
            >
              {preset.label}
            </Button>
          ))}
          
          {/* Custom Date Range */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                Custom Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from || range?.to) {
                    handleDateRangeChange({ 
                      from: range?.from || null, 
                      to: range?.to || null 
                    });
                  }
                }}
                className="pointer-events-auto"
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filter Display */}
        {hasActiveFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {dateRange.from && format(dateRange.from, 'MMM dd, yyyy')}
              {dateRange.from && dateRange.to && ' - '}
              {dateRange.to && format(dateRange.to, 'MMM dd, yyyy')}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
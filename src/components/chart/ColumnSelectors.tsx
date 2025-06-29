
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnInfo } from '@/pages/Index';

interface ColumnSelectorsProps {
  chartType: string;
  xColumn: string;
  setXColumn: (value: string) => void;
  yColumn: string;
  setYColumn: (value: string) => void;
  stackColumn: string;
  setStackColumn: (value: string) => void;
  valueColumn: string;
  setValueColumn: (value: string) => void;
  numericColumns: ColumnInfo[];
  categoricalColumns: ColumnInfo[];
  dateColumns: ColumnInfo[];
}

export const ColumnSelectors = ({
  chartType,
  xColumn,
  setXColumn,
  yColumn,
  setYColumn,
  stackColumn,
  setStackColumn,
  valueColumn,
  setValueColumn,
  numericColumns,
  categoricalColumns,
  dateColumns
}: ColumnSelectorsProps) => {
  const needsValueColumn = chartType === 'heatmap' || chartType === 'sankey';

  // Debug logging
  console.log('ColumnSelectors received:', {
    chartType,
    numericColumns: numericColumns.length,
    categoricalColumns: categoricalColumns.length,
    dateColumns: dateColumns.length,
    allColumns: [...numericColumns, ...categoricalColumns, ...dateColumns].map(col => col.name)
  });

  // Helper function to display column names - simplified and more robust
  const formatColumnDisplay = (col: ColumnInfo) => {
    const baseDisplay = `${col.name} (${col.type})`;
    return col.worksheet && col.worksheet !== 'default' ? `${baseDisplay} - ${col.worksheet}` : baseDisplay;
  };

  // Get appropriate columns for X-axis based on chart type
  const getXAxisColumns = () => {
    if (chartType === 'scatter') {
      return [...numericColumns, ...dateColumns];
    }
    return [...categoricalColumns, ...dateColumns];
  };

  // Get appropriate columns for Y-axis based on chart type
  const getYAxisColumns = () => {
    if (chartType === 'heatmap') {
      return [...categoricalColumns, ...numericColumns];
    }
    if (chartType === 'sankey') {
      return categoricalColumns;
    }
    return numericColumns;
  };

  const xAxisColumns = getXAxisColumns();
  const yAxisColumns = getYAxisColumns();

  console.log('Column options:', {
    xAxisColumns: xAxisColumns.map(col => col.name),
    yAxisColumns: yAxisColumns.map(col => col.name),
    numericForValue: numericColumns.map(col => col.name)
  });

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">
          {chartType === 'sankey' ? 'Source' : 'X-Axis'}
        </label>
        <Select value={xColumn} onValueChange={setXColumn}>
          <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
            {xAxisColumns.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {formatColumnDisplay(col)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {chartType === 'sankey' ? 'Target' : chartType === 'heatmap' ? 'Y-Axis' : 'Y-Axis'}
        </label>
        <Select value={yColumn} onValueChange={setYColumn}>
          <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
            {yAxisColumns.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {formatColumnDisplay(col)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsValueColumn && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {chartType === 'heatmap' ? 'Value (Intensity)' : 'Value (Flow)'}
          </label>
          <Select value={valueColumn} onValueChange={setValueColumn}>
            <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
              {numericColumns.map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {formatColumnDisplay(col)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {chartType === 'stacked-bar' && (
        <div>
          <label className="block text-sm font-medium mb-2">Stack By</label>
          <Select value={stackColumn} onValueChange={setStackColumn}>
            <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
              {categoricalColumns.map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {formatColumnDisplay(col)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};


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
    numericColumns: numericColumns.map(col => ({ name: col.name, type: col.type, worksheet: col.worksheet || 'default' })),
    categoricalColumns: categoricalColumns.map(col => ({ name: col.name, type: col.type, worksheet: col.worksheet || 'default' })),
    dateColumns: dateColumns.map(col => ({ name: col.name, type: col.type, worksheet: col.worksheet || 'default' }))
  });

  // Helper function to display column names nicely
  const formatColumnDisplay = (col: ColumnInfo) => {
    if (col.worksheet) {
      return `${col.name} (${col.type}) - ${col.worksheet}`;
    }
    return `${col.name} (${col.type})`;
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">
          {chartType === 'sankey' ? 'Source' : 'X-Axis'}
        </label>
        <Select value={xColumn} onValueChange={setXColumn}>
          <SelectTrigger>
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {(chartType === 'scatter' ? [...numericColumns, ...dateColumns] : [...categoricalColumns, ...dateColumns]).map((col) => (
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
          <SelectTrigger>
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {(chartType === 'heatmap' ? [...categoricalColumns, ...numericColumns] : chartType === 'sankey' ? categoricalColumns : numericColumns).map((col) => (
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
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
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

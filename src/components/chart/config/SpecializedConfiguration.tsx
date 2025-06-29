
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ColumnInfo } from '@/pages/Index';

interface SpecializedConfigurationProps {
  chartType: string;
  stackColumn: string;
  setStackColumn: (value: string) => void;
  valueColumn: string;
  setValueColumn: (value: string) => void;
  histogramBins: number;
  setHistogramBins: (value: number) => void;
  topXLimit: number | null;
  setTopXLimit: (value: number | null) => void;
  supportsTopXLimit: boolean;
  numericColumns: ColumnInfo[];
  categoricalColumns: ColumnInfo[];
}

export const SpecializedConfiguration = ({
  chartType,
  stackColumn,
  setStackColumn,
  valueColumn,
  setValueColumn,
  histogramBins,
  setHistogramBins,
  topXLimit,
  setTopXLimit,
  supportsTopXLimit,
  numericColumns,
  categoricalColumns
}: SpecializedConfigurationProps) => {
  const needsValueColumn = chartType === 'heatmap' || chartType === 'sankey';
  const isHistogram = chartType === 'histogram';

  return (
    <>
      {needsValueColumn && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {chartType === 'heatmap' ? 'Value (Intensity)' : 'Value (Flow)'}
          </label>
          <Select value={valueColumn} onValueChange={setValueColumn}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50 max-h-60 overflow-y-auto">
              {numericColumns.map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name} ({col.type})
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
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50 max-h-60 overflow-y-auto">
              {categoricalColumns.map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isHistogram && (
        <div>
          <label className="block text-sm font-medium mb-2">Number of Bins</label>
          <Input
            type="number"
            min="3"
            max="50"
            value={histogramBins}
            onChange={(e) => setHistogramBins(Number(e.target.value))}
            className="bg-white dark:bg-gray-800"
          />
        </div>
      )}

      {supportsTopXLimit && (
        <div>
          <label className="block text-sm font-medium mb-2">Top X Values</label>
          <Input
            type="number"
            min="1"
            placeholder="All values"
            value={topXLimit || ''}
            onChange={(e) => setTopXLimit(e.target.value ? Number(e.target.value) : null)}
            className="bg-white dark:bg-gray-800"
          />
        </div>
      )}
    </>
  );
};

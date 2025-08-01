
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
  numericColumns,
  categoricalColumns
}: SpecializedConfigurationProps) => {
  const needsValueColumn = chartType === 'heatmap' || chartType === 'sankey' || chartType === 'map2d' || chartType === 'map3d';
  const needsSeriesColumn = chartType === 'map2d' || chartType === 'map3d';
  const isHistogram = chartType === 'histogram';

  return (
    <>
      {needsSeriesColumn && (
        <div>
          <label className="block text-sm font-medium mb-2">Series Column (Group By)</label>
          <Select value={stackColumn} onValueChange={setStackColumn}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder="Select column for grouping" />
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

      {needsValueColumn && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {chartType === 'heatmap' ? 'Value (Intensity)' : 
             chartType === 'map2d' || chartType === 'map3d' ? 'Value Column (Marker Size/Color)' : 
             'Value (Flow)'}
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
    </>
  );
};

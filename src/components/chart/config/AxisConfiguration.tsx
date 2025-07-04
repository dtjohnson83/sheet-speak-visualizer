
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnInfo } from '@/pages/Index';

interface AxisConfigurationProps {
  chartType: string;
  xColumn: string;
  setXColumn: (value: string) => void;
  yColumn: string;
  setYColumn: (value: string) => void;
  numericColumns: ColumnInfo[];
  categoricalColumns: ColumnInfo[];
  dateColumns: ColumnInfo[];
}

export const AxisConfiguration = ({
  chartType,
  xColumn,
  setXColumn,
  yColumn,
  setYColumn,
  numericColumns,
  categoricalColumns,
  dateColumns
}: AxisConfigurationProps) => {
  const isHistogram = chartType === 'histogram';

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">
          {chartType === 'sankey' ? 'Source' : isHistogram ? 'Column to Analyze' : 'X-Axis'}
        </label>
        <Select value={xColumn} onValueChange={setXColumn}>
          <SelectTrigger>
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {(isHistogram ? numericColumns : chartType === 'scatter' ? [...numericColumns, ...dateColumns] : [...categoricalColumns, ...dateColumns]).map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {col.name} ({col.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isHistogram && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {chartType === 'sankey' ? 'Target' : chartType === 'heatmap' ? 'Y-Axis' : 'Y-Axis'}
          </label>
          <Select value={yColumn} onValueChange={setYColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {(chartType === 'heatmap' ? [...categoricalColumns, ...numericColumns] : chartType === 'sankey' ? categoricalColumns : numericColumns).map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};

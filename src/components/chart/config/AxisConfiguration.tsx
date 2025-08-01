
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnInfo } from '@/pages/Index';

interface AxisConfigurationProps {
  chartType: string;
  xColumn: string;
  setXColumn: (value: string) => void;
  yColumn: string;
  setYColumn: (value: string) => void;
  zColumn?: string;
  setZColumn?: (value: string) => void;
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
  zColumn,
  setZColumn,
  numericColumns,
  categoricalColumns,
  dateColumns
}: AxisConfigurationProps) => {
  const isHistogram = chartType === 'histogram';
  const isGeoChart = chartType === 'map2d' || chartType === 'map3d';
  console.log('AxisConfiguration - Column filtering:', {
    chartType,
    numericCount: numericColumns.length,
    categoricalCount: categoricalColumns.length,
    dateCount: dateColumns.length,
    numericColumns: numericColumns.map(c => ({ name: c.name, type: c.type })),
    categoricalColumns: categoricalColumns.map(c => ({ name: c.name, type: c.type })),
    dateColumns: dateColumns.map(c => ({ name: c.name, type: c.type })),
    xColumn,
    yColumn
  });

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">
          {chartType === 'sankey' ? 'Source' : 
           isHistogram ? 'Column to Analyze' : 
           isGeoChart ? 'Longitude' : 
           'X-Axis'}
        </label>
        <Select value={xColumn} onValueChange={setXColumn}>
          <SelectTrigger>
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {(isHistogram ? numericColumns : 
              isGeoChart ? numericColumns :
              chartType === 'scatter' ? [...numericColumns, ...dateColumns] : 
              [...categoricalColumns, ...dateColumns, ...numericColumns]).map((col) => (
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
            {chartType === 'sankey' ? 'Target' : 
             chartType === 'heatmap' ? 'Y-Axis' : 
             isGeoChart ? 'Latitude' : 
             'Y-Axis'}
          </label>
          <Select value={yColumn} onValueChange={setYColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
            {(chartType === 'heatmap' ? [...categoricalColumns, ...numericColumns] : 
              chartType === 'sankey' ? categoricalColumns : 
              isGeoChart ? numericColumns :
              numericColumns).map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Z-Axis for 3D charts */}
      {(chartType === 'scatter3d' || chartType === 'surface3d' || chartType === 'map3d') && setZColumn && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {chartType === 'map3d' ? 'Height/Elevation' : 'Z-Axis'}
          </label>
          <Select value={zColumn || ''} onValueChange={setZColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select Z column" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {numericColumns.map((col) => (
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

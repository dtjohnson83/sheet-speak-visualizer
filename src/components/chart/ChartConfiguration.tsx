
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';

interface ChartConfigurationProps {
  chartType: string;
  xColumn: string;
  setXColumn: (value: string) => void;
  yColumn: string;
  setYColumn: (value: string) => void;
  stackColumn: string;
  setStackColumn: (value: string) => void;
  sankeyTargetColumn: string;
  setSankeyTargetColumn: (value: string) => void;
  sortColumn: string;
  setSortColumn: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
  setChartType: (value: any) => void;
  columns: ColumnInfo[];
  numericColumns: ColumnInfo[];
  categoricalColumns: ColumnInfo[];
  dateColumns: ColumnInfo[];
}

export const ChartConfiguration = ({
  chartType,
  setChartType,
  xColumn,
  setXColumn,
  yColumn,
  setYColumn,
  stackColumn,
  setStackColumn,
  sankeyTargetColumn,
  setSankeyTargetColumn,
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  columns,
  numericColumns,
  categoricalColumns,
  dateColumns
}: ChartConfigurationProps) => {
  const autoSelect = () => {
    if (!xColumn && categoricalColumns.length > 0) {
      setXColumn(categoricalColumns[0].name);
    }
    if (!yColumn && numericColumns.length > 0) {
      setYColumn(numericColumns[0].name);
    }
    if (chartType === 'stacked-bar' && !stackColumn && categoricalColumns.length > 1) {
      setStackColumn(categoricalColumns[1].name);
    }
    if (chartType === 'sankey' && !sankeyTargetColumn && categoricalColumns.length > 1) {
      setSankeyTargetColumn(categoricalColumns[1].name);
    }
    if (sortColumn === 'none' && numericColumns.length > 0) {
      setSortColumn(numericColumns[0].name);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Chart Type</label>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="stacked-bar">Stacked Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
              <SelectItem value="heatmap">Heatmap</SelectItem>
              <SelectItem value="treemap">Tree Map</SelectItem>
              <SelectItem value="sankey">Sankey Diagram</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                  {col.name} ({col.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {chartType === 'sankey' ? 'Value' : 'Y-Axis'}
          </label>
          <Select value={yColumn} onValueChange={setYColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {(chartType === 'heatmap' || chartType === 'treemap' ? [...categoricalColumns, ...numericColumns] : numericColumns).map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                    {col.name} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {chartType === 'sankey' && (
          <div>
            <label className="block text-sm font-medium mb-2">Target</label>
            <Select value={sankeyTargetColumn} onValueChange={setSankeyTargetColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {categoricalColumns.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <Select value={sortColumn} onValueChange={setSortColumn}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {columns.map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2">Sort Direction</label>
          <Button
            variant="outline"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            disabled={!sortColumn || sortColumn === 'none'}
            className="flex items-center justify-center space-x-2"
          >
            {sortDirection === 'asc' ? (
              <>
                <ArrowUp className="h-4 w-4" />
                <span>Asc</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4" />
                <span>Desc</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={autoSelect}
          disabled={!columns.length}
        >
          Auto-select
        </Button>
      </div>
    </>
  );
};

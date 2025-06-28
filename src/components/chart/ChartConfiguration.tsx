import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';
import { ColorPaletteSelector } from './ColorPaletteSelector';

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
  valueColumn: string;
  setValueColumn: (value: string) => void;
  sortColumn: string;
  setSortColumn: (value: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (value: 'asc' | 'desc') => void;
  setChartType: (value: any) => void;
  showDataLabels: boolean;
  setShowDataLabels: (value: boolean) => void;
  supportsDataLabels: boolean;
  selectedPalette: string;
  setSelectedPalette: (value: string) => void;
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
  valueColumn,
  setValueColumn,
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  showDataLabels,
  setShowDataLabels,
  supportsDataLabels,
  selectedPalette,
  setSelectedPalette,
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
    if (chartType === 'sankey' && !yColumn && categoricalColumns.length > 1) {
      setYColumn(categoricalColumns[1].name);
    }
    if ((chartType === 'heatmap' || chartType === 'sankey') && !valueColumn && numericColumns.length > 0) {
      setValueColumn(numericColumns[0].name);
    }
    if (sortColumn === 'none' && numericColumns.length > 0) {
      setSortColumn(numericColumns[0].name);
    }
  };

  const needsValueColumn = chartType === 'heatmap' || chartType === 'sankey';

  // Helper function to display column names nicely
  const formatColumnDisplay = (col: ColumnInfo) => {
    const hasWorksheet = 'worksheet' in col;
    if (hasWorksheet) {
      return `${col.name} (${col.type}) - ${(col as any).worksheet}`;
    }
    return `${col.name} (${col.type})`;
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
                  {formatColumnDisplay(col)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ColorPaletteSelector
          selectedPalette={selectedPalette}
          onPaletteChange={setSelectedPalette}
        />

        {supportsDataLabels && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="data-labels"
                checked={showDataLabels}
                onCheckedChange={setShowDataLabels}
              />
              <Label htmlFor="data-labels" className="text-sm font-medium">
                Show data labels on chart
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Display values directly on chart elements for easier reading
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-8">
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

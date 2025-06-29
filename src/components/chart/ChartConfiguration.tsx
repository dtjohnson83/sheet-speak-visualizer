
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  topXLimit: number | null;
  setTopXLimit: (value: number | null) => void;
  supportsTopXLimit: boolean;
  histogramBins: number;
  setHistogramBins: (value: number) => void;
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
  topXLimit,
  setTopXLimit,
  supportsTopXLimit,
  histogramBins,
  setHistogramBins,
  columns,
  numericColumns,
  categoricalColumns,
  dateColumns
}: ChartConfigurationProps) => {
  const needsValueColumn = chartType === 'heatmap' || chartType === 'sankey';
  const isHistogram = chartType === 'histogram';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Chart Type</label>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="horizontal-bar">Horizontal Bar Chart</SelectItem>
              <SelectItem value="stacked-bar">Stacked Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
              <SelectItem value="histogram">Histogram</SelectItem>
              <SelectItem value="heatmap">Heatmap</SelectItem>
              <SelectItem value="treemap">Tree Map</SelectItem>
              <SelectItem value="sankey">Sankey Diagram</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {chartType === 'sankey' ? 'Source' : isHistogram ? 'Column to Analyze' : 'X-Axis'}
          </label>
          <Select value={xColumn} onValueChange={setXColumn}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50 max-h-60 overflow-y-auto">
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
              <SelectTrigger className="bg-white dark:bg-gray-800">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50 max-h-60 overflow-y-auto">
                {(chartType === 'heatmap' ? [...categoricalColumns, ...numericColumns] : chartType === 'sankey' ? categoricalColumns : numericColumns).map((col) => (
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

        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <Select value={sortColumn} onValueChange={setSortColumn}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50 max-h-60 overflow-y-auto">
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

      {/* Color palette and data labels section */}
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
    </>
  );
};

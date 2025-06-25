import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useChartState } from '@/hooks/useChartState';
import { SeriesManager } from './chart/SeriesManager';
import { ChartConfiguration } from './chart/ChartConfiguration';
import { AggregationConfiguration } from './chart/AggregationConfiguration';
import { prepareChartData } from '@/lib/chartDataProcessor';
import { SankeyData } from '@/lib/chartDataUtils';
import { DashboardTileData } from './dashboard/DashboardTile';
import {
  BarChartRenderer,
  LineChartRenderer,
  PieChartRenderer,
  ScatterChartRenderer,
  TreemapRenderer,
  StackedBarRenderer,
  HeatmapRenderer,
  SankeyRenderer
} from './chart/ChartRenderers';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void;
}

export const ChartVisualization = ({ data, columns, onSaveTile }: ChartVisualizationProps) => {
  const {
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
    series,
    setSeries,
    aggregationMethod,
    setAggregationMethod,
    chartColors,
    supportsMultipleSeries
  } = useChartState();

  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => col.type === 'categorical' || col.type === 'text');
  const dateColumns = columns.filter(col => col.type === 'date');

  const chartData = prepareChartData(
    data,
    columns,
    chartType,
    xColumn,
    yColumn,
    series,
    sortColumn,
    sortDirection,
    stackColumn,
    sankeyTargetColumn,
    supportsMultipleSeries,
    numericColumns,
    aggregationMethod
  );

  const isSankeyData = (data: DataRow[] | SankeyData): data is SankeyData => {
    return chartType === 'sankey' && typeof data === 'object' && 'nodes' in data && 'links' in data;
  };

  const isArrayData = (data: DataRow[] | SankeyData): data is DataRow[] => {
    return Array.isArray(data);
  };

  const handleSaveTile = () => {
    if (!xColumn || !yColumn || !onSaveTile) return;
    
    const title = `${chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} - ${xColumn} vs ${yColumn}`;
    
    onSaveTile({
      title,
      chartType,
      xColumn,
      yColumn,
      stackColumn,
      sankeyTargetColumn,
      sortColumn,
      sortDirection,
      series
    });
  };

  const renderChart = () => {
    if (!xColumn || !yColumn || (isArrayData(chartData) && chartData.length === 0) || (isSankeyData(chartData) && chartData.links.length === 0)) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Select columns to display chart</p>
        </div>
      );
    }

    const commonProps = {
      data: chartData as DataRow[],
      xColumn,
      yColumn,
      series,
      chartColors
    };

    switch (chartType) {
      case 'heatmap':
        return <HeatmapRenderer data={chartData as Array<{ x: string; y: string; value: number }>} />;

      case 'stacked-bar':
        return <StackedBarRenderer {...commonProps} stackColumn={stackColumn} originalData={data} />;

      case 'treemap':
        return <TreemapRenderer data={chartData as DataRow[]} chartColors={chartColors} />;

      case 'sankey':
        return <SankeyRenderer data={chartData as SankeyData} />;

      case 'bar':
        return <BarChartRenderer {...commonProps} />;

      case 'line':
        return <LineChartRenderer {...commonProps} />;

      case 'pie':
        return <PieChartRenderer data={chartData as DataRow[]} chartColors={chartColors} />;

      case 'scatter':
        return <ScatterChartRenderer {...commonProps} />;

      default:
        return null;
    }
  };

  const getDataPointCount = () => {
    if (isArrayData(chartData)) {
      return chartData.length;
    } else if (isSankeyData(chartData)) {
      return chartData.links.length;
    }
    return 0;
  };

  const getAggregationLabel = () => {
    const aggregationLabels = {
      sum: 'Sum',
      average: 'Average', 
      count: 'Count',
      min: 'Minimum',
      max: 'Maximum'
    };
    return aggregationLabels[aggregationMethod];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        
        <ChartConfiguration
          chartType={chartType}
          setChartType={setChartType}
          xColumn={xColumn}
          setXColumn={setXColumn}
          yColumn={yColumn}
          setYColumn={setYColumn}
          stackColumn={stackColumn}
          setStackColumn={setStackColumn}
          sankeyTargetColumn={sankeyTargetColumn}
          setSankeyTargetColumn={setSankeyTargetColumn}
          sortColumn={sortColumn}
          setSortColumn={setSortColumn}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          columns={columns}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
          dateColumns={dateColumns}
        />

        <div className="mt-4">
          <AggregationConfiguration
            aggregationMethod={aggregationMethod}
            setAggregationMethod={setAggregationMethod}
            yColumn={yColumn}
            numericColumns={numericColumns}
          />
        </div>

        {supportsMultipleSeries && (
          <SeriesManager
            series={series}
            setSeries={setSeries}
            numericColumns={numericColumns}
            yColumn={yColumn}
            chartColors={chartColors}
          />
        )}
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium">
              {chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} Chart
            </h4>
            {xColumn && yColumn && (
              <p className="text-sm text-gray-600">
                {chartType === 'sankey' ? `${xColumn} → ${sankeyTargetColumn} (${yColumn})` : `${xColumn} vs ${yColumn}`}
                {series.length > 0 && ` + ${series.length} additional series`} • {getDataPointCount()} data points
                {chartType === 'stacked-bar' && stackColumn && ` • Stacked by ${stackColumn}`}
                {sortColumn && sortColumn !== 'none' && ` • Sorted by ${sortColumn} (${sortDirection})`}
                {chartType !== 'scatter' && chartType !== 'sankey' && ` • ${getAggregationLabel()} aggregation`}
              </p>
            )}
          </div>
          
          {xColumn && yColumn && onSaveTile && (
            <Button
              onClick={handleSaveTile}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Save className="h-4 w-4" />
              Save as Tile
            </Button>
          )}
        </div>
        
        <div className="w-full overflow-x-auto">
          {renderChart()}
        </div>
      </Card>
    </div>
  );
};

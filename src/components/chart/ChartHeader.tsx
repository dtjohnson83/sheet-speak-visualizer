
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { DataRow } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { SankeyData } from '@/lib/chartDataUtils';

interface ChartHeaderProps {
  chartType: string;
  xColumn: string;
  yColumn: string;
  sankeyTargetColumn?: string;
  series: SeriesConfig[];
  stackColumn?: string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  showDataLabels: boolean;
  aggregationMethod: any;
  chartData: DataRow[] | SankeyData;
  onSaveTile?: () => void;
}

export const ChartHeader = ({
  chartType,
  xColumn,
  yColumn,
  sankeyTargetColumn,
  series,
  stackColumn,
  sortColumn,
  sortDirection,
  showDataLabels,
  aggregationMethod,
  chartData,
  onSaveTile
}: ChartHeaderProps) => {
  const getDataPointCount = () => {
    if (Array.isArray(chartData)) {
      return chartData.length;
    } else if (typeof chartData === 'object' && 'links' in chartData) {
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
            {showDataLabels && ` • Data labels enabled`}
          </p>
        )}
      </div>
      
      {xColumn && yColumn && onSaveTile && (
        <Button
          onClick={onSaveTile}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Save className="h-4 w-4" />
          Save as Tile
        </Button>
      )}
    </div>
  );
};

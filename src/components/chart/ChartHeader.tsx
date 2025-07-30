
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Edit2, Check, X } from 'lucide-react';
import { DataRow } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { SankeyData } from '@/lib/chartDataUtils';
import { useState } from 'react';
import { ChartShareDialog } from './sharing/ChartShareDialog';
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
  customTitle?: string;
  onTitleChange?: (title: string) => void;
  chartRef?: React.RefObject<HTMLElement>;
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
  onSaveTile,
  customTitle,
  onTitleChange,
  chartRef
}: ChartHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

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

  const getDefaultTitle = () => {
    return `${chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} Chart`;
  };

  const handleStartEdit = () => {
    setTempTitle(customTitle || getDefaultTitle());
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (onTitleChange) {
      onTitleChange(tempTitle.trim() || getDefaultTitle());
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setTempTitle('');
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-lg font-medium h-8"
                placeholder="Enter chart title"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveTitle}
                className="h-6 w-6 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h4 className="chart-title text-lg font-medium">
                {customTitle || getDefaultTitle()}
              </h4>
              {onTitleChange && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEdit}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
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
      
      <div className="flex items-center gap-2">
        {xColumn && yColumn && (
          <ChartShareDialog
            chartType={chartType}
            chartTitle={customTitle || getDefaultTitle()}
            chartData={chartData}
            chartRef={chartRef}
            is3D={chartType.includes('3d') || chartType.includes('-3d')}
          />
        )}
        
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
    </div>
  );
};

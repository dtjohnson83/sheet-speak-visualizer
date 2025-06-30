
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Info } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';

interface SeriesManagerHeaderProps {
  canAddSeries: boolean;
  availableColumns: ColumnInfo[];
  numericColumns: ColumnInfo[];
  yColumn: string;
  seriesLength: number;
  onAddSeries: () => void;
}

export const SeriesManagerHeader = ({ 
  canAddSeries, 
  availableColumns, 
  numericColumns, 
  yColumn, 
  seriesLength,
  onAddSeries 
}: SeriesManagerHeaderProps) => {
  const getButtonTooltipContent = () => {
    if (numericColumns.length === 0) {
      return "No numeric columns available for series";
    }
    if (numericColumns.length === 1 && yColumn) {
      return "Only one numeric column available (already used as Y-axis)";
    }
    if (seriesLength >= 1) {
      return "Maximum of one additional series allowed";
    }
    if (!availableColumns.length) {
      return "All available numeric columns are already used";
    }
    return `Add a new data series (${availableColumns.length} columns available)`;
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">Additional Series (Max: 1)</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-48">
                Add one additional data series to compare different metrics on the same chart. 
                Only works with Bar, Line, and Scatter charts.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                onClick={onAddSeries}
                disabled={!canAddSeries}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Series
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{getButtonTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

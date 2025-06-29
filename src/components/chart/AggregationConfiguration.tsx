
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnInfo } from '@/pages/Index';

export type AggregationMethod = 'sum' | 'average' | 'count' | 'min' | 'max';

interface AggregationConfigurationProps {
  aggregationMethod: AggregationMethod;
  setAggregationMethod: (method: AggregationMethod) => void;
  yColumn: string;
  chartType: string;
  numericColumns: ColumnInfo[];
}

export const AggregationConfiguration = ({
  aggregationMethod,
  setAggregationMethod,
  yColumn,
  chartType,
  numericColumns
}: AggregationConfigurationProps) => {
  console.log('AggregationConfiguration render:', { 
    aggregationMethod, 
    yColumn, 
    chartType, 
    numericColumnsCount: numericColumns.length 
  });

  // Show aggregation for more chart types and scenarios
  const supportsAggregation = [
    'pie', 
    'treemap', 
    'stacked-bar', 
    'heatmap', 
    'sankey', 
    'bar', 
    'line'
  ].includes(chartType);
  
  // For numeric Y columns or charts that always support aggregation
  const isNumericYColumn = numericColumns.some(col => col.name === yColumn);
  const shouldShow = supportsAggregation && (isNumericYColumn || ['heatmap', 'sankey'].includes(chartType));
  
  console.log('AggregationConfiguration visibility:', { 
    supportsAggregation, 
    isNumericYColumn, 
    shouldShow, 
    yColumn 
  });

  if (!shouldShow || !yColumn) {
    console.log('AggregationConfiguration hidden - shouldShow:', shouldShow, 'yColumn:', yColumn);
    return null;
  }

  console.log('AggregationConfiguration showing for:', chartType, 'with yColumn:', yColumn);

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Data Aggregation</h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="aggregation-method" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aggregation Method
            </Label>
            <Select value={aggregationMethod} onValueChange={setAggregationMethod}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select aggregation method" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="min">Minimum</SelectItem>
                <SelectItem value="max">Maximum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {chartType === 'heatmap' 
            ? `Values will be grouped by X and Y axes and ${aggregationMethod} will be applied`
            : chartType === 'sankey'
            ? `Flow values will be grouped by source-target pairs and ${aggregationMethod} will be applied`
            : `Data will be grouped by X-axis and ${aggregationMethod} will be applied to ${yColumn}`
          }
        </p>
      </div>
    </Card>
  );
};

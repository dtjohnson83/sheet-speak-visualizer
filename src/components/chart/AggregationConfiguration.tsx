
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
  // Show aggregation for charts that support it - now including KPI
  const supportsAggregation = ['bar', 'line', 'pie', 'treemap', 'treemap3d', 'stacked-bar', 'heatmap', 'kpi'].includes(chartType);
  
  // For numeric Y columns or charts that always support aggregation
  const isNumericYColumn = numericColumns.some(col => col.name === yColumn);
  const shouldShow = supportsAggregation && (isNumericYColumn || ['heatmap', 'kpi'].includes(chartType));
  
  if (!shouldShow || (!yColumn && chartType !== 'kpi')) {
    return null;
  }

  const getAggregationDescription = () => {
    switch (chartType) {
      case 'kpi':
        return `KPI values will be ${aggregationMethod === 'count' ? 'counted' : 'aggregated using ' + aggregationMethod}`;
      case 'heatmap':
        return `Values will be grouped by X and Y axes and ${aggregationMethod} will be applied`;
      case 'bar':
      case 'line':
        return `Data points with the same X-axis value will be grouped and ${aggregationMethod} will be applied to ${yColumn} (primary series)`;
      default:
        return `Data will be grouped by X-axis and ${aggregationMethod} will be applied to ${yColumn} (primary series)`;
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Primary Series Aggregation</h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="aggregation-method" className="text-sm font-medium">
              Aggregation Method {yColumn && `for ${yColumn}`}
            </Label>
            <Select value={aggregationMethod} onValueChange={setAggregationMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select aggregation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="min">Minimum</SelectItem>
                <SelectItem value="max">Maximum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          {getAggregationDescription()}
        </p>
      </div>
    </Card>
  );
};

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnInfo } from '@/types/data';

export type AggregationMethod = 'sum' | 'average' | 'count' | 'min' | 'max';

interface AggregationConfigurationProps {
  aggregationMethod: AggregationMethod;
  setAggregationMethod: (method: AggregationMethod) => void;
  yColumn: string;
  numericColumns: ColumnInfo[];
}

export const AggregationConfiguration = ({
  aggregationMethod,
  setAggregationMethod,
  yColumn,
  numericColumns
}: AggregationConfigurationProps) => {
  // Only show aggregation options if we have a numeric Y column
  const isNumericYColumn = numericColumns.some(col => col.name === yColumn);
  
  if (!isNumericYColumn || !yColumn) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Data Aggregation</h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="aggregation-method" className="text-sm font-medium">
              Aggregation Method
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
          Data will be grouped by X-axis and {aggregationMethod} will be applied to {yColumn}
        </p>
      </div>
    </Card>
  );
};

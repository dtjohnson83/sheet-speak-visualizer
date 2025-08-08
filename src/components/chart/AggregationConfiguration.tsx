import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnInfo } from '@/pages/Index';

export type AggregationMethod = 'sum' | 'average' | 'count' | 'min' | 'max' | 'none';

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
  // Show aggregation for charts that support it - now including KPI but excluding 3D time series
  const supportsAggregation = ['bar', 'line', 'pie', 'treemap', 'treemap3d', 'stacked-bar', 'heatmap', 'kpi'].includes(chartType);
  
  // For 3D time series charts, we want to show the component but force/default to 'none'
  const isTimeSeries = chartType === '3d-time-series-cube' || chartType === 'timeseries3d';
  
  // For numeric Y columns or charts that always support aggregation
  const isNumericYColumn = numericColumns.some(col => col.name === yColumn);
  const shouldShow = (supportsAggregation || isTimeSeries) && (isNumericYColumn || ['heatmap', 'kpi'].includes(chartType) || isTimeSeries);
  
  if (!shouldShow || (!yColumn && chartType !== 'kpi' && !isTimeSeries)) {
    return null;
  }

  // Auto-set to 'none' for time series charts if not already set
  React.useEffect(() => {
    if (isTimeSeries && aggregationMethod !== 'none') {
      setAggregationMethod('none');
    }
  }, [isTimeSeries, aggregationMethod, setAggregationMethod]);

  const getAggregationDescription = () => {
    if (aggregationMethod === 'none') {
      return isTimeSeries 
        ? 'Raw time series data will be used without aggregation - each individual data point will be displayed to show progression over time'
        : 'Raw data will be used without aggregation - each individual record will be displayed';
    }

    switch (chartType) {
      case 'kpi':
        return `KPI values will be ${aggregationMethod === 'count' ? 'counted' : 'aggregated using ' + aggregationMethod}`;
      case 'heatmap':
        return `Values will be grouped by X and Y axes and ${aggregationMethod} will be applied`;
      case 'bar':
      case 'line':
        return `Data points with the same X-axis value will be grouped and ${aggregationMethod} will be applied to ${yColumn} (primary series)`;
      case '3d-time-series-cube':
      case 'timeseries3d':
        return `Time series data should use "None" to preserve individual data points and show temporal progression`;
      default:
        return `Data will be grouped by X-axis and ${aggregationMethod} will be applied to ${yColumn} (primary series)`;
    }
  };

  const getCardClassName = () => {
    if (isTimeSeries && aggregationMethod !== 'none') {
      return "p-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20";
    }
    return "p-4";
  };

  const getWarningText = () => {
    if (isTimeSeries && aggregationMethod !== 'none') {
      return (
        <div className="text-orange-800 dark:text-orange-200 text-xs mt-2 p-2 bg-orange-100 dark:bg-orange-800/30 rounded">
          ⚠️ <strong>Time Series Warning:</strong> Aggregation will group your time series data and lose temporal detail. 
          Use "None (Raw Data)" to show individual data points over time.
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={getCardClassName()}>
      <div className="space-y-3">
        <h4 className="text-sm font-medium">
          {isTimeSeries ? 'Time Series Data Configuration' : 'Primary Series Aggregation'}
        </h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="aggregation-method" className="text-sm font-medium">
              {isTimeSeries ? 'Data Processing Method' : `Aggregation Method ${yColumn ? `for ${yColumn}` : ''}`}
            </Label>
            <Select value={aggregationMethod} onValueChange={setAggregationMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select aggregation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  None (Raw Data)
                  {isTimeSeries && " ← Recommended for Time Series"}
                </SelectItem>
                {!isTimeSeries && (
                  <>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                  </>
                )}
                {isTimeSeries && (
                  <>
                    <SelectItem value="sum">Sum (Not Recommended)</SelectItem>
                    <SelectItem value="average">Average (Not Recommended)</SelectItem>
                    <SelectItem value="count">Count (Not Recommended)</SelectItem>
                    <SelectItem value="min">Minimum (Not Recommended)</SelectItem>
                    <SelectItem value="max">Maximum (Not Recommended)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          {getAggregationDescription()}
        </p>
        {getWarningText()}
        {isTimeSeries && aggregationMethod === 'none' && (
          <div className="text-green-800 dark:text-green-200 text-xs mt-2 p-2 bg-green-100 dark:bg-green-800/30 rounded">
            ✅ <strong>Perfect!</strong> Raw data mode will preserve all individual time series data points for proper 3D visualization.
          </div>
        )}
      </div>
    </Card>
  );
};

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AxisLabelConfigurationProps {
  xColumn: string;
  yColumn: string;
  xAxisLabel: string;
  setXAxisLabel: (value: string) => void;
  yAxisLabel: string;
  setYAxisLabel: (value: string) => void;
  chartType: string;
}

// Helper function to generate readable labels from column names
const formatColumnName = (columnName: string): string => {
  return columnName
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const AxisLabelConfiguration: React.FC<AxisLabelConfigurationProps> = ({
  xColumn,
  yColumn,
  xAxisLabel,
  setXAxisLabel,
  yAxisLabel,
  setYAxisLabel,
  chartType
}) => {
  // Don't show for charts that don't have traditional axes
  const hideForChartTypes = ['pie', 'treemap', 'kpi', 'heatmap'];
  
  if (hideForChartTypes.includes(chartType)) {
    return null;
  }

  // Generate suggested labels
  const suggestedXLabel = xColumn ? formatColumnName(xColumn) : '';
  const suggestedYLabel = yColumn ? formatColumnName(yColumn) : '';

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Axis Labels</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="xAxisLabel" className="text-xs text-muted-foreground">
                X-Axis Label
              </Label>
              <Input
                id="xAxisLabel"
                placeholder={suggestedXLabel || 'Enter X-axis label'}
                value={xAxisLabel}
                onChange={(e) => setXAxisLabel(e.target.value)}
                className="text-sm"
              />
              {suggestedXLabel && !xAxisLabel && (
                <p className="text-xs text-muted-foreground">
                  Default: {suggestedXLabel}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yAxisLabel" className="text-xs text-muted-foreground">
                Y-Axis Label
              </Label>
              <Input
                id="yAxisLabel"
                placeholder={suggestedYLabel || 'Enter Y-axis label'}
                value={yAxisLabel}
                onChange={(e) => setYAxisLabel(e.target.value)}
                className="text-sm"
              />
              {suggestedYLabel && !yAxisLabel && (
                <p className="text-xs text-muted-foreground">
                  Default: {suggestedYLabel}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
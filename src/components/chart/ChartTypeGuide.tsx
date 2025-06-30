
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ChartTypeInfo, getChartTypeInfo, validateChartRequirements } from '@/lib/chartTypeInfo';
import { ColumnInfo } from '@/pages/Index';

interface ChartTypeGuideProps {
  chartType: string;
  columns: ColumnInfo[];
  xColumn: string;
  yColumn: string;
  dataLength: number;
}

export const ChartTypeGuide = ({ chartType, columns, xColumn, yColumn, dataLength }: ChartTypeGuideProps) => {
  const info = getChartTypeInfo(chartType);
  const validation = validateChartRequirements(chartType, xColumn, yColumn, columns, dataLength);

  if (!info) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Chart type information not available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {info.name}
          {validation.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Requirements</h4>
          <div className="space-y-2">
            {'xAxis' in info.requirements && (
              <div className="flex items-center justify-between">
                <span className="text-sm">{info.requirements.xAxis.label}: {info.requirements.xAxis.type}</span>
                <Badge variant={xColumn ? 'default' : 'destructive'}>
                  {xColumn ? `✓ ${xColumn}` : 'Not selected'}
                </Badge>
              </div>
            )}
            {'yAxis' in info.requirements && (
              <div className="flex items-center justify-between">
                <span className="text-sm">{info.requirements.yAxis.label}: {info.requirements.yAxis.type}</span>
                <Badge variant={yColumn ? 'default' : 'destructive'}>
                  {yColumn ? `✓ ${yColumn}` : 'Not selected'}
                </Badge>
              </div>
            )}
            {'additional' in info.requirements && info.requirements.additional && (
              <div className="space-y-1">
                {info.requirements.additional.map((req, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{req.label}: {req.type}</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!validation.isValid && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {validation.issues.map((issue, index) => (
                  <div key={index}>• {issue}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h4 className="font-medium mb-2">Best For</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {info.bestFor.map((use, index) => (
              <li key={index}>• {use}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2">Examples</h4>
          <div className="flex flex-wrap gap-1">
            {info.examples.map((example, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {example}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

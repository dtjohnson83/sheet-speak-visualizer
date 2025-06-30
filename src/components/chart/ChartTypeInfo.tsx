
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getChartTypeInfo } from '@/lib/chartTypeInfo';

interface ChartTypeInfoProps {
  chartType: string;
}

export const ChartTypeInfo = ({ chartType }: ChartTypeInfoProps) => {
  const info = getChartTypeInfo(chartType);

  if (!info) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Select a chart type to see more information.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{info.name}</CardTitle>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Requirements</h4>
          <div className="space-y-1 text-sm">
            {'xAxis' in info.requirements && (
              <div>
                <strong>{info.requirements.xAxis.label}:</strong> {info.requirements.xAxis.type}
              </div>
            )}
            {'yAxis' in info.requirements && (
              <div>
                <strong>{info.requirements.yAxis.label}:</strong> {info.requirements.yAxis.type}
              </div>
            )}
            {'additional' in info.requirements && info.requirements.additional && (
              <div>
                <strong>Additional:</strong>
                {info.requirements.additional.map((req, index) => (
                  <span key={index}> {req.label} ({req.type})</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Category</h4>
          <Badge variant="secondary">{info.category}</Badge>
        </div>

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

        <div>
          <h4 className="font-medium mb-2">Common Mistakes</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {info.commonMistakes.map((mistake, index) => (
              <li key={index}>• {mistake}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

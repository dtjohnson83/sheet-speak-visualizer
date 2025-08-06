import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChartVisualization } from '@/components/ChartVisualization';
import { UnifiedResponse } from './hooks/useUnifiedAIRouter';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { TrendingUp, BarChart3, Lightbulb, ArrowRight } from 'lucide-react';

interface UnifiedResponseRendererProps {
  response: UnifiedResponse;
  data: DataRow[];
  columns: ColumnInfo[];
  onFollowUpClick: (followUp: string) => void;
  onSaveTile?: (tileData: any) => void;
}

export const UnifiedResponseRenderer: React.FC<UnifiedResponseRendererProps> = ({
  response,
  data,
  columns,
  onFollowUpClick,
  onSaveTile
}) => {
  return (
    <div className="space-y-6">
      {/* Query Header */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {response.query}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Analysis completed at {response.timestamp.toLocaleTimeString()}
              </span>
              <div className="flex gap-1">
                {response.sources.map((source, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Text Insight */}
      {response.textInsight && (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Key Insights</h4>
              <p className="text-foreground leading-relaxed">{response.textInsight}</p>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      {response.kpis && response.kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {response.kpis.map((kpi, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  {kpi.change && (
                    <p className="text-sm text-muted-foreground">{kpi.change}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Chart Visualization */}
      {response.chartSuggestion && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">
              {response.chartSuggestion.title || 'Generated Visualization'}
            </h4>
            {response.chartSuggestion.confidence && (
              <Badge variant="outline">
                {Math.round(response.chartSuggestion.confidence * 100)}% confidence
              </Badge>
            )}
          </div>
          
          <div className="space-y-4">
            {response.chartSuggestion.reasoning && (
              <p className="text-sm text-muted-foreground">
                {response.chartSuggestion.reasoning}
              </p>
            )}
            
            <ChartVisualization
              data={data}
              columns={columns}
              onSaveTile={onSaveTile}
              dataSourceName="Unified Analysis"
            />
          </div>
        </Card>
      )}

      {/* Additional Insights */}
      {response.additionalInsights && response.additionalInsights.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-foreground">Additional Analysis</h4>
          <ul className="space-y-2">
            {response.additionalInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-sm text-muted-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Suggested Follow-ups */}
      {response.suggestedFollowUps && response.suggestedFollowUps.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-foreground">Suggested Follow-up Questions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {response.suggestedFollowUps.map((followUp, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-3 text-left"
                onClick={() => onFollowUpClick(followUp)}
              >
                <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{followUp}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}

      <Separator className="my-6" />
    </div>
  );
};
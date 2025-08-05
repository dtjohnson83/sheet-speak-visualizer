import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChartVisualization } from '@/components/ChartVisualization';
import { useGraphMLVisualization } from '@/hooks/useGraphMLVisualization';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { GraphMLInsight } from '@/lib/graph/GraphMLAnalyzer';
import { 
  BarChart3, 
  Network, 
  ScatterChart, 
  PieChart, 
  TrendingUp,
  Settings,
  Sparkles
} from 'lucide-react';

interface GraphMLVisualizationPanelProps {
  data: DataRow[];
  columns: ColumnInfo[];
  insights: GraphMLInsight[];
  fileName?: string;
}

const CHART_TYPE_OPTIONS = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'network', label: 'Network Graph', icon: Network },
];

export const GraphMLVisualizationPanel: React.FC<GraphMLVisualizationPanelProps> = ({
  data,
  columns,
  insights,
  fileName
}) => {
  const {
    visualizationConfig,
    setVisualizationConfig,
    createVisualizationFromInsights,
    generateAxisLabels
  } = useGraphMLVisualization();

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customChartType, setCustomChartType] = useState('');
  const [customXColumn, setCustomXColumn] = useState('');
  const [customYColumn, setCustomYColumn] = useState('');

  // Auto-generate visualization on mount
  useEffect(() => {
    if (insights.length > 0 && !visualizationConfig) {
      const config = createVisualizationFromInsights(data, columns, insights, fileName);
      setVisualizationConfig(config);
    }
  }, [insights, data, columns, fileName, createVisualizationFromInsights, visualizationConfig]);

  const handleAutoGenerate = () => {
    const config = createVisualizationFromInsights(data, columns, insights, fileName);
    setVisualizationConfig(config);
    setIsCustomMode(false);
  };

  const handleCustomVisualization = () => {
    if (!customChartType || !customXColumn) return;

    const config = {
      chartType: customChartType,
      xColumn: customXColumn,
      yColumn: customYColumn,
      title: `Custom ${customChartType} chart: ${customYColumn || 'Distribution'} by ${customXColumn}`,
      description: `Custom visualization with Graph ML insights context`,
      series: [{
        id: 'custom-series',
        column: customYColumn,
        color: '#8884d8',
        type: 'bar' as const,
        aggregationMethod: 'sum' as const,
        yAxisId: 'left'
      }],
      insights
    };
    setVisualizationConfig(config);
  };

  const categoricalColumns = columns.filter(col => 
    col.type === 'categorical' || col.type === 'text'
  );
  const numericColumns = columns.filter(col => col.type === 'numeric');

  if (!visualizationConfig) {
    return (
      <div className="flex items-center justify-center py-8">
        <Button onClick={handleAutoGenerate} className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span>Generate Smart Visualization</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visualization Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>AI Generated</span>
          </Badge>
          <span className="text-sm text-muted-foreground">
            Based on {insights.length} Graph ML insights
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="flex items-center space-x-1"
          >
            <Settings className="h-3 w-3" />
            <span>Customize</span>
          </Button>
          <Button
            size="sm"
            onClick={handleAutoGenerate}
            className="flex items-center space-x-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>Regenerate</span>
          </Button>
        </div>
      </div>

      {/* Custom Configuration Panel */}
      {isCustomMode && (
        <Card className="p-4 bg-accent/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="chart-type">Chart Type</Label>
              <Select value={customChartType} onValueChange={setCustomChartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="x-column">X Axis</Label>
              <Select value={customXColumn} onValueChange={setCustomXColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.name} value={col.name}>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {col.type}
                        </Badge>
                        <span>{col.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="y-column">Y Axis</Label>
              <Select value={customYColumn} onValueChange={setCustomYColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y column" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.map((col) => (
                    <SelectItem key={col.name} value={col.name}>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {col.type}
                        </Badge>
                        <span>{col.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleCustomVisualization} 
            className="mt-4 w-full"
            disabled={!customChartType || !customXColumn}
          >
            Apply Custom Configuration
          </Button>
        </Card>
      )}

      {/* Chart Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>{visualizationConfig.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {visualizationConfig.description}
          </p>
          
          {/* Insight Context */}
          <div className="flex flex-wrap gap-2 mt-2">
            {insights.slice(0, 3).map((insight) => (
              <Badge key={insight.id} variant="secondary" className="text-xs">
                {insight.type}: {insight.title}
              </Badge>
            ))}
            {insights.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{insights.length - 3} more insights
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-96">
            <ChartVisualization
              data={data}
              columns={columns}
              dataSourceName={fileName}
            />
          </div>
        </CardContent>
      </Card>

      {/* Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {insights.slice(0, 5).map((insight) => (
              <div key={insight.id} className="flex items-start space-x-3 p-3 rounded-lg bg-accent/30">
                <Badge variant="secondary" className="mt-0.5">
                  {insight.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {insight.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(insight.confidence * 100)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
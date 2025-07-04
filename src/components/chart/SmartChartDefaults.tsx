import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, TrendingUp, BarChart3, PieChart, ScatterChart, Activity } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface SmartChartDefaultsProps {
  data: DataRow[];
  columns: ColumnInfo[];
  currentChartType: string;
  onApplyDefaults: (config: {
    chartType: string;
    xColumn: string;
    yColumn: string;
    aggregationMethod: string;
    reasoning: string;
  }) => void;
}

export const SmartChartDefaults = ({ 
  data, 
  columns, 
  currentChartType, 
  onApplyDefaults 
}: SmartChartDefaultsProps) => {
  
  const analyzeDataForDefaults = () => {
    const numericCols = columns.filter(c => c.type === 'numeric');
    const categoricalCols = columns.filter(c => c.type === 'categorical');
    const dateCols = columns.filter(c => c.type === 'date');
    
    const suggestions = [];

    // Time series detection
    if (dateCols.length > 0 && numericCols.length > 0) {
      suggestions.push({
        chartType: 'line',
        xColumn: dateCols[0].name,
        yColumn: numericCols[0].name,
        aggregationMethod: 'sum',
        reasoning: 'Time series data detected - line chart recommended for trends',
        icon: TrendingUp,
        confidence: 0.9
      });
    }

    // Categorical comparison
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      const catCol = categoricalCols[0];
      const uniqueValues = new Set(data.map(row => row[catCol.name])).size;
      
      if (uniqueValues <= 10) {
        suggestions.push({
          chartType: 'bar',
          xColumn: catCol.name,
          yColumn: numericCols[0].name,
          aggregationMethod: 'sum',
          reasoning: `${uniqueValues} categories detected - bar chart ideal for comparison`,
          icon: BarChart3,
          confidence: 0.85
        });
      }
      
      if (uniqueValues <= 6) {
        suggestions.push({
          chartType: 'pie',
          xColumn: catCol.name,
          yColumn: numericCols[0].name,
          aggregationMethod: 'sum',
          reasoning: `${uniqueValues} categories - pie chart shows proportions well`,
          icon: PieChart,
          confidence: 0.75
        });
      }
    }

    // Correlation analysis
    if (numericCols.length >= 2) {
        suggestions.push({
          chartType: 'scatter',
          xColumn: numericCols[0].name,
          yColumn: numericCols[1].name,
          aggregationMethod: 'none',
          reasoning: 'Multiple numeric columns - scatter plot reveals correlations',
          icon: ScatterChart,
          confidence: 0.8
        });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  };

  const suggestions = analyzeDataForDefaults();
  const topSuggestion = suggestions[0];

  // Auto-apply best suggestion if no chart is configured
  useEffect(() => {
    if (topSuggestion && (!currentChartType || currentChartType === 'bar') && data.length > 0) {
      // Auto-apply after a short delay to allow other components to load
      const timer = setTimeout(() => {
        onApplyDefaults(topSuggestion);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [data, currentChartType, topSuggestion, onApplyDefaults]);

  if (suggestions.length === 0) return null;

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600" />
          Smart Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topSuggestion && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/50">
            <Activity className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <topSuggestion.icon className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Recommended:</span>
                  <Badge variant="secondary" className="capitalize">
                    {topSuggestion.chartType}
                  </Badge>
                  <Badge variant="outline">
                    {Math.round(topSuggestion.confidence * 100)}% match
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onApplyDefaults(topSuggestion)}
                  className="ml-2"
                >
                  Apply
                </Button>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {topSuggestion.reasoning}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {suggestions.length > 1 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Other Suggestions:</h4>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.slice(1, 3).map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <suggestion.icon className="h-3 w-3 text-gray-600" />
                    <span className="text-sm capitalize">{suggestion.chartType}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onApplyDefaults(suggestion)}
                    className="text-xs h-6 px-2"
                  >
                    Try
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
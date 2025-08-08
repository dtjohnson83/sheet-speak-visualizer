import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Sparkles, 
  Wand2, 
  TrendingUp, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useAIChartGeneration, AIChartSuggestion } from '@/hooks/useAIChartGeneration';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDomainContext } from '@/hooks/useDomainContext';
import { useToast } from '@/hooks/use-toast';

interface AIChartGeneratorProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onApplySuggestion: (suggestion: AIChartSuggestion) => void;
  currentChartType?: string; // Know what's currently displayed
}

// Add validation for data quality
const validateDataForChart = (
  data: DataRow[], 
  columns: ColumnInfo[]
): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum data requirements
  if (!data || data.length === 0) {
    errors.push('No data available to create a chart');
  }
  
  if (!columns || columns.length === 0) {
    errors.push('No columns defined for the data');
  }

  if (data && data.length < 2) {
    warnings.push('Limited data points may result in less meaningful visualizations');
  }

  // Check for at least one numeric column for most charts
  const hasNumeric = columns.some(col => 
    col.type !== 'categorical' && col.type !== 'text' && col.type !== 'date'
  );
  
  if (!hasNumeric) {
    warnings.push('No numeric columns detected - chart options will be limited');
  }

  // Check for too many unique values in categorical columns
  columns.forEach(col => {
    if (col.type === 'categorical' && col.values) {
      const uniqueValues = new Set(col.values).size;
      if (uniqueValues > 50) {
        warnings.push(`Column "${col.name}" has ${uniqueValues} unique values - consider filtering or grouping`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const AIChartGenerator = ({ 
  data, 
  columns, 
  onApplySuggestion,
  currentChartType 
}: AIChartGeneratorProps) => {
  const { toast } = useToast();
  const { 
    isGenerating, 
    lastSuggestion, 
    generateChartFromQuery, 
    suggestOptimalChart, 
    analyzeData
  } = useAIChartGeneration();
  
  const { domainContext, hasContext } = useDomainContext();
  
  const [query, setQuery] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<AIChartSuggestion[]>([]);

  // Validate data on mount and when data changes
  const validation = validateDataForChart(data, columns);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const handleGenerateFromQuery = async () => {
    if (!query.trim()) {
      setLocalError('Please enter a description of the chart you want to create');
      return;
    }

    if (!validation.isValid) {
      setLocalError(validation.errors[0]);
      return;
    }
    
    setLocalError(null);
    setSuccessMessage(null);
    
    try {
      console.log('Generating chart with query:', query);
      const suggestion = await generateChartFromQuery(query, data, columns);
      
      if (!suggestion) {
        throw new Error('No suggestion returned from AI');
      }

      console.log('Generated suggestion:', suggestion);
      
      // Add to history
      setGenerationHistory(prev => [suggestion, ...prev.slice(0, 4)]);
      
      // Apply the suggestion
      await applySuggestion(suggestion);
      
      // Clear query on success
      setQuery('');
      
    } catch (error) {
      console.error('Failed to generate chart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate chart';
      setLocalError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSuggestOptimal = async () => {
    if (!validation.isValid) {
      setLocalError(validation.errors[0]);
      return;
    }

    setLocalError(null);
    setSuccessMessage(null);
    
    try {
      console.log('Generating optimal chart suggestion');
      const suggestion = suggestOptimalChart(data, columns);
      
      if (!suggestion) {
        throw new Error('Could not determine optimal chart for this data');
      }

      console.log('Optimal suggestion:', suggestion);
      
      // Add to history
      setGenerationHistory(prev => [suggestion, ...prev.slice(0, 4)]);
      
      await applySuggestion(suggestion);
      
    } catch (error) {
      console.error('Failed to suggest optimal chart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to suggest optimal chart';
      setLocalError(errorMessage);
    }
  };

  const applySuggestion = async (suggestion: AIChartSuggestion) => {
    setIsApplying(true);
    
    try {
      // Validate suggestion before applying
      if (!suggestion.chartType) {
        throw new Error('Invalid suggestion: missing chart type');
      }
      
      if (!suggestion.xColumn && !suggestion.yColumn) {
        throw new Error('Invalid suggestion: missing data columns');
      }
      
      console.log('Applying suggestion:', suggestion);
      await onApplySuggestion(suggestion);
      
      setSuccessMessage(`Successfully created ${suggestion.chartType} chart`);
      
      toast({
        title: "Chart Created",
        description: `${suggestion.chartType} chart has been generated successfully`,
      });
      
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply chart suggestion';
      setLocalError(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  const analysis = analyzeData(data, columns);

  // Enhanced domain-specific prompts
  const getQuickPrompts = useCallback(() => {
    const basePrompts = [
      "Show trends over time",
      "Compare categories", 
      "Show distribution",
      "Find correlations",
      "Display proportions",
      "Create 3D visualization"
    ];

    if (!hasContext || !domainContext) return basePrompts;

    const domainPrompts: Record<string, string[]> = {
      finance: [
        "Show revenue trends over time",
        "Compare profit margins by product",
        "Analyze expense breakdown"
      ],
      retail: [
        "Show sales by category",
        "Analyze customer segments",
        "Track inventory levels"
      ],
      manufacturing: [
        "Monitor production output",
        "Show quality metrics",
        "Compare efficiency rates"
      ],
      healthcare: [
        "Analyze patient outcomes",
        "Track admission rates",
        "Show treatment effectiveness"
      ],
      marketing: [
        "Compare campaign ROI",
        "Show conversion funnel",
        "Analyze channel performance"
      ]
    };

    const specific = domainPrompts[domainContext.domain] || [];
    return [...specific.slice(0, 3), ...basePrompts];
  }, [hasContext, domainContext]);

  const quickPrompts = getQuickPrompts();

  return (
    <Card className="mb-6 bg-card border border-border rounded-md">
      <CardHeader>
      <CardTitle className="flex items-center gap-2 text-foreground text-xl font-medium">
        <Sparkles className="h-5 w-5 text-primary" />
        AI Chart Generation
        {hasContext && (
          <Badge variant="outline" className="text-xs">
            {domainContext?.domain}
          </Badge>
        )}
        {currentChartType && (
          <Badge variant="secondary" className="text-xs ml-auto">
            Current: {currentChartType}
          </Badge>
        )}
      </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Warnings */}
        {validation.warnings.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Data Notes</AlertTitle>
            <AlertDescription>
              <ul className="text-sm mt-2 space-y-1">
                {validation.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {localError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{localError}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Natural Language Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Describe your chart:
          </label>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your chart…"
              className="flex-1 focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-0 transition-shadow"
              disabled={!validation.isValid || isGenerating || isApplying}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateFromQuery();
                }
              }}
            />
            <Button 
              onClick={handleGenerateFromQuery}
              disabled={!query.trim() || isGenerating || isApplying || !validation.isValid}
              className="px-5 hover-scale"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : isApplying ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Applying...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Enter to generate</p>
        </div>

        {/* Quick Prompts */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick suggestions:</label>
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-1 -mx-1 px-1 scrollbar-thin">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(prompt)}
                disabled={isGenerating || isApplying}
                className="text-xs rounded-full hover-scale hover:bg-primary hover:text-primary-foreground shrink-0"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSuggestOptimal}
            variant="default"
            size="sm"
            disabled={isGenerating || isApplying || !validation.isValid}
            className="flex items-center gap-2 hover-scale"
          >
            <TrendingUp className="h-4 w-4" />
            Generate Insight
          </Button>
          <span className="text-sm text-muted-foreground">
            AI will analyze your data and create the optimal visualization
          </span>
        </div>

        {/* Generation History */}
        {generationHistory.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recent generations:</label>
            <div className="space-y-2">
              {generationHistory.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {suggestion.chartType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.reasoning?.substring(0, 50)}...
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Analysis Insights */}
        <Collapsible open={showAnalysis} onOpenChange={setShowAnalysis}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between"
              disabled={!data || data.length === 0}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Data Insights & Recommendations
                {analysis && (
                  <Badge variant="secondary" className="text-xs">
                    {Object.keys(analysis.dataTypes).length} columns analyzed
                  </Badge>
                )}
              </div>
              {showAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {/* Analysis content remains the same */}
            {analysis && (
              <>
                <div>
                  <h4 className="font-medium text-sm mb-2">Data Characteristics:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(analysis.dataTypes).map(([col, type]) => (
                      <div key={col} className="flex items-center justify-between text-xs p-2 border rounded">
                        <span className="truncate">{col}</span>
                        <Badge variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.patterns.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Detected Patterns:</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {analysis.patterns.map((pattern, index) => (
                        <li key={index}>• {pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm mb-2">Suggested Chart Types:</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.bestChartTypes.map((type, index) => (
                      <Badge 
                        key={index} 
                        variant={type === currentChartType ? "default" : "secondary"} 
                        className="text-xs capitalize cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          // Generate chart of this type
                          setQuery(`Create a ${type} chart`);
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Last Suggestion Display - Enhanced */}
        {lastSuggestion && (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <strong>Last AI Suggestion:</strong>
                  <Badge variant="secondary" className="capitalize">
                    {lastSuggestion.chartType}
                  </Badge>
                  <Badge variant="outline">
                    {Math.round(lastSuggestion.confidence * 100)}% confident
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{lastSuggestion.reasoning}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>X: {lastSuggestion.xColumn || 'Auto'}</span>
                  <span>•</span>
                  <span>Y: {lastSuggestion.yColumn || 'Auto'}</span>
                  <span>•</span>
                  <span>Aggregation: {lastSuggestion.aggregationMethod || 'None'}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => applySuggestion(lastSuggestion)}
                  disabled={isApplying}
                  className="mt-2"
                >
                  Apply This Suggestion
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

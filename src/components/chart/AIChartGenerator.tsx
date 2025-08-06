import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Wand2, TrendingUp, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useAIChartGeneration, AIChartSuggestion } from '@/hooks/useAIChartGeneration';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDomainContext } from '@/hooks/useDomainContext';

interface AIChartGeneratorProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onApplySuggestion: (suggestion: AIChartSuggestion) => void;
}

export const AIChartGenerator = ({ data, columns, onApplySuggestion }: AIChartGeneratorProps) => {
  const { isGenerating, lastSuggestion, generateChartFromQuery, suggestOptimalChart, analyzeData } = useAIChartGeneration();
  const { domainContext, hasContext } = useDomainContext();
  const [query, setQuery] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleGenerateFromQuery = async () => {
    if (!query.trim()) return;
    
    try {
      const suggestion = await generateChartFromQuery(query, data, columns);
      // Auto-apply the suggestion for seamless experience
      onApplySuggestion(suggestion);
    } catch (error) {
      console.error('Failed to generate chart:', error);
    }
  };

  const handleSuggestOptimal = () => {
    const suggestion = suggestOptimalChart(data, columns);
    onApplySuggestion(suggestion);
  };

  const analysis = analyzeData(data, columns);

  // Quick suggestion prompts - customized based on domain context
  const getQuickPrompts = () => {
    const basePrompts = [
      "Show me trends over time",
      "Compare categories by value", 
      "Show the distribution of data",
      "Find relationships between variables",
      "Display proportions as percentages",
      "Create a 3D visualization",
      "Show 3D scatter plot",
      "Display 3D bar chart"
    ];

    if (!hasContext || !domainContext) return basePrompts;

    // Add domain-specific prompts
    const domainPrompts: Record<string, string[]> = {
      finance: ["Show revenue trends", "Compare profit margins", "Analyze cost breakdown"],
      retail: ["Show sales performance", "Analyze customer segments", "Track conversion rates"],
      manufacturing: ["Monitor production metrics", "Show quality trends", "Compare efficiency rates"],
      healthcare: ["Analyze patient outcomes", "Track performance metrics", "Show resource utilization"],
      marketing: ["Compare campaign performance", "Show engagement trends", "Analyze conversion funnel"]
    };

    const specific = domainPrompts[domainContext.domain] || [];
    return [...specific, ...basePrompts];
  };

  const quickPrompts = getQuickPrompts();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Chart Generation
          {hasContext && (
            <Badge variant="outline" className="text-xs">
              {domainContext?.domain}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Natural Language Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe the chart you want to create:</label>
          <div className="flex gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Show me sales trends over time' or 'Compare revenue by region'"
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={handleGenerateFromQuery}
              disabled={!query.trim() || isGenerating}
              className="px-6"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick suggestions:</label>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(prompt)}
                className="text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* One-click optimal chart */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSuggestOptimal}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Auto-Generate Best Chart
          </Button>
          <span className="text-sm text-muted-foreground">AI will analyze your data and create the optimal visualization</span>
        </div>

        {/* Data Analysis Insights */}
        <Collapsible open={showAnalysis} onOpenChange={setShowAnalysis}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Data Insights & Recommendations
              </div>
              {showAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Data Characteristics:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysis.dataTypes).map(([col, type]) => (
                  <div key={col} className="flex items-center justify-between text-xs">
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
                  <Badge key={index} variant="secondary" className="text-xs capitalize">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Last Suggestion Display */}
        {lastSuggestion && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <strong>AI Suggestion:</strong>
                  <Badge variant="secondary" className="capitalize">
                    {lastSuggestion.chartType}
                  </Badge>
                  <Badge variant="outline">
                    {Math.round(lastSuggestion.confidence * 100)}% confident
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{lastSuggestion.reasoning}</p>
                <div className="text-xs text-muted-foreground">
                  X: {lastSuggestion.xColumn} | Y: {lastSuggestion.yColumn} | Aggregation: {lastSuggestion.aggregationMethod}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
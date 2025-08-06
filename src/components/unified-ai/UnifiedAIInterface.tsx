import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Sparkles, RotateCcw, Download } from 'lucide-react';
import { useUnifiedAIRouter } from './hooks/useUnifiedAIRouter';
import { useUnifiedContext } from './hooks/useUnifiedContext';
import { UnifiedResponseRenderer } from './UnifiedResponseRenderer';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { toast } from 'sonner';

interface UnifiedAIInterfaceProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
  onSaveTile?: (tileData: any) => void;
}

export const UnifiedAIInterface: React.FC<UnifiedAIInterfaceProps> = ({
  data,
  columns,
  fileName,
  onSaveTile
}) => {
  const [currentQuery, setCurrentQuery] = useState('');
  const { isProcessing, lastResponse, processUnifiedQuery } = useUnifiedAIRouter({ data, columns });
  const { sessionHistory, addToContext, getRelevantContext, clearContext, exportSession } = useUnifiedContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuery.trim() || isProcessing) return;

    try {
      const context = getRelevantContext(currentQuery);
      const queryWithContext = context ? `${context}\n\nCurrent question: ${currentQuery}` : currentQuery;
      
      const response = await processUnifiedQuery(queryWithContext);
      addToContext(currentQuery, response);
      setCurrentQuery('');
      
      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Error processing query:', error);
      toast.error('Failed to process your question. Please try again.');
    }
  };

  const handleFollowUpClick = (followUp: string) => {
    setCurrentQuery(followUp);
  };

  const handleExportSession = () => {
    const session = exportSession();
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analysis-session-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Session exported successfully');
  };

  const sampleQuestions = [
    "What are our key performance metrics?",
    "Show me trends over time",
    "Which categories perform best?",
    "Compare performance across segments",
    "What patterns can you identify?"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI Data Assistant</h2>
              <p className="text-muted-foreground">
                Ask any question about your data and get comprehensive insights with visualizations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sessionHistory.length > 0 && (
              <>
                <Badge variant="outline">
                  {sessionHistory.length} queries
                </Badge>
                <Button variant="outline" size="sm" onClick={handleExportSession}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={clearContext}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Query Input */}
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="Ask any question about your data..."
              className="flex-1"
              disabled={isProcessing}
            />
            <Button type="submit" disabled={!currentQuery.trim() || isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Sample Questions */}
          {!lastResponse && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuery(question)}
                    disabled={isProcessing}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Analyzing your data and generating insights...</span>
          </div>
        </Card>
      )}

      {/* Response Display */}
      {lastResponse && !isProcessing && (
        <ScrollArea className="max-h-[800px]">
          <UnifiedResponseRenderer
            response={lastResponse}
            data={data}
            columns={columns}
            onFollowUpClick={handleFollowUpClick}
            onSaveTile={onSaveTile}
          />
        </ScrollArea>
      )}

      {/* Session History Preview */}
      {sessionHistory.length > 1 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-foreground">Previous Questions</h4>
          <div className="space-y-2">
            {sessionHistory.slice(-3).map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start h-auto p-2 text-left w-full"
                onClick={() => setCurrentQuery(item.query)}
              >
                <span className="text-sm text-muted-foreground truncate">
                  {item.query}
                </span>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
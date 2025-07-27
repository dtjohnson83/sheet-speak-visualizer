
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useUserRole } from '@/hooks/useUserRole';
import { Send, Bot, User, Sparkles, BarChart3, FileDown, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useDomainContext, EnhancedAIContextData } from '@/hooks/useDomainContext';
import { exportAIChatToPDF } from '@/utils/pdf';
import { DataSamplingInfo } from '@/components/transparency/DataSamplingInfo';
import { AIResponseDisclaimer } from '@/components/transparency/AIResponseDisclaimer';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { ChatbotToneSelector } from '@/components/ai-chat/ChatbotToneSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIDataChatProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
  enhancedContext?: any;
  onSuggestVisualization?: (suggestion: {
    chartType: string;
    xColumn: string;
    yColumn?: string;
    title: string;
  }) => void;
}

export const AIDataChat = ({ data, columns, fileName, enhancedContext, onSuggestVisualization }: AIDataChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<DataRow[]>(data);
  const [filterSummary, setFilterSummary] = useState<string>(`All ${data.length.toLocaleString()} rows`);
  const [selectedToneId, setSelectedToneId] = useState('direct-efficient');
  const { toast } = useToast();
  const { usesRemaining, isLoading: usageLoading, decrementUsage } = useUsageTracking();
  const { isAdmin } = useUserRole();
  const { buildAIContext, hasContext } = useDomainContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Enhanced sample questions based on actual data columns
  const sampleQuestions = [
    "What are the key patterns in this data?",
    columns.length > 0 ? `Analyze the distribution of ${columns[0].name}` : "Show me the data distribution",
    "What correlations do you see between variables?",
    "What visualization would best represent this data?",
    "Are there any outliers or anomalies in the data?"
  ];

  useEffect(() => {
    // Add contextual welcome message based on actual data
    if (messages.length === 0 && data.length > 0) {
      const columnTypes = columns.reduce((acc, col) => {
        acc[col.type] = (acc[col.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const contextualInfo = Object.entries(columnTypes)
        .map(([type, count]) => `${count} ${type}`)
        .join(', ');

      const dataQuality = columns.length > 0 ? 
        Math.round((columns.reduce((acc, col) => {
          const nonNull = col.values.filter(v => v !== null && v !== undefined && v !== '').length;
          return acc + (nonNull / col.values.length);
        }, 0) / columns.length) * 100) : 0;

      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `I'm analyzing your ${fileName || 'dataset'} with ${data.length.toLocaleString()} rows and ${columns.length} columns (${contextualInfo}). Data quality: ${dataQuality}% complete.

${hasContext ? '✅ Domain context available for deeper insights.' : '💡 Tip: Complete the domain survey for more relevant analysis.'}

Ask me specific questions about patterns, trends, or relationships in your data!`,
        timestamp: new Date()
      }]);
    }
  }, [data.length, columns.length, messages.length, fileName, hasContext]);

  // Update filtered data when source data changes
  useEffect(() => {
    setFilteredData(data);
    setFilterSummary(`All ${data.length.toLocaleString()} rows`);
  }, [data]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check usage limit before proceeding
    const canProceed = await decrementUsage();
    if (!canProceed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build comprehensive data context with enhanced statistics
      const sampleSize = isAdmin ? Math.min(100, filteredData.length) : Math.min(10, filteredData.length);
      const dataContext = await buildAIContext(filteredData, columns, fileName, sampleSize, isAdmin);

      // Validate data context has required fields
      if (!dataContext.columns || !dataContext.sampleData) {
        throw new Error('Invalid data context: missing columns or sample data');
      }

      // Prepare messages for AI (exclude welcome message)
      const chatMessages = messages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      chatMessages.push({
        role: 'user',
        content: userMessage.content
      });

      console.log('Sending AI chat request with context:', {
        dataContextColumns: dataContext.columns.length,
        sampleDataRows: dataContext.sampleData.length,
        totalRows: dataContext.totalRows,
        hasEnhancedContext: !!dataContext.domainContext
      });

      const { data: response, error } = await supabase.functions.invoke('ai-data-chat', {
        body: {
          messages: chatMessages,
          dataContext,
          toneId: selectedToneId
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze your data. Please try rephrasing your question or check your data format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const askSampleQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleExportToPDF = async () => {
    if (messages.length === 0) {
      toast({
        title: "No Messages",
        description: "There are no messages to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportAIChatToPDF(messages, fileName);
      toast({
        title: "Export Successful",
        description: "Chat conversation exported to PDF successfully.",
      });
    } catch (error) {
      console.error('Error exporting chat to PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export chat to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check for data quality issues
  const dataQualityIssues = columns.filter(col => {
    const nonNull = col.values.filter(v => v !== null && v !== undefined && v !== '').length;
    return (nonNull / col.values.length) < 0.5; // Less than 50% complete
  });

  if (data.length === 0) {
    return (
      <Card className="p-6 text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-gray-600">Upload data to start chatting with your AI analyst.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Range Filter */}
      <DateRangeFilter
        data={data}
        columns={columns}
        onFilteredDataChange={(filtered, summary) => {
          setFilteredData(filtered);
          setFilterSummary(summary);
        }}
      />

      {/* Data Quality Alert */}
      {dataQualityIssues.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Data quality notice: {dataQualityIssues.length} columns have significant missing values. 
            This may affect analysis accuracy. Columns: {dataQualityIssues.map(col => col.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Data Chat
            {isAdmin && (
              <Badge variant="default" className="text-xs bg-purple-500">
                Admin Mode - Enhanced Analysis
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <ChatbotToneSelector 
              selectedToneId={selectedToneId}
              onToneChange={setSelectedToneId}
            />
            {messages.length > 1 && (
              <Button
                onClick={handleExportToPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
            )}
            {hasContext && (
              <Badge variant="default" className="text-xs bg-green-600">
                Domain Context
              </Badge>
            )}
            <DataSamplingInfo 
              totalRows={filteredData.length} 
              sampleSize={isAdmin ? Math.min(filteredData.length, 100) : Math.min(10, filteredData.length)} 
              columns={columns}
              analysisType="chat"
            />
            {!usageLoading && !isAdmin && (
              <Badge variant={usesRemaining > 0 ? "secondary" : "destructive"}>
                {usesRemaining} uses remaining
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600">
            Get specific, data-driven insights from your dataset. I'll analyze patterns, trends, and provide visualization suggestions.
            {filteredData.length !== data.length && (
              <span className="font-medium"> Currently analyzing: {filterSummary}</span>
            )}
          </p>
          <AIResponseDisclaimer 
            sampleSize={isAdmin ? Math.min(filteredData.length, 100) : Math.min(10, filteredData.length)} 
            totalRows={filteredData.length} 
            confidenceLevel={
              filteredData.length > 1000 ? 'high' : 
              filteredData.length > 100 ? 'medium' : 'low'
            }
            analysisType="chat"
          />
        </div>
      </div>

      <Card className="h-96 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask specific questions about your data..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputValue.trim() || usesRemaining <= 0}
              size="icon"
              title={usesRemaining <= 0 ? "No AI uses remaining" : "Send message"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {messages.length <= 1 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Try asking specific questions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sampleQuestions.map((question, index) => (
              <Card 
                key={index}
                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => askSampleQuestion(question)}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">{question}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

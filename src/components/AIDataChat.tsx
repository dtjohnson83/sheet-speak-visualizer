
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Send, Bot, User, Sparkles, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useEnhancedAIContext, AIContextData } from '@/hooks/useEnhancedAIContext';

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
  const { toast } = useToast();
  const { usesRemaining, isLoading: usageLoading, decrementUsage } = useUsageTracking();
  const { buildAIContext, hasEnhancedContext } = useEnhancedAIContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample questions based on data
  const sampleQuestions = [
    "What patterns do you see in this data?",
    "What's the best way to visualize this data?",
    "Show me the distribution of values",
    "What insights can you find?",
    "How should I group this data for analysis?"
  ];

  useEffect(() => {
    // Add welcome message when component mounts
    if (messages.length === 0 && data.length > 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm your AI data analyst. I can see you have ${data.length} rows of data with ${columns.length} columns. What would you like to explore or visualize?`,
        timestamp: new Date()
      }]);
    }
  }, [data.length, columns.length, messages.length]);

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
      // Prepare enhanced data context for AI
      const dataContext = buildAIContext(data, columns, fileName, 10);

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

      const { data: response, error } = await supabase.functions.invoke('ai-data-chat', {
        body: {
          messages: chatMessages,
          dataContext
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
        title: "Error",
        description: "Failed to get AI response. Please try again.",
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Data Chat
          </h3>
          <div className="flex items-center gap-2">
            {hasEnhancedContext && (
              <Badge variant="default" className="text-xs">
                Enhanced AI
              </Badge>
            )}
            {!usageLoading && (
              <Badge variant={usesRemaining > 0 ? "secondary" : "destructive"}>
                {usesRemaining} uses remaining
              </Badge>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          Ask questions about your data and get intelligent insights and visualization suggestions.
        </p>
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
              placeholder="Ask about your data..."
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
          <h4 className="text-sm font-medium mb-2">Try asking:</h4>
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

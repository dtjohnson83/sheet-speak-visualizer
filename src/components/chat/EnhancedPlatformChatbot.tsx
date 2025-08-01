import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, X, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAIResponseGenerator, AIResponseData } from '@/hooks/useAIResponseGenerator';
import { AITextResponse, AIKPIResponse, AIChartResponse, AIMixedResponse } from '@/components/ai-responses/AIResponseComponents';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: PlatformContext;
  aiResponse?: AIResponseData;
}

interface PlatformContext {
  currentRoute: string;
  hasData: boolean;
  userWorkflow: string;
  isAdmin: boolean;
  data?: DataRow[];
  columns?: ColumnInfo[];
}

interface EnhancedPlatformChatbotProps {
  data?: DataRow[];
  columns?: ColumnInfo[];
  className?: string;
}

export const EnhancedPlatformChatbot: React.FC<EnhancedPlatformChatbotProps> = ({ data, columns, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'general' | 'codebase'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const aiResponseGenerator = useAIResponseGenerator({ 
    data: data || [], 
    columns: columns || [] 
  });

  const platformContext = useMemo<PlatformContext>(() => ({
    currentRoute: location.pathname,
    hasData: Boolean(data && data.length > 0),
    userWorkflow: 'data_analysis',
    isAdmin: isAdmin || false,
    data,
    columns
  }), [location.pathname, isAdmin, data, columns]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      context: platformContext
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let assistantMessage: ChatMessage;

      // If we have data and the mode is general, try AI response generation first
      if (data && data.length > 0 && chatMode === 'general') {
        try {
          const aiResponse = await aiResponseGenerator.generateResponse(inputValue);
          
          assistantMessage = {
            role: 'assistant',
            content: aiResponse.textContent || 'Here\'s what I found:',
            timestamp: new Date(),
            aiResponse
          };
        } catch (aiError) {
          console.error('AI response generation failed, falling back to platform chatbot:', aiError);
          // Fall back to platform chatbot
          const response = await supabase.functions.invoke('platform-chatbot', {
            body: {
              message: inputValue,
              context: platformContext,
              conversationHistory: messages.slice(-5)
            }
          });

          if (response.error) {
            throw new Error(response.error.message);
          }

          assistantMessage = {
            role: 'assistant',
            content: response.data.response || 'I apologize, but I encountered an error processing your request.',
            timestamp: new Date()
          };
        }
      } else {
        // Use platform chatbot for codebase questions or when no data
        const response = await supabase.functions.invoke('platform-chatbot', {
          body: {
            message: inputValue,
            context: platformContext,
            conversationHistory: messages.slice(-5)
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        assistantMessage = {
          role: 'assistant',
          content: response.data.response || 'I apologize, but I encountered an error processing your request.',
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, platformContext, messages, data, chatMode, aiResponseGenerator]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const quickQuestions = useMemo(() => {
    if (chatMode === 'codebase') {
      return [
        "How do I add a new chart type?",
        "What are the available AI features?",
        "How does the data processing work?",
        "Explain the authentication system"
      ];
    }
    
    if (data && data.length > 0) {
      return [
        "What's the total revenue?",
        "Show me sales by region",
        "Create a 3D visualization",
        "What trends do you see?"
      ];
    }
    
    return [
      "What data do I have available?",
      "Show me insights about my data",
      "How can I create better visualizations?",
      "What patterns can you detect?"
    ];
  }, [chatMode, data]);

  const handleQuickQuestion = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 h-12 w-12 rounded-full p-0 shadow-lg ${className}`}
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-96 h-[500px] shadow-xl z-50 ${className}`}>
      <CardContent className="flex flex-col h-full p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span className="font-semibold">AI Assistant</span>
            {data && data.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {data.length} rows
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isAdmin && (
          <Tabs value={chatMode} onValueChange={(value) => setChatMode(value as 'general' | 'codebase')} className="px-4 py-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="codebase">Codebase</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm">
                <p className="mb-4">Hi! I'm your AI assistant. Ask me anything about your data or the platform.</p>
                <div className="space-y-2">
                  {quickQuestions.slice(0, 2).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user' ? '' : 'w-full max-w-none'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {message.aiResponse ? (
                        <div>
                          {message.aiResponse.type === 'text' && (
                            <AITextResponse content={message.aiResponse.textContent || message.content} />
                          )}
                          {message.aiResponse.type === 'kpi' && message.aiResponse.kpiData && (
                            <AIKPIResponse {...message.aiResponse.kpiData} />
                          )}
                          {message.aiResponse.type === 'chart' && message.aiResponse.chartData && (
                            <AIChartResponse {...message.aiResponse.chartData} />
                          )}
                          {message.aiResponse.type === 'mixed' && (
                            <AIMixedResponse 
                              textContent={message.aiResponse.textContent}
                              kpiData={message.aiResponse.kpiData}
                              chartData={message.aiResponse.chartData}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      )}
                      <p className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
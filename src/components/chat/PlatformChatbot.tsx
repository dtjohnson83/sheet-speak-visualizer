import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, X, Send, HelpCircle, Code, Cpu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { useUserRole } from '@/hooks/useUserRole';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    route: string;
    component?: string;
    userState?: any;
  };
}

interface PlatformContext {
  route: string;
  component?: string;
  userWorkflow?: string;
  dataLoaded: boolean;
  chartType?: string;
  isAdmin?: boolean;
  chatMode?: 'general' | 'codebase';
}

export const PlatformChatbot = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'general' | 'codebase'>('general');
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  // Get platform context
  const platformContext = React.useMemo<PlatformContext>(() => ({
    route: location.pathname,
    dataLoaded: document.querySelector('[data-has-data="true"]') !== null,
    chartType: document.querySelector('[data-chart-type]')?.getAttribute('data-chart-type') || undefined,
    userWorkflow: location.pathname.includes('/dashboard') ? 'dashboard' : 
                  location.pathname.includes('/charts') ? 'visualization' : 'general',
    isAdmin,
    chatMode
  }), [location.pathname, isAdmin, chatMode]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Reset messages when switching chat modes
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
    }
  }, [chatMode, isOpen]);

  // Add welcome message when first opened or mode changes
  useEffect(() => {
    if (isOpen && messages.length === 0 && !roleLoading) {
      const welcomeContent = chatMode === 'codebase' 
        ? `Hi! I'm your codebase assistant. I can help you with technical aspects of the platform:

• Component architecture and relationships
• File structure and organization
• API endpoints and data flow
• Database schema and queries
• Security considerations
• Performance optimization
• Implementation details

What technical aspect would you like to explore?`
        : `Hi! I'm your platform assistant. I can help you with:

• How to use features and workflows
• Troubleshooting common issues  
• Discovering new capabilities
• Navigation and best practices

What would you like to know?`;

      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
        context: platformContext
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, platformContext, chatMode, roleLoading]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      context: platformContext
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      logger.info('Platform chatbot query', { 
        query: inputValue.trim(), 
        context: platformContext 
      }, 'PlatformChatbot');

      const { data, error } = await supabase.functions.invoke('platform-chatbot', {
        body: {
          message: inputValue.trim(),
          context: platformContext,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        context: platformContext
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error('Platform chatbot error', error, 'PlatformChatbot');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try rephrasing your question or contact support if the issue persists.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, platformContext, messages]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const quickQuestions = React.useMemo(() => {
    if (chatMode === 'codebase') {
      return [
        "Show me the component architecture",
        "How is user authentication implemented?",
        "What's the database schema structure?", 
        "How do charts get rendered?",
        "What are the main API endpoints?"
      ];
    }
    return [
      "How do I create a new visualization?",
      "What chart types are available?", 
      "How do I upload data?",
      "How do I save my dashboard?",
      "What are AI agents?"
    ];
  }, [chatMode]);

  const handleQuickQuestion = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] max-h-[80vh] shadow-xl z-50 flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {chatMode === 'codebase' ? (
            <Code className="h-5 w-5 text-primary" />
          ) : (
            <MessageCircle className="h-5 w-5 text-primary" />
          )}
          {chatMode === 'codebase' ? 'Codebase Assistant' : 'Platform Assistant'}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
        {isAdmin && (
          <Tabs value={chatMode} onValueChange={(value: 'general' | 'codebase') => setChatMode(value)} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                General Help
              </TabsTrigger>
              <TabsTrigger value="codebase" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Codebase Chat
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        <ScrollArea className="flex-1 pr-4 min-h-0 max-h-[calc(100vh-200px)]">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Quick questions:</p>
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-2 px-3"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex gap-2 pt-4 flex-shrink-0 border-t bg-background">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={chatMode === 'codebase' 
              ? "Ask about code architecture, files, APIs..." 
              : "Ask me anything about the platform..."}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

PlatformChatbot.displayName = 'PlatformChatbot';
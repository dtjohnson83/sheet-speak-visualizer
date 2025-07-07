import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug, ExternalLink } from 'lucide-react';
import { sanitizeError } from '@/lib/security';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout?: NodeJS.Timeout;

  public state: State = {
    hasError: false,
    errorId: '',
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Enhanced error logging with context
    logger.error('Error caught by enhanced boundary', { 
      message: sanitizeError(error),
      componentStack: errorInfo.componentStack?.substring(0, 1000),
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 200),
      url: window.location.href,
    });

    // Store error info in state for detailed display
    this.setState({ errorInfo });

    // Call parent error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in error handler', { 
          message: sanitizeError(handlerError) 
        });
      }
    }

    // Set up automatic retry for certain error types
    if (this.shouldAutoRetry(error) && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    const retryableErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'Network Error',
      'fetch',
    ];
    
    return retryableErrors.some(pattern => 
      error.message?.includes(pattern) || error.name?.includes(pattern)
    );
  }

  private scheduleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, this.state.retryCount) * 1000;
    
    this.retryTimeout = setTimeout(() => {
      logger.info('Auto-retrying after error', { 
        errorId: this.state.errorId,
        retryCount: this.state.retryCount + 1,
        delay 
      });
      
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleManualRetry = () => {
    logger.info('Manual retry triggered', { 
      errorId: this.state.errorId,
      retryCount: this.state.retryCount 
    });
    
    this.setState({ 
      hasError: false, 
      error: undefined,
      errorInfo: undefined,
      retryCount: 0, // Reset retry count on manual retry
    });
  };

  private handleReportError = () => {
    const errorData = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack?.substring(0, 2000),
      componentStack: this.state.errorInfo?.componentStack?.substring(0, 1000),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // In a real app, this would send to an error reporting service
    logger.error('User reported error', errorData);
    
    // Copy error details to clipboard
    navigator.clipboard?.writeText(JSON.stringify(errorData, null, 2))
      .then(() => {
        // Could show a toast notification here
        console.log('Error details copied to clipboard');
      })
      .catch(() => {
        console.log('Failed to copy error details');
      });
  };

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRetryableError = this.state.error ? this.shouldAutoRetry(this.state.error) : false;
      const sanitizedMessage = sanitizeError(this.state.error);

      return (
        <Card className="max-w-2xl mx-auto mt-8 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Application Error
            </CardTitle>
            <CardDescription>
              An unexpected error occurred. Error ID: <code className="text-xs">{this.state.errorId}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded">
              <p className="text-sm font-medium text-destructive mb-2">Error Details:</p>
              <p className="text-sm text-destructive/80 font-mono">
                {sanitizedMessage}
              </p>
            </div>

            {/* Retry Information */}
            {isRetryableError && this.state.retryCount < this.maxRetries && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  Auto-retry {this.state.retryCount + 1}/{this.maxRetries} in progress...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={this.handleManualRetry} 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleReportError}
                className="flex items-center gap-2"
              >
                <Bug className="h-4 w-4" />
                Report Error
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Reload Page
              </Button>
            </div>

            {/* Development Information */}
            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Developer Details (Click to expand)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded overflow-auto text-xs">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Help Text */}
            <div className="text-xs text-muted-foreground">
              If this error persists, try refreshing the page or clearing your browser cache.
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
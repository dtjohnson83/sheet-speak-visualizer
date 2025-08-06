import React from 'react';

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
    
    // Log additional context for ReferenceErrors
    if (error.name === 'ReferenceError' && error.message.includes('before initialization')) {
      console.error('ReferenceError detected - likely variable access before initialization in useMemo/useCallback');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Chart rendering error</p>
            <p className="text-sm">Unable to display this chart type with the current data</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
import { AlertTriangle, FileX, Wifi, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  type?: 'file' | 'network' | 'validation' | 'general';
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorMessage = ({ 
  type = 'general', 
  title, 
  message, 
  details, 
  onRetry, 
  retryLabel = 'Try Again' 
}: ErrorMessageProps) => {
  const getIcon = () => {
    switch (type) {
      case 'file':
        return <FileX className="h-5 w-5" />;
      case 'network':
        return <Wifi className="h-5 w-5" />;
      case 'validation':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'file':
        return 'File Processing Error';
      case 'network':
        return 'Connection Error';
      case 'validation':
        return 'Data Validation Error';
      default:
        return 'Error';
    }
  };

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 space-y-2">
          <AlertTitle className="text-red-800 dark:text-red-200">
            {title || getDefaultTitle()}
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">
            {message}
            {details && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium hover:underline">
                  Show details
                </summary>
                <div className="mt-1 text-sm opacity-90 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  {details}
                </div>
              </details>
            )}
          </AlertDescription>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

// Specific error message variants
export const FileErrorMessage = ({ message, details, onRetry }: Omit<ErrorMessageProps, 'type'>) => (
  <ErrorMessage type="file" message={message} details={details} onRetry={onRetry} />
);

export const NetworkErrorMessage = ({ message, details, onRetry }: Omit<ErrorMessageProps, 'type'>) => (
  <ErrorMessage type="network" message={message} details={details} onRetry={onRetry} />
);

export const ValidationErrorMessage = ({ message, details, onRetry }: Omit<ErrorMessageProps, 'type'>) => (
  <ErrorMessage type="validation" message={message} details={details} onRetry={onRetry} />
);
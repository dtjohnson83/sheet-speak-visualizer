import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card'; 
import { logger } from '@/lib/logger';

export const DebugPanel = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleDebugMode = () => {
    logger.toggleDebugMode();
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2"
      >
        Debug
      </Button>
      
      {isVisible && (
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-sm">Debug Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDebugMode}
              className="w-full"
            >
              Toggle Debug Logging
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
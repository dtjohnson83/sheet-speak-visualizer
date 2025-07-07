import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

interface SessionManager {
  addCleanupFunction: (cleanup: () => void) => void;
  removeCleanupFunction: (cleanup: () => void) => void;
  clearAll: () => void;
}

export const useSecureSessionManager = (): SessionManager => {
  const cleanupFunctions = useRef<Set<() => void>>(new Set());
  const isActive = useRef(true);

  const addCleanupFunction = (cleanup: () => void) => {
    if (!isActive.current) return;
    cleanupFunctions.current.add(cleanup);
  };

  const removeCleanupFunction = (cleanup: () => void) => {
    cleanupFunctions.current.delete(cleanup);
  };

  const clearAll = () => {
    if (!isActive.current) return;
    
    const errors: Error[] = [];
    
    cleanupFunctions.current.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        errors.push(error as Error);
        logger.error('Error during cleanup', { message: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
    
    cleanupFunctions.current.clear();
    
    if (errors.length > 0) {
      logger.warn(`${errors.length} cleanup functions failed`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActive.current = false;
      clearAll();
    };
  }, []);

  // Cleanup on page visibility change (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden, cleanup non-essential resources
        logger.debug('Page hidden, running partial cleanup');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Cleanup on memory pressure (if available)
  useEffect(() => {
    if ('memory' in performance && 'addEventListener' in window) {
      const handleMemoryPressure = () => {
        logger.warn('Memory pressure detected, running cleanup');
        clearAll();
      };

      // @ts-ignore - memory events are not standard yet
      window.addEventListener('memory-pressure', handleMemoryPressure);
      return () => {
        // @ts-ignore
        window.removeEventListener('memory-pressure', handleMemoryPressure);
      };
    }
  }, []);

  return {
    addCleanupFunction,
    removeCleanupFunction,
    clearAll,
  };
};
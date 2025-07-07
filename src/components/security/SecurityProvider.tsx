import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecureSessionManager } from '@/hooks/useSecureSessionManager';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { cleanupRateLimits } from '@/lib/security';
import { logger } from '@/lib/logger';

interface SecurityContextValue {
  sessionManager: ReturnType<typeof useSecureSessionManager>;
  auth: ReturnType<typeof useSecureAuth>;
}

const SecurityContext = createContext<SecurityContextValue | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const sessionManager = useSecureSessionManager();
  const auth = useSecureAuth();

  useEffect(() => {
    // Set up periodic cleanup of rate limiting data
    const cleanupInterval = setInterval(() => {
      cleanupRateLimits();
    }, 5 * 60 * 1000); // Every 5 minutes

    sessionManager.addCleanupFunction(() => {
      clearInterval(cleanupInterval);
    });

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [sessionManager]);

  useEffect(() => {
    // Monitor performance and log security-relevant metrics
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        // Log slow operations that might indicate security issues
        if (entry.duration > 5000) {
          logger.warn('Slow operation detected', {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType,
          });
        }
      });
    });

    try {
      performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      
      sessionManager.addCleanupFunction(() => {
        performanceObserver.disconnect();
      });
    } catch (error) {
      logger.debug('Performance observer not supported');
    }

    return () => {
      performanceObserver.disconnect();
    };
  }, [sessionManager]);

  useEffect(() => {
    // Set up security event listeners
    const handleSecurityError = (event: ErrorEvent) => {
      logger.error('Security-related error detected', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason?.toString(),
      });
    };

    window.addEventListener('error', handleSecurityError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    sessionManager.addCleanupFunction(() => {
      window.removeEventListener('error', handleSecurityError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    });

    return () => {
      window.removeEventListener('error', handleSecurityError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [sessionManager]);

  const value: SecurityContextValue = {
    sessionManager,
    auth,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
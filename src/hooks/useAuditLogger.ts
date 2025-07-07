import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { sanitizeText } from '@/lib/security';

interface AuditLogEntry {
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}

interface SensitiveOperation {
  category: 'auth' | 'data' | 'file' | 'admin' | 'security';
  action: string;
  resource: string;
  details?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const useAuditLogger = () => {
  const { user } = useAuth();

  // Get basic client information for audit trails
  const getClientInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent.substring(0, 200),
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer || 'direct'
    };
  }, []);

  // Log authentication events
  const logAuthEvent = useCallback((action: string, details?: Record<string, any>) => {
    const auditEntry: AuditLogEntry = {
      action: sanitizeText(action),
      resource: 'authentication',
      details: {
        userId: user?.id || 'anonymous',
        email: user?.email ? sanitizeText(user.email) : undefined,
        ...details,
        ...getClientInfo()
      },
      timestamp: Date.now()
    };

    logger.audit('Authentication event', auditEntry);
  }, [user, getClientInfo]);

  // Log data access events
  const logDataEvent = useCallback((action: string, resource: string, details?: Record<string, any>) => {
    const auditEntry: AuditLogEntry = {
      action: sanitizeText(action),
      resource: sanitizeText(resource),
      details: {
        userId: user?.id,
        ...details,
        ...getClientInfo()
      },
      timestamp: Date.now()
    };

    logger.audit('Data access event', auditEntry);
  }, [user, getClientInfo]);

  // Log file operations
  const logFileEvent = useCallback((action: string, filename: string, details?: Record<string, any>) => {
    const auditEntry: AuditLogEntry = {
      action: sanitizeText(action),
      resource: 'file',
      details: {
        userId: user?.id,
        filename: sanitizeText(filename),
        ...details,
        ...getClientInfo()
      },
      timestamp: Date.now()
    };

    logger.audit('File operation event', auditEntry);
  }, [user, getClientInfo]);

  // Log administrative actions
  const logAdminEvent = useCallback((action: string, details?: Record<string, any>) => {
    const auditEntry: AuditLogEntry = {
      action: sanitizeText(action),
      resource: 'admin',
      details: {
        userId: user?.id,
        adminEmail: user?.email ? sanitizeText(user.email) : undefined,
        ...details,
        ...getClientInfo()
      },
      timestamp: Date.now()
    };

    logger.audit('Administrative action', auditEntry);
  }, [user, getClientInfo]);

  // Log security events
  const logSecurityEvent = useCallback((action: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', details?: Record<string, any>) => {
    const auditEntry: AuditLogEntry = {
      action: sanitizeText(action),
      resource: 'security',
      details: {
        userId: user?.id || 'anonymous',
        severity,
        ...details,
        ...getClientInfo()
      },
      timestamp: Date.now()
    };

    logger.security('Security event', auditEntry);
  }, [user, getClientInfo]);

  // Generic sensitive operation logger
  const logSensitiveOperation = useCallback((operation: SensitiveOperation) => {
    const auditEntry: AuditLogEntry = {
      action: sanitizeText(operation.action),
      resource: sanitizeText(operation.resource),
      details: {
        userId: user?.id,
        category: operation.category,
        severity: operation.severity || 'medium',
        ...operation.details,
        ...getClientInfo()
      },
      timestamp: Date.now()
    };

    // Route to appropriate logger based on severity
    if (operation.severity === 'critical' || operation.category === 'security') {
      logger.security('Critical operation', auditEntry);
    } else {
      logger.audit('Sensitive operation', auditEntry);
    }
  }, [user, getClientInfo]);

  // Log error events with context
  const logErrorEvent = useCallback((error: Error | string, context?: Record<string, any>) => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    const auditEntry: AuditLogEntry = {
      action: 'error_occurred',
      resource: 'application',
      details: {
        userId: user?.id,
        error: sanitizeText(errorMessage).substring(0, 500),
        stack: error instanceof Error ? error.stack?.substring(0, 1000) : undefined,
        ...context,
        ...getClientInfo()
      },
      timestamp: Date.now()
    };

    logger.error('Application error', auditEntry);
  }, [user, getClientInfo]);

  // Log user session events
  const logSessionEvent = useCallback((action: string, details?: Record<string, any>) => {
    const auditEntry: AuditLogEntry = {
      action: sanitizeText(action),
      resource: 'session',
      details: {
        userId: user?.id,
        sessionId: user?.id ? `session_${user.id.substring(0, 8)}` : 'anonymous',
        ...details,
        ...getClientInfo()
      },
      timestamp: Date.now()
    };

    logger.audit('Session event', auditEntry);
  }, [user, getClientInfo]);

  return {
    logAuthEvent,
    logDataEvent,
    logFileEvent,
    logAdminEvent,
    logSecurityEvent,
    logSensitiveOperation,
    logErrorEvent,
    logSessionEvent,
    getClientInfo
  };
};

// Common audit log patterns for easy use
export const AuditActions = {
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  EMAIL_CHANGE: 'email_change',
  
  // Data operations
  DATA_VIEW: 'data_view',
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  DATA_DELETE: 'data_delete',
  DATA_MODIFY: 'data_modify',
  
  // File operations
  FILE_UPLOAD: 'file_upload',
  FILE_DOWNLOAD: 'file_download',
  FILE_DELETE: 'file_delete',
  FILE_SHARE: 'file_share',
  
  // Admin operations
  USER_CREATE: 'user_create',
  USER_DELETE: 'user_delete',
  PERMISSION_CHANGE: 'permission_change',
  SYSTEM_CONFIG: 'system_config',
  
  // Security events
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  MALICIOUS_CONTENT: 'malicious_content_detected'
} as const;
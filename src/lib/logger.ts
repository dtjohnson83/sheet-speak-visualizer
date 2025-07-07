type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  component?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isDebugMode = localStorage.getItem('debug-mode') === 'true';

  private formatMessage(level: LogLevel, message: string, data?: any, component?: string): string {
    const timestamp = new Date().toISOString();
    const componentTag = component ? `[${component}]` : '';
    // Sanitize message to prevent sensitive data leakage
    const sanitizedMessage = this.sanitizeLogMessage(message);
    return `${timestamp} ${level.toUpperCase()} ${componentTag} ${sanitizedMessage}`;
  }

  private sanitizeLogMessage(message: string): string {
    if (!message) return '';
    
    // Remove sensitive patterns from log messages
    const sensitivePatterns = [
      /token[s]?[:\s]*[a-zA-Z0-9\-_\.]+/gi,
      /key[s]?[:\s]*[a-zA-Z0-9\-_\.]+/gi,
      /password[s]?[:\s]*[^\s]+/gi,
      /secret[s]?[:\s]*[a-zA-Z0-9\-_\.]+/gi,
      /authorization[:\s]*[^\s]+/gi,
      /bearer\s+[a-zA-Z0-9\-_\.]+/gi,
    ];
    
    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    
    return sanitized;
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // Only log data in development mode and sanitize sensitive fields
    if (!this.isDevelopment) return '[DATA_REDACTED_IN_PRODUCTION]';
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      const sensitiveKeys = ['password', 'token', 'key', 'secret', 'authorization', 'bearer'];
      
      Object.keys(sanitized).forEach(key => {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) {
      return level === 'error' || level === 'warn';
    }
    return this.isDebugMode || level !== 'debug';
  }

  error(message: string, data?: any, component?: string): void {
    if (this.shouldLog('error')) {
      const sanitizedData = this.sanitizeData(data);
      console.error(this.formatMessage('error', message, sanitizedData, component), sanitizedData || '');
    }
  }

  warn(message: string, data?: any, component?: string): void {
    if (this.shouldLog('warn')) {
      const sanitizedData = this.sanitizeData(data);
      console.warn(this.formatMessage('warn', message, sanitizedData, component), sanitizedData || '');
    }
  }

  info(message: string, data?: any, component?: string): void {
    if (this.shouldLog('info')) {
      const sanitizedData = this.sanitizeData(data);
      console.info(this.formatMessage('info', message, sanitizedData, component), sanitizedData || '');
    }
  }

  debug(message: string, data?: any, component?: string): void {
    if (this.shouldLog('debug')) {
      const sanitizedData = this.sanitizeData(data);
      console.log(this.formatMessage('debug', message, sanitizedData, component), sanitizedData || '');
    }
  }

  // Audit logging for compliance and monitoring
  audit(message: string, data?: any, component?: string): void {
    const sanitizedData = this.sanitizeData(data);
    // Always log audit events regardless of environment
    console.log(this.formatMessage('info', `[AUDIT] ${message}`, sanitizedData, component), sanitizedData || '');
    
    // In production, send to audit logging service
    if (!this.isDevelopment) {
      this.sendToAuditService(message, sanitizedData, component);
    }
  }

  // Security logging for threats and violations
  security(message: string, data?: any, component?: string): void {
    const sanitizedData = this.sanitizeData(data);
    // Always log security events
    console.warn(this.formatMessage('warn', `[SECURITY] ${message}`, sanitizedData, component), sanitizedData || '');
    
    // In production, send to security monitoring service
    if (!this.isDevelopment) {
      this.sendToSecurityService(message, sanitizedData, component);
    }
  }

  private sendToAuditService(message: string, data?: any, component?: string): void {
    // Placeholder for audit service integration
    // In a real implementation, this would send to a secure audit logging service
    try {
      // Example: POST to audit endpoint
      // await fetch('/api/audit', { method: 'POST', body: JSON.stringify({ message, data, component }) });
    } catch (error) {
      console.error('Failed to send audit log', error);
    }
  }

  private sendToSecurityService(message: string, data?: any, component?: string): void {
    // Placeholder for security monitoring integration
    // In a real implementation, this would send to a security monitoring service
    try {
      // Example: POST to security endpoint
      // await fetch('/api/security', { method: 'POST', body: JSON.stringify({ message, data, component }) });
    } catch (error) {
      console.error('Failed to send security log', error);
    }
  }

  toggleDebugMode(): void {
    this.isDebugMode = !this.isDebugMode;
    localStorage.setItem('debug-mode', this.isDebugMode.toString());
    console.log(`Debug mode ${this.isDebugMode ? 'enabled' : 'disabled'}`);
  }
}

export const logger = new Logger();

// Utility functions for common logging patterns
export const logChartOperation = (operation: string, data?: any, component?: string) => {
  logger.debug(`Chart ${operation}`, data, component);
};

export const logDataProcessing = (operation: string, data?: any, component?: string) => {
  logger.debug(`Data ${operation}`, data, component);
};

export const logUserInteraction = (action: string, data?: any, component?: string) => {
  logger.info(`User ${action}`, data, component);
};
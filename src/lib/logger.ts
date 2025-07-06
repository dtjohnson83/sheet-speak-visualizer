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
    return `${timestamp} ${level.toUpperCase()} ${componentTag} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) {
      return level === 'error' || level === 'warn';
    }
    return this.isDebugMode || level !== 'debug';
  }

  error(message: string, data?: any, component?: string): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data, component), data || '');
    }
  }

  warn(message: string, data?: any, component?: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data, component), data || '');
    }
  }

  info(message: string, data?: any, component?: string): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data, component), data || '');
    }
  }

  debug(message: string, data?: any, component?: string): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data, component), data || '');
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
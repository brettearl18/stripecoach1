type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  message: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    if (level === 'debug' && !this.isDevelopment) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...(metadata && { metadata })
    };

    switch (level) {
      case 'error':
        console.error(logData);
        break;
      case 'warn':
        console.warn(logData);
        break;
      case 'debug':
        console.debug(logData);
        break;
      default:
        console.log(logData);
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }
}

// Export a singleton instance
export const logger = new Logger(); 
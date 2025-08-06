// Logger implementation
import { 
  Logger, 
  LogLevel, 
  LogEntry, 
  LoggerConfig, 
  LogTransport,
  PerformanceTimer
} from './types';
import { generateRequestId } from '../utils/request-id';

// Console transport for development
class ConsoleTransport implements LogTransport {
  async log(entry: LogEntry): Promise<void> {
    const { level, message, timestamp, context, data, error } = entry;
    
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;
    const logMessage = `${prefix} ${message}`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, error || data);
        if (error?.stack) {
          console.error('Stack trace:', error.stack);
        }
        break;
    }
  }
  
  async flush(): Promise<void> {
    // Console doesn't need flushing
  }
}

// Remote transport for production logging
class RemoteTransport implements LogTransport {
  private buffer: LogEntry[] = [];
  private config: LoggerConfig;
  
  constructor(config: LoggerConfig) {
    this.config = config;
    
    // Auto-flush on interval
    if (config.flushInterval > 0) {
      setInterval(() => {
        this.flush();
      }, config.flushInterval);
    }
  }
  
  async log(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);
    
    // Auto-flush when buffer is full
    if (this.buffer.length >= this.config.bufferSize) {
      await this.flush();
    }
  }
  
  async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) {
      return;
    }
    
    const logs = [...this.buffer];
    this.buffer = [];
    
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs })
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to send logs to remote endpoint:', error);
      // Re-add logs to buffer for retry
      this.buffer.unshift(...logs);
    }
  }
}

// Main logger implementation
export class AppLogger implements Logger {
  private config: LoggerConfig;
  private transports: LogTransport[] = [];
  private timers: Map<string, PerformanceTimer> = new Map();
  private contextData: Record<string, any> = {};
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      bufferSize: 100,
      flushInterval: 30000, // 30 seconds
      includeStackTrace: true,
      maxLogSize: 10000,
      ...config
    };
    
    this.initializeTransports();
  }
  
  private initializeTransports(): void {
    if (this.config.enableConsole) {
      this.transports.push(new ConsoleTransport());
    }
    
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.transports.push(new RemoteTransport(this.config));
    }
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }
  
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
    context?: string,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message: this.truncateMessage(message),
      timestamp: new Date().toISOString(),
      context: context || this.contextData.context,
      requestId: this.contextData.requestId,
      userId: this.contextData.userId,
      sessionId: this.contextData.sessionId,
      component: this.contextData.component,
      action: this.contextData.action
    };
    
    if (data) {
      entry.data = this.sanitizeData(data);
    }
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.config.includeStackTrace ? error.stack : undefined
      };
    }
    
    return entry;
  }
  
  private truncateMessage(message: string): string {
    if (message.length <= this.config.maxLogSize) {
      return message;
    }
    
    return message.substring(0, this.config.maxLogSize) + '... [truncated]';
  }
  
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    // Remove sensitive data
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
  
  private async writeLog(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) {
      return;
    }
    
    const promises = this.transports.map(transport => 
      transport.log(entry).catch(error => 
        console.error('Transport error:', error)
      )
    );
    
    await Promise.all(promises);
  }
  
  // Public methods
  debug(message: string, data?: Record<string, any>, context?: string): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data, context);
    this.writeLog(entry);
  }
  
  info(message: string, data?: Record<string, any>, context?: string): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, data, context);
    this.writeLog(entry);
  }
  
  warn(message: string, data?: Record<string, any>, context?: string): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, data, context);
    this.writeLog(entry);
  }
  
  error(message: string, error?: Error, data?: Record<string, any>, context?: string): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, data, context, error);
    this.writeLog(entry);
  }
  
  time(label: string): void {
    this.timers.set(label, {
      label,
      startTime: performance.now()
    });
  }
  
  timeEnd(label: string): void {
    const timer = this.timers.get(label);
    if (!timer) {
      this.warn(`Timer "${label}" not found`);
      return;
    }
    
    const endTime = performance.now();
    const duration = endTime - timer.startTime;
    
    timer.endTime = endTime;
    timer.duration = duration;
    
    this.info(`Timer "${label}" completed`, { duration: `${duration.toFixed(2)}ms` });
    this.timers.delete(label);
  }
  
  async flush(): Promise<void> {
    const promises = this.transports.map(transport => transport.flush());
    await Promise.all(promises);
  }
  
  clear(): void {
    this.timers.clear();
    this.contextData = {};
  }
  
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }
  
  setContext(context: string): Logger {
    const newLogger = new AppLogger(this.config);
    newLogger.contextData = { ...this.contextData, context };
    newLogger.transports = this.transports;
    return newLogger;
  }
  
  setRequestId(requestId: string): Logger {
    const newLogger = new AppLogger(this.config);
    newLogger.contextData = { ...this.contextData, requestId };
    newLogger.transports = this.transports;
    return newLogger;
  }
  
  // Additional utility methods
  setUserId(userId: string): Logger {
    const newLogger = new AppLogger(this.config);
    newLogger.contextData = { ...this.contextData, userId };
    newLogger.transports = this.transports;
    return newLogger;
  }
  
  setComponent(component: string): Logger {
    const newLogger = new AppLogger(this.config);
    newLogger.contextData = { ...this.contextData, component };
    newLogger.transports = this.transports;
    return newLogger;
  }
  
  setAction(action: string): Logger {
    const newLogger = new AppLogger(this.config);
    newLogger.contextData = { ...this.contextData, action };
    newLogger.transports = this.transports;
    return newLogger;
  }
}

// Create and export default logger instance
const defaultConfig: Partial<LoggerConfig> = {
  level: import.meta.env.MODE === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: import.meta.env.MODE === 'production',
  remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT
};

export const logger = new AppLogger(defaultConfig);

// Export factory function for creating custom loggers
export function createLogger(config: Partial<LoggerConfig>): Logger {
  return new AppLogger(config);
}
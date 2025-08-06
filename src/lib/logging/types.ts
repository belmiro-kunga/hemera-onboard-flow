// Logging system types

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  bufferSize: number;
  flushInterval: number;
  includeStackTrace: boolean;
  maxLogSize: number;
}

export interface LogTransport {
  log(entry: LogEntry): Promise<void>;
  flush(): Promise<void>;
}

export interface PerformanceTimer {
  label: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface Logger {
  debug(message: string, data?: Record<string, any>, context?: string): void;
  info(message: string, data?: Record<string, any>, context?: string): void;
  warn(message: string, data?: Record<string, any>, context?: string): void;
  error(message: string, error?: Error, data?: Record<string, any>, context?: string): void;
  time(label: string): void;
  timeEnd(label: string): void;
  flush(): Promise<void>;
  clear(): void;
  setLevel(level: LogLevel): void;
  setContext(context: string): Logger;
  setRequestId(requestId: string): Logger;
  setUserId(userId: string): Logger;
  setComponent(component: string): Logger;
  setAction(action: string): Logger;
}
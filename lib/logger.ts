import fs from 'fs';
import path from 'path';

// 日誌級別
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// 日誌配置
const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
const LOG_FILE = process.env.LOG_FILE || './logs/app.log';

// 確保日誌目錄存在
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日誌顏色
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 日誌級別名稱
const levelNames = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.DEBUG]: 'DEBUG'
};

// 日誌級別顏色
const levelColors = {
  [LogLevel.ERROR]: colors.red,
  [LogLevel.WARN]: colors.yellow,
  [LogLevel.INFO]: colors.green,
  [LogLevel.DEBUG]: colors.blue
};

// 寫入檔案日誌
function writeToFile(level: LogLevel, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const levelName = levelNames[level];
  const logEntry = {
    timestamp,
    level: levelName,
    message,
    data: data || null
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  
  try {
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// 控制台輸出
function consoleOutput(level: LogLevel, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const levelName = levelNames[level];
  const color = levelColors[level];
  
  let output = `${color}[${levelName}]${colors.reset} ${timestamp} - ${message}`;
  
  if (data) {
    output += `\n${color}Data:${colors.reset} ${JSON.stringify(data, null, 2)}`;
  }
  
  console.log(output);
}

// 主日誌函數
function log(level: LogLevel, message: string, data?: any) {
  if (level <= LOG_LEVEL) {
    consoleOutput(level, message, data);
    writeToFile(level, message, data);
  }
}

// 日誌類別
export class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  error(message: string, data?: any) {
    log(LogLevel.ERROR, `[${this.context}] ${message}`, data);
  }

  warn(message: string, data?: any) {
    log(LogLevel.WARN, `[${this.context}] ${message}`, data);
  }

  info(message: string, data?: any) {
    log(LogLevel.INFO, `[${this.context}] ${message}`, data);
  }

  debug(message: string, data?: any) {
    log(LogLevel.DEBUG, `[${this.context}] ${message}`, data);
  }

  // API 請求日誌
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string) {
    this.info('API Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId
    });
  }

  // 認證日誌
  logAuth(action: string, email: string, success: boolean, ip?: string) {
    this.info('Authentication', {
      action,
      email,
      success,
      ip
    });
  }

  // 資料庫操作日誌
  logDatabase(operation: string, table: string, duration: number, success: boolean) {
    this.debug('Database Operation', {
      operation,
      table,
      duration: `${duration}ms`,
      success
    });
  }

  // 錯誤日誌
  logError(error: Error, context?: string) {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context: context || this.context
    });
  }
}

// 預設日誌實例
export const logger = new Logger();

// 建立特定上下文的日誌實例
export function createLogger(context: string): Logger {
  return new Logger(context);
} 
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private format(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any) {
    console.log(`\x1b[36m${this.format('info', message, meta)}\x1b[0m`);
  }

  warn(message: string, meta?: any) {
    console.warn(`\x1b[33m${this.format('warn', message, meta)}\x1b[0m`);
  }

  error(message: string, meta?: any) {
    console.error(`\x1b[31m${this.format('error', message, meta)}\x1b[0m`);
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[90m${this.format('debug', message, meta)}\x1b[0m`);
    }
  }
}

export const logger = new Logger();

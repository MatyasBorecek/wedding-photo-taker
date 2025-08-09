import winston from 'winston';
import path from 'path';
import { appConfig } from '../config/index.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: appConfig.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'wedding-photo-taker' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'error.log'), 
      level: 'error' 
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'combined.log') 
    })
  ]
});

// If we're not in production, also log to the console
if (appConfig.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream object for Morgan
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Helper functions for logging with request context
const logWithContext = (level: string, req: any, message: string, meta?: any) => {
  const context = {
    url: req?.originalUrl || req?.url,
    method: req?.method,
    ip: req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress,
    userId: req?.user?._id,
    ...meta
  };
  
  logger.log(level, message, context);
};

export default {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  stream,
  logWithContext,
  errorWithContext: (req: any, message: string, meta?: any) => logWithContext('error', req, message, meta),
  warnWithContext: (req: any, message: string, meta?: any) => logWithContext('warn', req, message, meta),
  infoWithContext: (req: any, message: string, meta?: any) => logWithContext('info', req, message, meta),
  debugWithContext: (req: any, message: string, meta?: any) => logWithContext('debug', req, message, meta)
};
import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../error/api.js';
import {appConfig} from '../config/index.js';
import logger from '../utils/logger.js';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = (err as any).errors;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
  } else if (err instanceof SyntaxError) {
    statusCode = 400;
    message = 'Invalid JSON';
  }

  // Log errors with appropriate levels
  if (statusCode >= 500) {
    // Server errors
    logger.errorWithContext(req, `Server Error: ${message}`, {
      statusCode,
      details,
      stack: err.stack,
      error: err.name
    });
  } else if (statusCode >= 400) {
    // Client errors
    logger.warnWithContext(req, `Client Error: ${message}`, {
      statusCode,
      details,
      error: err.name
    });
  } else {
    // Other errors
    logger.infoWithContext(req, `Other Error: ${message}`, {
      statusCode,
      details,
      error: err.name
    });
  }

  res.status(statusCode).json({
    error: {
      code: statusCode,
      message,
      details,
      ...(appConfig.NODE_ENV === 'development' && {stack: err.stack}),
    },
  });
};

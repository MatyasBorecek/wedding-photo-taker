import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {appConfig} from '../config/index.js';
import {ApiError} from '../error/api.js';
import {isAuthenticatedRequest} from "../helper/jwt.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!isAuthenticatedRequest(req)) {
    return next(new ApiError('Invalid request obtained', 401));
  }

  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new ApiError('Authentication required', 401));
  }

  try {
    req.user = jwt.verify(token, appConfig.JWT_SECRET) as any;
    next();
  } catch (err) {
    next(new ApiError('Invalid token', 401));
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!isAuthenticatedRequest(req)) {
    return next(new ApiError('Invalid request obtained', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError('Admin access required', 403));
  }
  next();
};
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {appConfig} from '../config/index.js';
import {ApiError} from '../error/api.js';
import {isAuthenticatedRequest} from "../helper/jwt.js";
import AuthenticatedRequest from "../interface/authenticated-request";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!await isAuthenticatedRequest(req)) {
    return next(new ApiError('Invalid request obtained', 401));
  }

  const authReq = req as AuthenticatedRequest;
  const token = authReq.cookies.token || authReq.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new ApiError('Authentication required', 401));
  }

  try {
    authReq.user = jwt.verify(token, appConfig.JWT_SECRET) as any;
    next();
  } catch (err) {
    next(new ApiError('Invalid token', 401));
  }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!await isAuthenticatedRequest(req)) {
    return next(new ApiError('Invalid request obtained', 401));
  }

  const authReq = req as AuthenticatedRequest;
  if (authReq.user.role !== 'admin') {
    return next(new ApiError('Admin access required', 403));
  }
  next();
};
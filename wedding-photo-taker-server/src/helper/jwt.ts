import jwt from 'jsonwebtoken';
import {appConfig} from '../config/index.js';
import {Request} from "express";
import AuthenticatedRequest from "../interface/authenticated-request.js";
import {AuthService} from "../service/auth.js";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, appConfig.JWT_SECRET, {expiresIn: '7d'});
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, appConfig.JWT_SECRET);
};

export const isAuthenticatedRequest = async (req: Request): Promise<boolean> => {
  if ('user' in req) return true;

  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, appConfig.JWT_SECRET) as { id: string };

    const user = await new AuthService().validateUser(decoded.id);

    (req as AuthenticatedRequest).user = {id: user.id, role: user.role};

    return true;
  } catch (err) {
    return false;
  }
};
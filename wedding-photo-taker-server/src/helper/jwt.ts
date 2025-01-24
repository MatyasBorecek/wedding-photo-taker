import jwt from 'jsonwebtoken';
import {appConfig} from '../config/index.js';
import {Request} from "express";
import AuthenticatedRequest from "../interface/authenticated-request.js";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, appConfig.JWT_SECRET, {expiresIn: '7d'});
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, appConfig.JWT_SECRET);
};

export const isAuthenticatedRequest = (req: Request): req is AuthenticatedRequest => {
  return 'user' in req;
}